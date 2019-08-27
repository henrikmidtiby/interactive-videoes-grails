package dk.sdu.tekvideo

import grails.converters.JSON
import org.grails.web.converters.exceptions.ConverterException
import org.grails.web.json.JSONArray
import org.grails.web.json.JSONException
import org.grails.web.json.JSONObject
import org.hibernate.SessionFactory
import org.springframework.http.HttpStatus
import org.springframework.validation.FieldError

import static dk.sdu.tekvideo.ServiceResult.*

/**
 * Provides services for course management. These services generally require a teacher to be authenticated. Teachers
 * are also generally only allowed to operator on their own courses.
 *
 * @author Dan Thrane
 */
class CourseManagementService {
    def userService
    def messageSource
    SessionFactory sessionFactory

    ServiceResult<List<CourseSummary>> getCompleteCourseSummary() {
        def teacher = userService.authenticatedTeacher
        if (!teacher) return fail(message: "Not allowed", suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value())

        def query = $/
            SELECT c.id, c.full_name, c.name, c.description, c.year, c.spring, COUNT(cs.subject_id)
            FROM
              course c LEFT OUTER JOIN course_subject cs ON c.id = cs.course_id,
              subject s
            WHERE
              c.teacher_id = :teacher AND
              (s.id = cs.subject_id OR cs.subject_id IS NULL) AND
              (s.local_status != 'TRASH' OR s.local_status IS NULL)
            GROUP BY
              c.id, c.full_name, c.name, c.description, c.year, c.spring;
        /$
        List<List> results = sessionFactory.currentSession
                .createSQLQuery(query)
                .setParameter("teacher", teacher.id)
                .list()

        return ok(results.collect {
            new CourseSummary(
                    courseId: it[0],
                    fullName: it[1],
                    name: it[2],
                    description: it[3],
                    year: it[4],
                    spring: it[5],
                    activeSubjectCount: it[6]
            )
        })
    }

    /**
     * Returns the courses owned by the current teacher in a format jsTree will understand.
     */
    List<Map> getJsTreeCourses() {
        def summary = getCompleteCourseSummary()
        if (!summary.success) return Collections.emptyList()
        def results = summary.result

        return results.collect {
            [
                    id      : it.courseId,
                    text    : it.fullName,
                    children: it.activeSubjectCount > 0,
                    type    : "course"
            ]
        }
    }

    List<Map> getJsTreeSubjects(Course course) {
        def teacher = userService.authenticatedTeacher
        if (!teacher) return Collections.emptyList()

        def query = $/
            SELECT cs.subject_id, s.name, COUNT(se.exercise_id)
            FROM
              course_subject cs LEFT OUTER JOIN subject_exercise se ON (cs.subject_id = se.subject_id),
              subject s, course c, exercise e
            WHERE cs.course_id = :course AND
              cs.subject_id = s.id AND
              cs.course_id = c.id AND
              c.teacher_id = :teacher AND
                  (se.exercise_id = e.id OR se.exercise_id IS NULL) AND
                  (e.local_status = 'VISIBLE' OR e.local_status IS NULL)

            GROUP BY cs.subject_id, s.name, cs.weight
            ORDER BY cs.weight;
        /$

        List<List> results = sessionFactory.currentSession
                .createSQLQuery(query)
                .setParameter("course", course.id)
                .setParameter("teacher", teacher.id)
                .list()

        return results.collect {
            [
                    id      : it[0],
                    text    : it[1],
                    children: it[2] > 0,
                    type    : "subject"
            ]
        }
    }

    List<Map> getJsTreeExercises(Subject subject) {
        def videos = getExercises(NodeStatus.VISIBLE, subject)
        if (videos.success) {
            return videos.result.collect {
                [
                        id      : it.id,
                        text    : it.name,
                        children: false,
                        type    : it.class.simpleName.toLowerCase()
                ]
            }
        } else {
            return Collections.emptyList()
        }
    }

    /**
     * Finds courses belonging to the authenticated teacher of the given status. If there is no authenticated teacher,
     * then this method will fail.
     *
     * @param status The node status to look for
     * @return A list of courses or failure
     */
    ServiceResult<List<Course>> getCourses(NodeStatus status) {
        def teacher = userService.authenticatedTeacher
        if (teacher) {
            ok Course.findAllByTeacherAndLocalStatus(teacher, status)
        } else {
            fail "teacherservice.no_teacher"
        }
    }

    /**
     * Finds subjects belonging to the authenticated teacher of the given status. If there is no authenticated teacher,
     * then this method will fail.
     *
     * @param status The node status to look for
     * @return A list of subjects or failure
     */
    ServiceResult<List<Subject>> getSubjects(NodeStatus status, Course course) {
        if (canAccess(course)) {
            ok Subject.executeQuery("""
                SELECT s
                FROM CourseSubject cs INNER JOIN cs.subject s
                WHERE cs.course = :course AND s.localStatus = :status
                ORDER BY cs.weight
            """, [course: course, status: status])
        } else {
            fail "teacherservice.no_teacher"
        }
    }

    /**
     * Finds videos belonging to the authenticated teacher of the given status. If there is no authenticated teacher,
     * then this method will fail.
     *
     * @param status The node status to look for
     * @return A list of videos or failure
     */
    ServiceResult<List<Exercise>> getExercises(NodeStatus status, Subject subject) {
        if (canAccessNode(subject)) {
            ok subject.getAllExercisesByStatus(status)
        } else {
            fail "teacherservice.no_teacher"
        }
    }

    /**
     * Finds all courses that are not marked as TRASH for the authenticated teacher. If there is no authenticated
     * teacher, then this method will fail.
     *
     * @return A list of courses or failure
     */
    ServiceResult<List<Course>> getActiveCourses() {
        def teacher = userService.authenticatedTeacher
        if (teacher) {
            ok Course.findAllByTeacherAndLocalStatusNotEqual(teacher, NodeStatus.TRASH)
        } else {
            fail "teacherservice.no_teacher"
        }
    }

    /**
     * Creates, or edits an existing, subject belonging to a course. This is only possible to do if the authenticated
     * user is the teacher of the supplied course (and subject, if given), if not this method will fail.
     *
     * @param course The course to add the subject to
     * @param command The CRUD command for the subject
     * @return If successful the newly created/existing subject
     */
    ServiceResult<Subject> createOrEditSubject(Course course, SubjectCRUDCommand command) {
        if (!canAccess(course)) {
            return fail([
                    message            : "Ikke tilladt",
                    suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value()
            ])
        }

        command.domain.localStatus = command.visible ? NodeStatus.VISIBLE : NodeStatus.INVISIBLE
        if (!command.domain.validate()) {
            return fail([
                    message            : "Dårlig besked",
                    suggestedHttpStatus: HttpStatus.BAD_REQUEST.value(),
                    information        : [errors: getFieldsErrors(command.domain)]
            ])
        }

        command.domain.save()
        if (!command.isEditing) {
            CourseSubject.create(course, command.domain, [save: true])
        }
        return ok(command.domain)
    }

    /**
     * Creates, or edits an existing, course. This is only possible to do if the authenticated user is a teacher.
     * If not this method will fail.
     *
     * @param command The CRUD command
     * @return If successful the newly created/existing course
     */
    ServiceResult<Course> createOrEditCourse(CourseCRUDCommand command) {
        def teacher = userService.authenticatedTeacher
        if (!teacher || (command.isEditing && !canAccess(command.domain))) {
            return fail([
                    message            : "Ikke tilladt",
                    suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value()
            ])
        }

        command.domain.teacher = teacher
        command.domain.localStatus = command.visible ? NodeStatus.VISIBLE : NodeStatus.INVISIBLE

        if (!command.domain.validate()) {
            return fail([
                    message            : "Dårlig besked",
                    suggestedHttpStatus: HttpStatus.BAD_REQUEST.value(),
                    information        : [errors: getFieldsErrors(command.domain)]
            ])
        }

        command.domain.save()
        return ok(command.domain)
    }

    private List<Map<String, ?>> getFieldsErrors(validatedWithErrors) {
        List<FieldError> errors = validatedWithErrors.errors.fieldErrors
        Locale locale = Locale.availableLocales.find { it.country == "DK" } ?: Locale.getDefault()
        return errors.collect {
            [
                    field  : it.field,
                    message: messageSource.getMessage(it, locale)
            ]
        }
    }

    /**
     * Creates, or edits an existing, video. This is only possible to do if the authenticated user is a teacher of the
     * associated course, and if relevant the supplied video.
     *
     * This method also allows for an existing video to be moved to a new subject.
     *
     * @param command The CRUD command
     * @return If successful the newly created/existing video
     */
    ServiceResult<Video> createOrEditVideo(CreateOrUpdateVideoCommand command) {
        if (!command.validate()) {
            return fail([
                    message            : "Ugyldig besked",
                    suggestedHttpStatus: HttpStatus.BAD_REQUEST.value(),
                    information        : [errors: getFieldsErrors(command)]
            ])
        }

        if (!canAccess(command.subject.course)) {
            return fail([
                    message            : "Ikke tilladt",
                    suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value()
            ])
        }

        def video = (command.isEditing) ? command.editing : new Video()
        video.name = command.name
        video.youtubeId = command.youtubeId
        video.timelineJson = command.timelineJson
        video.description = command.description
        video.videoType = command.videoType
        video.localStatus = command.visible ? NodeStatus.VISIBLE : NodeStatus.INVISIBLE

        if (!video.validate()) {
            return fail([
                    message            : "Ugyldig besked (Intern fejl)",
                    suggestedHttpStatus: HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    information        : [errors: getFieldsErrors(video)]
            ])
        }

        video.save()
        if (!command.isEditing) {
            SubjectExercise.create(command.subject, video, [save: true])
        } else if (command.isEditing && video.subject != command.subject) {
            SubjectExercise.findByExercise(video).delete()
            SubjectExercise.create(command.subject, video, [save: true])
        }
        return ok(video)
    }

    ServiceResult<Void> importWrittenExercisesFromJson(Subject subject, String json) {
        if (!canAccessNode(subject)) {
            return fail(message: "not allowed", suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value())
        }

        try {
            def parsed = JSON.parse(json)
            if (!(parsed instanceof JSONArray)) return invalidRequest()

            def listOfGroups = parsed as JSONArray
            List<WrittenExerciseGroup> unsavedGroups = []
            for (def group : listOfGroups) {
                if (!(group instanceof JSONObject)) return invalidRequest()
                def groupObject = group as JSONObject
                String description = groupObject.getString("description")
                String name = groupObject.getString("name")
                String thumbnailUrl = groupObject.getString("thumbnailUrl")
                int streakToPass = groupObject.optInt("streakToPass", 5)
                JSONArray exercises = groupObject.getJSONArray("exercises")

                def processedGroup = new WrittenExerciseGroup(
                        name: name,
                        thumbnailUrl: thumbnailUrl,
                        description: description,
                        streakToPass: streakToPass
                )

                for (def exercise : exercises) {
                    if (!(exercise instanceof JSONObject)) return invalidRequest()
                    def exerciseObject = exercise as JSONObject
                    exerciseObject.remove("identifier")

                    def exerciseString = exerciseObject.toString()
                    if (exerciseString == null) return fail(
                            message: "Internal server error",
                            suggestedHttpStatus: HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            internal: true
                    )

                    def subExercise = new WrittenExercise(exercise: exerciseString)
                    processedGroup.addToExercises(subExercise)
                }

                unsavedGroups.add(processedGroup)
            }

            // TODO Why on Earth does saveAll not save anything?
            //WrittenExerciseGroup.saveAll(unsavedGroups)
            //SubjectExercise.saveAll(unsavedGroups.collect { SubjectExercise.create(subject, it, [save: false]) })

            unsavedGroups.each { it.save(flush: true) }
            unsavedGroups.collect { SubjectExercise.create(subject, it, [save: true, flush: true]) }
            return ok()
        } catch (ConverterException | JSONException ignored) {
            return invalidRequest()
        }
    }

    private static <E> ServiceResult<E> invalidRequest() {
        return fail(message: "Invalid request", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value())
    }

    ServiceResult<WrittenExerciseGroup> createOrEditWrittenExercise(CreateExerciseCommand command) {
        def teacher = userService.authenticatedTeacher

        if (!command.validate()) {
            return fail(message: "invalid request", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value())
        } else if (!teacher || !canAccessNode(command.subject)) {
            return fail(message: "not allowed", suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value())
        }

        def exercise = command.isEditing ? command.editing : new WrittenExerciseGroup()
        if (!exercise) return fail(message: "invalid request", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value())
        if (command.isEditing && !canAccessNode(exercise)) return fail(message: "not allowed",
                suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value())

        exercise.name = command.name
        exercise.description = command.description
        exercise.streakToPass = command.streakToPass
        exercise.thumbnailUrl = command.thumbnailUrl

        def preExistingExercises = new ArrayList<WrittenExercise>(exercise.exercises ?: [])
        Set<Long> subExercisesToKeep = []
        List<WrittenExercise> newExercises = []
        List<WrittenExercise> updatedExercises = []

        for (def subitem : command.exercises) {
            def isEditing = subitem.identifier != null
            def subExercise = isEditing ?
                    preExistingExercises.find { it.id == subitem.identifier } :
                    new WrittenExercise()
            if (!subExercise) {
                return fail(message: "invalid request", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value())
            }

            subExercise.exercise = subitem.exercise
            if (isEditing) {
                subExercisesToKeep.add(subExercise.id)
                updatedExercises.add(subExercise)
            } else {
                newExercises.add(subExercise)
            }
        }

        for (def subExercise : preExistingExercises) {
            if (!subExercisesToKeep.contains(subExercise.id)) {
                exercise.removeFromExercises(subExercise)
            }
        }

        for (def subExercise : newExercises) {
            exercise.addToExercises(subExercise)
        }

        for (def subExercise : updatedExercises) {
            subExercise.save()
        }

        exercise.save(flush: true)
        if (!command.isEditing) {
            SubjectExercise.create(command.subject, exercise, [flush: true, save: true])
        }
        return ok(item: exercise)
    }

    ServiceResult<SimilarResources> createSimilarResource(CreateSimilarResourceCommand command) {
        def exercise = Exercise.get(command.id)
        def user = userService.authenticatedTeacher
        if (!exercise) {
            fail "Ukendt opgave"
        } else if (!user) {
            fail "Ukendt bruger"
        } else if (!canAccessNode(exercise)) {
            fail "Ikke tilladt"
        } else {
            def comment = new SimilarResources(link: command.link, title: command.title)
            if (!comment.validate()) {
                fail "Ikke gyldig"
            } else {
                if (exercise.addToSimilarResources(comment)) {
                    ok comment
                } else {
                    fail "Kunne ikke gemme"
                }
            }
        }
    }

    ServiceResult<Void> deleteSimilarResource(Long exerciseId, SimilarResources similarResources) {
        def exercise = Exercise.get(exerciseId)
        if (!exercise) {
            fail "Ukendt opgave"
        } else if (!similarResources) {
            fail "Ukendt resource"
        } else if (!canAccessNode(exercise)) {
            fail "Ikke tilladt"
        } else {
            if (!exercise.removeFromSimilarResources(similarResources)) {
                fail("Kunne ikke fjerne", true)
            } else {
                ok null
            }
        }
    }

    /**
     * Updates the exercise list of a subject. This allows for exercise to be moved up and down in the list, as well as
     * removing exercises entirely from the list. Any exercise deleted will be marked as TRASH.
     *
     * @param command The update command
     * @return The subject being edited
     */
    ServiceResult<Subject> updateExercises(UpdateExercisesCommand command) {
        if (!command.validate()) {
            fail("teacherservice.invalid_request", false, [:], 400)
        } else {
            if (canAccessNode(command.subject)) {
                def diff = command.subject.allExercises.minus(command.order)
                diff.each {
                    it.localStatus = NodeStatus.TRASH
                    it.save()
                }
                def mappings = SubjectExercise.findAllBySubject(command.subject)
                command.order.eachWithIndex { entry, i ->
                    def mapping = mappings.find { it.exercise.id == entry.id }
                    mapping.weight = i
                    mapping.save()
                }

                int index = command.order.size()
                for (def t : diff) {
                    def mapping = mappings.find { it.exercise.id == t.id }
                    mapping.weight = index
                    mapping.save()

                    index++
                }
                ok command.subject
            } else {
                fail("teacherservice.not_allowed", false, [:], 403)
            }
        }
    }

    /**
     * Updates the subject list of a course. This allows for subjects to be moved up and down in the list, as well as
     * removing subjects entirely from the list. Any subject deleted will be marked as TRASH.
     *
     * @param command The update command
     * @return The course being edited
     */
    ServiceResult<Course> updateSubjects(UpdateSubjectsCommand command) {
        if (!command.validate()) {
            fail("teacherservice.invalid_request", false, [:], 400)
        } else {
            if (canAccess(command.course)) {
                def diff = command.course.subjects.minus(command.order)
                diff.each {
                    it.localStatus = NodeStatus.TRASH
                    it.save()
                }
                def mappings = CourseSubject.findAllByCourse(command.course)
                command.order.eachWithIndex { entry, i ->
                    def mapping = mappings.find { it.subjectId == entry.id }
                    mapping.weight = i
                    mapping.save()
                }

                int index = command.order.size()
                for (def t : diff) {
                    def mapping = mappings.find { it.subjectId == t.id }
                    mapping.weight = index
                    mapping.save()

                    index++
                }
                ok command.course
            } else {
                fail("teacherservice.not_allowed", false, [:], 403)
            }
        }
    }

    /**
     * Deletes a course, essentially marking it as TRASH.
     *
     * @param command The delete command.
     * @return The course in question.
     */
    ServiceResult<Course> deleteCourse(DeleteCourseCommand command) {
        if (!command.validate()) {
            fail("teacherservice.invalid_request", false, [:], 400)
        } else {
            if (canAccess(command.course)) {
                command.course.localStatus = NodeStatus.TRASH
                ok command.course
            } else {
                fail("teacherservice.not_allowed", false, [:], 403)
            }
        }
    }

    /**
     * Creates a copy of the course given in the command with the new attributes as specified.
     *
     * @param command The import command
     * @return The new course
     */
    ServiceResult<Course> importCourse(ImportCourseCommand command) {
        def teacher = userService.authenticatedTeacher
        if (teacher == null) {
            fail("teacherservice.not_a_teacher", false, [:], 401)
        } else {
            if (command.validate()) {
                def course = new Course([
                        name       : command.newCourseName,
                        fullName   : command.newCourseFullName,
                        description: command.newDescription,
                        year       : command.newSemester,
                        spring     : command.newSemesterSpring,
                        teacher    : teacher,
                        localStatus: command.visible ? NodeStatus.VISIBLE : NodeStatus.INVISIBLE
                ]).save(flush: true)
                command.course.visibleSubjects.forEach { internalCopySubjectToCourse(it, course) }

                ok course
            } else {
                fail("teacherservice.invalid_request", false, [command: command], 400)
            }
        }
    }

    /**
     * Checks if the authenticated user is the owner of the given course.
     *
     * @param course The course
     * @return true if the authenticated user owns the course
     */
    boolean canAccess(Course course) {
        return course.teacher == userService.authenticatedTeacher
    }

    boolean canAccessNode(Node node) {
        if (node == null) {
            return false
        } else if (node instanceof Course) {
            return canAccess(node)
        } else {
            return canAccessNode(node.parent)
        }
    }

    ServiceResult<Void> copySubjectToCourse(Subject subject, Course course) {
        if (!subject || !course) {
            return fail(message: "Kunne ikke finde efterspurgte emner", suggestedHttpStatus: 404)
        }

        if (!canAccessNode(subject) || !canAccessNode(course)) {
            return fail(message: "Du har ikke rettigheder til at tilgå dette emne",
                    suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value())
        }

        internalCopySubjectToCourse(subject, course)
        return ok()
    }

    ServiceResult<Void> copyExerciseToSubject(Exercise exercise, Subject subject) {
        if (!exercise || !subject) {
            return fail(message: "Kunne ikke finde efterspurgte emner", suggestedHttpStatus: 404)
        }

        if (!canAccessNode(exercise) || !canAccessNode(subject)) {
            return fail(message: "Du har ikke rettigheder til at tilgå dette emne",
                    suggestedHttpStatus: HttpStatus.UNAUTHORIZED.value())
        }

        if (exercise instanceof WrittenExerciseGroup) {
            internalCopyWrittenExerciseGroupToSubject(exercise, subject)
        } else if (exercise instanceof Video) {
            internalCopyVideoToSubject(exercise, subject)
        } else {
            return fail(message: "Ukendt opgave type", suggestedHttpStatus: 500)
        }
        return ok()
    }

    /**
     * Changes the status of a single course. This can only be done if the teacher owns the associated course.
     *
     * @param course The node to change status on
     * @param status The status to update to
     * @return failure if the authenticated user is not the teacher of the course, otherwise OK
     */
    ServiceResult<Void> changeCourseStatus(Course course, NodeStatus status) {
        def teacher = userService.authenticatedTeacher
        if (teacher && course.teacher == teacher) {
            if (status != null) {
                course.localStatus = status
                course.save()
                ok()
            } else {
                fail message: "Ugyldig forespørgsel", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value()
            }
        } else {
            fail message: "Ugyldigt kursus", suggestedHttpStatus: HttpStatus.NOT_FOUND.value()
        }
    }

    /**
     * Changes the status of a single subject. This can only be done if the teacher owns the associated course.
     *
     * @param course The node to change status on
     * @param status The status to update to
     * @return failure if the authenticated user is not the teacher of the course, otherwise OK
     */
    ServiceResult<Void> changeSubjectStatus(Subject subject, NodeStatus status) {
        if (canAccess(subject.course)) {
            if (status != null) {
                subject.localStatus = status
                subject.save()
                ok()
            } else {
                fail message: "Ugyldig forspørgsel", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value()
            }
        } else {
            fail message: "Ugyldigt kursus", suggestedHttpStatus: HttpStatus.NOT_FOUND.value()
        }
    }

    /**
     * Changes the status of a single video. This can only be done if the teacher owns the associated course.
     *
     * @param course The node to change status on
     * @param status The status to update to
     * @return failure if the authenticated user is not the teacher of the course, otherwise OK
     */
    ServiceResult<Void> changeExerciseStatus(Exercise exercise, NodeStatus status) {
        if (canAccessNode(exercise)) {
            if (status != null) {
                exercise.localStatus = status
                exercise.save()
                ok()
            } else {
                fail message: "Ugyldig forspørgsel", suggestedHttpStatus: HttpStatus.BAD_REQUEST.value()
            }
        } else {
            fail message: "Ugyldigt kursus", suggestedHttpStatus: HttpStatus.NOT_FOUND.value()
        }
    }

    /**
     * Utility method for copying a subject to a course.
     *
     * @param subject The subject to copy
     * @param course The destination course
     */
    private void internalCopySubjectToCourse(Subject subject, Course course) {
        if (subject == null) return
        def newSubject = new Subject([
                name       : subject.name,
                description: subject.description,
        ]).save(flush: true)
        CourseSubject.create(course, newSubject, [save: true])
        subject.allVisibleExercises.forEach {
            if (it instanceof Video) {
                internalCopyVideoToSubject(it, newSubject)
            } else if (it instanceof WrittenExerciseGroup) {
                internalCopyWrittenExerciseGroupToSubject(it, newSubject)
            }
        }
    }

    /**
     * Utility method for copying a video to a subject.
     *
     * @param video The video
     * @param subject The destination subject
     */
    private void internalCopyVideoToSubject(Video video, Subject subject) {
        if (video == null) return
        def newVideo = new Video([
                name        : video.name,
                youtubeId   : video.youtubeId,
                timelineJson: video.timelineJson,
                description : video.description,
                videoType   : video.videoType,
        ]).save(flush: true)
        SubjectExercise.create(subject, newVideo, [save: true])
        video.similarResources.each {
            def resource = new SimilarResources(title: it.title, link: it.link)
            newVideo.addToSimilarResources(resource)
        }
        newVideo.save()
    }

    private void internalCopyWrittenExerciseGroupToSubject(WrittenExerciseGroup exercise, Subject subject) {
        if (exercise == null) return

        def newExercise = new WrittenExerciseGroup([
                name       : exercise.name,
                description: exercise.description,
                streakToPass: exercise.streakToPass, 
        ]).save(flush: true)
        SubjectExercise.create(subject, newExercise, [save: true])

        exercise.exercises.each {
            internalCopyWrittenExerciseToGroup(it, newExercise)
        }
        exercise.similarResources.each {
            def resource = new SimilarResources(title: it.title, link: it.link)
            newExercise.addToSimilarResources(resource)
        }
        newExercise.save()
    }

    private void internalCopyWrittenExerciseToGroup(WrittenExercise exercise, WrittenExerciseGroup group) {
        if (exercise == null) return

        def newExercise = new WrittenExercise(exercise: exercise.exercise)
        group.addToExercises(newExercise)
        group.save(flush: true)
    }

    ServiceResult<Subject> moveSubject(MoveSubjectCommand command) {
        if (command.validate()) {
            def mapping = CourseSubject.findBySubject(command.subject)
            mapping.course = command.newCourse
            mapping.weight = command.position
            mapping.save(flush: true, failOnError: true)
            ok()
        } else {
            fail("Something went wrong")
        }
    }

    ServiceResult<Exercise> moveExercise(MoveExerciseCommand command) {
        if (command.validate()) {
            def mapping = SubjectExercise.findByExercise(command.exercise)
            mapping.subject = command.newSubject
            mapping.weight = command.position
            mapping.save(flush: true, failOnError: true)
            ok()
        } else {
            fail("Something went wrong")
        }
    }

}

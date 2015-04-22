package dk.sdu.tekvideo

import dk.sdu.tekvideo.events.AnswerQuestionEvent
import dk.sdu.tekvideo.events.VisitVideoEvent
import grails.plugin.springsecurity.SpringSecurityService
import grails.transaction.Transactional

@Transactional
class AdminService {

    TeachingService teachingService
    SpringSecurityService springSecurityService

    List<VisitVideoEvent> retrieveVideoEvents(VideoStatisticsCommand cmd) {
        def teacher = findCurrentTeacher()
        def data = teachingService.getCompleteData(teacher.user.username, cmd.course, cmd.subject, cmd.video)

        def criteria = VisitVideoEvent.where {
            course in teacher.courses
            if (cmd.showOnlyStudents) {
                user != null
            }
            if (cmd.course != null) {
                course.name == cmd.course
            }
            if (cmd.subject != null) {
                subject == cmd.subject
            }
            if (cmd.video != null && data != null) {
                video == data.video
            }
        }
        return criteria.findAll()
    }

    private Map groupByAttribute(List items, String attribute) {
        // TODO Quick @Hack. This really should have been prepared DB side
        Map result = [:]
        items.each {
            List slot = result[it.properties[attribute]]
            if (slot) {
                slot.add(it)
            } else {
                result[it.properties[attribute]] = [it]
            }
        }
        return result
    }

    Map<Video, Map> summarizeVisits(List<Video> videos, List<VisitVideoEvent> events) {
        Map<Video, List<VisitVideoEvent>> groupedEvents = groupByAttribute(events, "video")
        Map<Video, Map> result = [:]
        videos.each {
            result[it] = [totalViews: 0, viewsByUsers: 0, viewsByStudents: 0]
        }

        groupedEvents.each { k, v ->
            Map slot = result[k]
            v.each {
                slot.totalViews++
                if (it.user != null) {
                    slot.viewsByUsers++

                    def student = Student.findByUser(it.user)
                    if (student in it.course.students) {
                        slot.viewsByStudents++
                    }
                }
            }
            result[k] = slot
        }
        return result
    }

    Map<Video, Map> summarizeVideos(List<Video> videos) {
        Map result = [:]
        videos.each {
            result[it] = [release: it.dateCreated]
        }
        return result
    }

    Map<Video, Map> summarizeAnswers(List<Video> videos, List<AnswerQuestionEvent> events) {
        Map<Video, List<AnswerQuestionEvent>> groupedEvents = groupByAttribute(events, "video")
        Map<Video, Map> result = [:]
        videos.each {
            result[it] = [answersGiven: 0, correctAnswers: 0, answersByUsers: 0, answersByStudents: 0, correctByUsers: 0,
                          correctByStudents: 0, mostCommonIncorrect: "?"]
        }

        groupedEvents.each { k, v ->
            Map slot = result[k]
            Map incorrectAnswers = [:] // TODO Feels like a poor choice of data structure
            v.each {
                boolean inCourse = false
                boolean isUser = false
                if (it.user != null) {
                    isUser = true
                    def student = Student.findByUser(it.user)
                    if (student in it.course.students) {
                        inCourse = true
                    }
                }

                slot.answersGiven++
                if (isUser) slot.answersByUsers++
                if (inCourse) slot.answersByStudents++

                if (it.correct) {
                    slot.correctAnswers++
                    if (isUser) slot.correctByUsers++
                    if (inCourse) slot.correctByStudents++
                } else {
                    incorrectAnswers.putIfAbsent(it.answer, 0)
                    incorrectAnswers[it.answer] = incorrectAnswers[it.answer] + 1
                }
            }
            incorrectAnswers.entrySet().stream()
                    .max(Comparator.comparingInt { it.getValue() })
                    .ifPresent { slot.mostCommonIncorrect = it.getKey() }

            result[k] = slot
        }
        return result
    }

    Map<Video, Map> findSummaryData(VideoSummaryQueryCommand command) {
        // TODO Could be done in a single query, instead of several
        // TODO Apply constraints from command object

        // TODO Most of the summary data could be collected directly from the database, as opposed
        // to this
        Teacher teacher = findCurrentTeacher()
        List<Course> courses = Course.findAllByTeacher(teacher)
        List<Subject> subjects = Subject.findAllByCourseInList(courses)

        List<Video> videos = subjects.videos.flatten()
        List<VisitVideoEvent> visitEvents = VisitVideoEvent.findAllByVideoInList(videos)
        List<AnswerQuestionEvent> answerEvents = AnswerQuestionEvent.findAllByVideoInList(videos)

        Map<Video, Map> videoSummary = summarizeVideos(videos)
        Map<Video, Map> viewSummary = summarizeVisits(videos, visitEvents)
        Map<Video, Map> answerSummary = summarizeAnswers(videos, answerEvents)

        Map<Video, Map> result = [:]

        videos.each {
            result[it] = videoSummary[it]
            result[it].putAll(viewSummary[it])
            result[it].putAll(answerSummary[it])
        }

        return result
    }

    Teacher findCurrentTeacher() {
        Teacher.findByUser(springSecurityService.currentUser as User)
    }

}

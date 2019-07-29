<%@ page import="dk.danthrane.twbs.NavStyle; dk.sdu.tekvideo.NodeStatus; dk.danthrane.twbs.ButtonSize; dk.danthrane.twbs.ButtonStyle; dk.sdu.tekvideo.FaIcon" contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>Administrering af ${course.fullName} (${course.name})</title>
    <meta name="layout" content="main_fluid"/>
    <asset:javascript src="list.js"/>
    <sdu:appResourceJs href="node_modules/dropzone/dist/dropzone.js" />
    <sdu:appResourceCss href="node_modules/dropzone/dist/dropzone.css" />
    <sdu:requireAjaxAssets/>
</head>

<body>
<twbs:pageHeader><h3>Administrering af fag <small>${course.fullName} (${course.name})</small></h3></twbs:pageHeader>

<twbs:row>
    <twbs:column>
        <ol class="breadcrumb">
            <li><g:link action="index" controller="courseManagement">Kursusadministration</g:link></li>
            <li class="active">${course.fullName} (${course.name})</li>
        </ol>
    </twbs:column>
</twbs:row>

<sdu:card>
    <g:if test="${subjects.isEmpty()}">
        <p>Ingen emner her</p>
    </g:if>
    <g:else>
        <div class="subject-container">
            <g:each in="${subjects}" var="subject">
                <div class="subject">
                    <div data-subject-id="${subject.id}" class="hide"></div>
                    <twbs:row>
                        <twbs:column cols="6">
                            <div class="node-header">
                                <g:link action="manageSubject" id="${subject.id}">
                                    ${subject.name}
                                </g:link>
                                <ul class="list-inline course-list">
                                    <!-- I definitely didn't implement the bullets like this because I'm too lazy ;-) -->
                                    <li>&raquo; ${subject.activeExerciseCount} opgave(r)</li>
                                </ul>
                            </div>
                        </twbs:column>
                        <twbs:column cols="6" class="align-right">
                            <twbs:buttonGroup>
                                <twbs:dropdownToggle style="${ButtonStyle.SUCCESS}">
                                    <fa:icon icon="${FaIcon.PLUS_CIRCLE}"/> Tilføj ny

                                    <twbs:dropdownMenu>
                                        <twbs:dropdownItem action="createVideo" controller="courseManagement"
                                                           id="${subject.course.id}" params="${[subject: subject.id]}">
                                            <fa:icon icon="${FaIcon.PLAY}"/> Video
                                        </twbs:dropdownItem>
                                        <twbs:dropdownItem action="createWrittenExercise" controller="courseManagement"
                                                           id="${subject.id}">
                                            <fa:icon icon="${FaIcon.FILE_TEXT}"/> Skriftlig Opgave
                                        </twbs:dropdownItem>
                                    </twbs:dropdownMenu>
                                </twbs:dropdownToggle>
                            </twbs:buttonGroup>



                            <twbs:buttonGroup>
                                <twbs:dropdownToggle style="${ButtonStyle.WARNING}">
                                    <fa:icon icon="${FaIcon.ARROW_CIRCLE_RIGHT}"/> Flyt til

                                    <twbs:dropdownMenu>
                                        <twbs:dropdownItem disabled="${status == NodeStatus.VISIBLE}"
                                                           action="subjectStatus" id="${subject.id}"
                                                           params="${[status: NodeStatus.VISIBLE]}">
                                            <fa:icon icon="${FaIcon.EYE}"/> Synlige
                                        </twbs:dropdownItem>
                                        <twbs:dropdownItem disabled="${status == NodeStatus.INVISIBLE}"
                                                           action="subjectStatus" id="${subject.id}"
                                                           params="${[status: NodeStatus.INVISIBLE]}">
                                            <fa:icon icon="${FaIcon.EYE_SLASH}"/> Usynlige
                                        </twbs:dropdownItem>
                                        <twbs:dropdownItem disabled="${status == NodeStatus.TRASH}"
                                                           action="subjectStatus" id="${subject.id}"
                                                           params="${[status: NodeStatus.TRASH]}">
                                            <fa:icon icon="${FaIcon.TRASH}"/> Papirkurv
                                        </twbs:dropdownItem>
                                    </twbs:dropdownMenu>
                                </twbs:dropdownToggle>
                            </twbs:buttonGroup>
                            <div class="node-header-spacer"></div>
                            <twbs:button style="${ButtonStyle.PRIMARY}" class="subject-up">
                                <fa:icon icon="${FaIcon.ARROW_UP}"/>
                            </twbs:button>
                            <twbs:button style="${ButtonStyle.INFO}" class="subject-down">
                                <fa:icon icon="${FaIcon.ARROW_DOWN}"/>
                            </twbs:button>
                        </twbs:column>
                    </twbs:row>
                    <twbs:row>
                        <twbs:column>
                            <markdown:renderHtml text="${sdu.abbreviate([:], { subject.description })}"/>
                        </twbs:column>
                    </twbs:row>
                    <hr>
                </div>

<div>
<form action="/upload-target" id="myAwesomeDropzone${subject.id}" class="dropzone"></form>
<script>
Dropzone.options.myAwesomeDropzone${subject.id} = {
  autoProcessQueue: false, 
  init: function() {
    this.on("addedfile", 
      function(file) { 
        var reader = new FileReader();
        reader.addEventListener("loadend", 
          function(event) { 
            console.log(event.target.result);
            var parsed_file = JSON.parse(event.target.result);

        var data = {};
        // Prepare and validate data
        data.name = parsed_file.name;
        data.description = parsed_file.description;
        data.streakToPass = parsed_file.streakToPass;
        data.thumbnailUrl = parsed_file.thumbnailUrl;
        data.exercises = parsed_file.exercises.map(function(e) {
            var identifier = e.identifier;
            delete e.identifier;
            var exercise = JSON.stringify(e);
            return { identifier: identifier, exercise: exercise };
        });
        data.subject = 1429;
        data.subject = "${subject.id}";
        data.isEditing = false;

        if (data.name) {
            // Send data
            Util.postJson("${createLink(action: "postWrittenExercise")}", data, {
                success: function () {
                    alert("success");
                },
                error: function () {
                    alert("Failure");
                }
            });
        } else {
        }



          });
        reader.readAsText(file);
      });
  }
};
</script>
</div>


            </g:each>
        </div>
    </g:else>
</sdu:card>

<twbs:modal id="subject-share">
    <twbs:modalHeader>Del</twbs:modalHeader>
    <twbs:input value="${createLink([controller: "Course", action: "signup", id: course.id, absolute: true])}"
                name="share-url" class="input-select-all" labelText="URL til tilmeldings siden"/>
    <twbs:input value="${sdu.createLinkToCourse([course: course, absolute: true])}"
                name="share-page" class="input-select-all" labelText="URL til fagets side"/>
</twbs:modal>

<g:content key="sidebar-right">
    <twbs:pageHeader>
        <h4>Filter</h4>
    </twbs:pageHeader>
    <twbs:nav style="${NavStyle.PILL}" stacked="true">
        <twbs:navItem active="${status == NodeStatus.VISIBLE}" action="manage" id="${course.id}"
                      params="${[status: NodeStatus.VISIBLE]}">
            <fa:icon icon="${FaIcon.EYE}"/> Synlige
        </twbs:navItem>
        <twbs:navItem active="${status == NodeStatus.INVISIBLE}" action="manage" id="${course.id}"
                      params="${[status: NodeStatus.INVISIBLE]}">
            <fa:icon icon="${FaIcon.EYE_SLASH}"/> Usynlige
        </twbs:navItem>
        <twbs:navItem active="${status == NodeStatus.TRASH}" action="manage" id="${course.id}"
                      params="${[status: NodeStatus.TRASH]}">
            <fa:icon icon="${FaIcon.TRASH}"/> Papirkurv
        </twbs:navItem>
    </twbs:nav>

    <twbs:pageHeader>
        <h4>Handlinger</h4>
    </twbs:pageHeader>
    <twbs:linkButton action="editCourse" id="${course.id}" style="${ButtonStyle.LINK}" block="true">
        <fa:icon icon="${FaIcon.EDIT}"/>
        Rediger kursus detaljer
    </twbs:linkButton>
    <twbs:linkButton action="createSubject" id="${course.id}" style="${ButtonStyle.LINK}" block="true">
        <fa:icon icon="${FaIcon.PLUS_CIRCLE}"/>
        Opret nyt emne
    </twbs:linkButton>
    <twbs:button id="share-button" style="${ButtonStyle.LINK}" block="true">
        <fa:icon icon="${FaIcon.SHARE}"/>
        Del
    </twbs:button>
    <hr>
    <sdu:ajaxSubmitButton style="${ButtonStyle.LINK}" id="save-subject-order">
        <fa:icon icon="${FaIcon.EDIT}"/>
        Gem rækkefølge
    </sdu:ajaxSubmitButton>
</g:content>

<g:content key="sidebar-left">
    <div id="tree-container"></div>
</g:content>

<script>
    var baseUrl = "${createLink(absolute:false, uri:'/')}";

    $(function () {
        var listManipulator = new ListManipulator(".subject", ".subject-up", ".subject-down");
        listManipulator.init();

        AjaxUtil.registerJSONForm("#save-subject-order", "${createLink(action: "updateSubjects")}", function () {
            var order = listManipulator.map(function (element) {
                return parseInt(element.find("[data-subject-id]").attr("data-subject-id"));
            });

            return {order: order, course: ${course.id}};
        });

        $("#share-button").click(function (e) {
            e.preventDefault();
            $("#subject-share").modal("show");
        });

        $(".input-select-all").click(function () {
            $(this).find("input").select();
        });

        var tree = new ManagementTreeView("#tree-container", "${createLink(absolute:false, uri:'/')}");
        tree.init();
    });
</script>

<asset:javascript src="./courseManagement/app.js"/>
<asset:stylesheet src="./vendor/proton/style.min.css"/>
</body>
</html>

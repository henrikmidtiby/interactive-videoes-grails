<%@ page import="grails.converters.JSON; dk.sdu.tekvideo.FaIcon; dk.danthrane.twbs.GridSize; dk.danthrane.twbs.ButtonStyle; dk.danthrane.twbs.ButtonSize" %>

<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main_fluid"/>
    <title>${exercise.name}</title>

    <g:render template="/polymer/includePolymer"/>

    <link rel="import"
          href="${createLink(absolute: true, uri: '/assets/')}/components/exercise-editor/tve-group-renderer.html">
    <style>
    .polymer {
        font-family: 'Roboto', 'Noto', sans-serif;
        line-height: 1.5;
    }
    </style>
</head>

<body class="polymer">

<twbs:pageHeader>
    <h3>${exercise.name}</h3>
</twbs:pageHeader>

<twbs:row>
    <twbs:column>
        <ol class="breadcrumb">
            <li><g:link uri="/">Hjem</g:link></li>
            <li>
                <sdu:linkToTeacher teacher="${exercise.subject.course.teacher}">
                    ${exercise.subject.course.teacher}
                </sdu:linkToTeacher>
            </li>
            <li>
                <sdu:linkToCourse course="${exercise.subject.course}">
                    ${exercise.subject.course.fullName} (${exercise.subject.course.name})
                </sdu:linkToCourse>
            </li>
            <li>
                <sdu:linkToSubject subject="${exercise.subject}">
                    ${exercise.subject.name}
                </sdu:linkToSubject>
            </li>
            <li class="active">${exercise.name}</li>
        </ol>
    </twbs:column>
</twbs:row>


<tve-group-renderer id="renderer"></tve-group-renderer>

<g:if test="${!exercise.similarResources.empty}">
    <g:content key="sidebar-right">
        <twbs:pageHeader><h4>Se også</h4></twbs:pageHeader>
        <ul>
            <g:each in="${exercise.similarResources}">
                <li><a href="${it.link}">${it.title}</a></li>
            </g:each>
        </ul>
    </g:content>
</g:if>

<g:content key="content-below-the-fold">
    <exercise:comments exercise="${exercise}"/>
</g:content>
<script>
    var renderer = document.getElementById('renderer');
    var exercisePoolObj = {
    <g:each in="${subExercises}" var="item">
    ${item.id}: ${raw(item.exercise)},
    </g:each>
    }
    ;

    %{-- Working around the fact that we don't store the assignments in a (server-side) structured format --}%
    var exercisePool = [];
    for (var key in exercisePoolObj) {
        var obj = exercisePoolObj[key];
        obj.identifier = key;
        exercisePool.push(obj);
    }

    renderer.exercisePool = exercisePool;
    renderer.completed = ${completed};
    renderer.display(0);

    renderer.addEventListener("grade", function (e) {
        console.log(e.detail.passes);
        if (e.detail.passes) {
            events.emit({"kind": "COMPLETE_WRITTEN_EXERCISE", "exerciseId": e.detail.identifier}, true);
        }
    });

    renderer.addEventListener("display", function (e) {
        var identifier = e.detail.identifier;
        events.emit({"kind": "VISIT_WRITTEN_EXERCISE", "exerciseId": identifier}, true);
    });

    renderer.addEventListener("backToMenu", function () {
        document.location = "${sdu.createLinkToSubject(subject: exercise.subject)}";
    });

    events.setMetaData({"groupId": ${exercise.id}});

</script>

</body>
</html>

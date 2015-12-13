//= require AnswerBreakdown

var AnswersPage = (function () {
    function AnswersPage(app) {
        this.app = app;
    }

    AnswersPage.prototype.onSelect = function (root, period) {
        console.log("hello");
        var self = this;
        self.app.displaySpinner();

        var videosPromise = $.getJSON(baseUrl + "dashboard/videos?identifier=" + root);
        var studentsPromise = $.getJSON(baseUrl + "dashboard/students?identifier=" + root);

        $.when(videosPromise, studentsPromise).done(function (videos, students) {
            videos = videos[0];
            students = students[0];
            var $container = $("#answer-thumbnail-container");
            var rawTemplate = $("#answer-thumbnail-template").html();
            var rowTemplate = $("#row-template").html();
            var currentRow = null;
            $container.empty();

            for (var i = 0; i < videos.length; i++) {
                var video = videos[i];

                if (i % 6 == 0) {
                    if (currentRow !== null) {
                        $container.append(currentRow);
                    }
                    currentRow = $(rowTemplate);
                }

                var template = $(rawTemplate.format(
                    video.youtubeId,
                    video.name
                ));

                currentRow.append(template);
                $(template).click(thumbnailHandler(self.app, video, students, period));
            }
        }).always(function() {
            self.app.removeSpinner();
        }).fail(function () {
            $("#error-message").fadeIn();
        });
    };

    function thumbnailHandler(app, video, students, period) {
        var answerBreakdown = new AnswerBreakdown(app, video, students, period);
        return function(e) {
            e.preventDefault();
            answerBreakdown.init();
        };
    }
    return AnswersPage;
}());
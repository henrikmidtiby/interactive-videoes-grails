import dk.sdu.tekvideo.Video
import grails.converters.JSON
import org.springframework.security.access.annotation.Secured

import static dk.sdu.tekvideo.ServiceResult.fail

@Secured("permitAll")
class StatisticsController {

    def videoStatisticsService

    def runStatisticsTest(Video video) {
        render videoStatisticsService.retrieveAnswerSummary(video) as JSON
    }

    def runViewBreakdown(Video video) {
        render videoStatisticsService.retrieveViewBreakdown(video) as JSON
    }

}

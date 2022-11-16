const { gql } = require('graphql-request')

module.exports = gql `query JobsData( $tableDetailsQueryOptions: JobCampaignDetailsInput!) {
    details: jobsCampaignsAnalyticsByJob(input: $tableDetailsQueryOptions) {
    result {
        aggJobID
        title
        city
        admin1
        sumImpressions
        sumClicks
        sumApplyStarts
        sumApplies
        avgCostPerClickLocal
        avgCostPerApplyStartLocal
        avgCostPerApplyLocal
        avgCTR
        avgACR
        avgASR
        sumCostLocal
        __typename
    }
    __typename
    }
}`
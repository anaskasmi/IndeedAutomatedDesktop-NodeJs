const { gql } = require('graphql-request')

module.exports = gql `query JobsData($tableTotalQueryOptions: JobCampaignDetailsInput!, $tableSummaryQueryOptions: JobCampaignDetailsInput!, $tableDetailsQueryOptions: JobCampaignDetailsInput!) {
    total: jobsCampaignsAnalyticsNumJob(input: $tableTotalQueryOptions) {
      uniqueCount
  __typename
}
summary: jobsCampaignsAnalyticsByJobAndFullNameLocation(
  input: $tableSummaryQueryOptions
) {
      result {
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
          applyRate
          __typename
  }
  __typename
}
details: jobsCampaignsAnalyticsByJobAndFullNameLocation(
  input: $tableDetailsQueryOptions
) {
      result {
        aggJobID
    title
    countryFullName
    city
    regionFullName
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
    jobURL
    sourceWebsite
    lastModifiedDate
    jobReferenceNumber
    firstIndexedDate
    jobCompanyName
    applyRate
    __typename
  }
  __typename
}
}`
const { gql } = require('graphql-request')

module.exports = gql `mutation PublishDraftJobPostToEmployerJob($input: PublishDraftJobPostToEmployerJobInput!) {
  publishDraftJobPostToEmployerJob(input: $input) {
    result {
      employerJob {
        id
    jobData {
          ... on HostedJobPost {
           legacyId
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}
__typename
}
}`;
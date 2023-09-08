const { gql } = require('graphql-request')

module.exports = gql `mutation createDraftJobPostFromEmployerJob($input: CreateDraftJobPostFromEmployerJobInput!) {
  createDraftJobPostFromEmployerJob(input: $input) {
    result {
      draftJobPost {
        id
        __typename
      }
      __typename
    }
    __typename
  }
}
`;
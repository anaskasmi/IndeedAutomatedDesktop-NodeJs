const { gql } = require('graphql-request')

module.exports = gql `mutation SaveDraftJobPost($input: PatchDraftJobPostInput!) {
    patchDraftJobPost(input: $input) {
      result {
        draftJobPost {
          ...DraftJobPostFields
          __typename
        }
        __typename
      }
      __typename
    }
  }`;
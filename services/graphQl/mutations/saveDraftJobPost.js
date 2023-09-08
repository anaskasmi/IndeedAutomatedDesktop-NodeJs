const { gql } = require('graphql-request')

module.exports = gql `mutation SaveDraftJobPost($input: PatchDraftJobPostInput!) {
    patchDraftJobPost(input: $input) {
      result {
        draftJobPost {
          id
          title
          __typename
        }
        __typename
      }
      __typename
    }
  }`;
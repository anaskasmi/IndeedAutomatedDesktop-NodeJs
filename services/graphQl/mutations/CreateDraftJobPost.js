const { gql } = require('graphql-request')

module.exports = gql `mutation CreateDraftJobPost($input: CreateDraftJobPostInput!) {
  createDraftJobPost(input: $input) {
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
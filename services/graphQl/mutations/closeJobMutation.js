const { gql } = require('graphql-request')

module.exports = gql `mutation UjlJobStatusDropdownUpdateJob($id: ID!, $status: HostedJobPostStatus!) {
  patchHostedJobPost(input: {id: $id, patch: {status: $status}}) {
    result {
      hostedJobPost {
        id
      status
      dateLastModified
      __typename
    }
    __typename
  }
  __typename
}
}`;
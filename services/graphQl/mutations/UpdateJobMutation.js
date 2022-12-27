  const { gql } = require('graphql-request')

  module.exports = gql `mutation UpdateJob($encryptedJobId: String!, $update: JobUpdateInput!) {
    updateJob(id: $encryptedJobId, jobInput: $update) {
      attributes {
        key
      value
      __typename
    }
    __typename
  }
}
  `;
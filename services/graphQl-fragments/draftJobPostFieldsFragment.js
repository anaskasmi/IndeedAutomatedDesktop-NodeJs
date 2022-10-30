const { gql } = require('graphql-request')

module.exports =  gql `
fragment DraftJobPostFields on DraftJobPost {
    id
    origin
    claimedApplyUrl
    advertisingLocations {
      location
      __typename
    }
    applyMethod {
      method
      ... on JobPostEmailApplyMethod {
        emails
        __typename
      }
      ... on JobPostInPersonApplyMethod {
        address
        instructions
        latitude
        longitude
        __typename
      }
      ... on JobPostWebsiteApplyMethod {
        url
        __typename
      }
      __typename
    }
    company
    country
    coverLetterRequired
    description
    language
    jobAddress
    jobTypes
    occupationUuid
    phoneRequired
    resumeRequired
    salary {
      maximumMinor
      minimumMinor
      period
      __typename
    }
    title
    attributes {
      key
      value
      __typename
    }
    taxonomyAttributes {
      customClassUuid
      attributes {
        type
        uuid
        label
        __typename
      }
      __typename
    }
    fieldEditRules {
      applyUrl {
        fieldSource
        isEditable
        __typename
      }
      company {
        fieldSource
        isEditable
        __typename
      }
      country {
        fieldSource
        isEditable
        __typename
      }
      description {
        fieldSource
        isEditable
        __typename
      }
      jobTypes {
        fieldSource
        isEditable
        __typename
      }
      language {
        fieldSource
        isEditable
        __typename
      }
      advertisingLocations {
        fieldSource
        isEditable
        __typename
      }
      salary {
        fieldSource
        isEditable
        __typename
      }
      jobAddress {
        fieldSource
        isEditable
        __typename
      }
      title {
        fieldSource
        isEditable
        __typename
      }
      __typename
    }
    __typename
  }`;
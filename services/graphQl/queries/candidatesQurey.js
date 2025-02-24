const { gql } = require('graphql-request')

module.exports = gql `query FindCandidateSubmissions($input: FindCandidateSubmissionsInput!, $first: Int, $after: String, $last: Int, $before: String) {
  findCandidateSubmissions(
    input: $input
    first: $first
    after: $after
    last: $last
    before: $before
  ) {
    candidateSubmissions {
      ...CandidateSubmissionsFields
      __typename
    }
    totalCount
    pageInfo {
      startCursor
      hasPreviousPage
      hasNextPage
      endCursor
      __typename
    }
    __typename
  }
}

fragment CandidateSubmissionsFields on CandidateSubmission {
  __typename
  id
  data {
    __typename
    metadata {
      data {
        ... on CandidateEmploymentHistory {
          jobTitle
          company
          __typename
        }
        __typename
      }
      __typename
    }
    activity {
      ... on CandidateSubmissionWithdrawActivity {
        actor {
          type
          __typename
        }
        __typename
      }
      __typename
    }
    candidateIdentity {
      candidateId
      jobseekerAccountKey
      __typename
    }
    submissionUuid
    created
    profile {
      name {
        displayName
        __typename
      }
      location {
        country
        location
        __typename
      }
      contact {
        phoneNumber
        __typename
      }
      __typename
    }
    jobs {
      ...JobsConnectionFields
      __typename
    }
    milestone {
      ...MilestoneFields
      __typename
    }
    moderation {
      isRestricted
      __typename
    }
    sources {
      sourceType
      __typename
    }
    ... on LegacyCandidateSubmission {
      legacyID
      __typename
    }
    ... on IndeedApplyCandidateSubmission {
      legacyID
      __typename
    }
    ... on EmployerGeneratedCandidateSubmission {
      legacyID
      __typename
    }
    ... on HiddenEmployerGeneratedCandidateSubmission {
      legacyID
      __typename
    }
    ... on HiddenIndeedApplyCandidateSubmission {
      legacyID
      __typename
    }
    ... on IndeedApplyCandidateSubmission {
      legacyID
      __typename
    }
    resume {
      ... on CandidatePdfResume {
        id
        downloadUrl
        txtDownloadUrl
        __typename
      }
      ... on CandidateHtmlFile {
        id
        downloadUrl
        body
        __typename
      }
      ... on CandidateTxtFile {
        id
        downloadUrl
        body
        __typename
      }
      ... on CandidateUnrenderableFile {
        id
        downloadUrl
        __typename
      }
      __typename
    }
    sentiments: feedback(first: 1, input: {filter: {feedbackType: INTEREST_LEVEL}}) {
      feedback {
        id
        __typename
        ... on EmployerCandidateSentiment {
          id
          interestLevel
          __typename
        }
        ... on EmployerCandidateFeedback {
          id
          interestLevel
          __typename
        }
      }
      __typename
    }
    notes: feedback(input: {filter: {feedbackType: COMMENT}}) {
      feedback {
        id
        __typename
        ... on EmployerCandidateComment {
          id
          feedbackText
          created
          __typename
        }
        ... on EmployerCandidateFeedback {
          id
          feedbackText
          created
          __typename
        }
      }
      __typename
    }
    ... on IndeedApplyCandidateSubmission {
      empAssistExpirationTimestamp
      __typename
    }
  }
}

fragment MilestoneFields on CandidateSubmissionCurrentMilestone {
  milestone {
    category
    milestoneId
    __typename
  }
  __typename
}

fragment JobsConnectionFields on CandidateSubmissionJobsConnection {
  edges {
    node {
      id
      jobData {
        title
        id
        applyMethod {
          method
          ... on JobPostEmailApplyMethod {
            emails
            __typename
          }
          __typename
        }
        resumeRequired
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
}`
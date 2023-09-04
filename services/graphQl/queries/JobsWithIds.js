const { gql } = require("graphql-request");
module.exports = gql`
  fragment Jmfe_PaginationControl_BidirectionalCursorInfo on BidirectionalCursorInfo {
    endCursor
    startCursor
    __typename
  }

  query EntJobTableMfe_EmployerJobSearch_Optimized(
    $input: FindEmployerJobsInput!
    $hqm_employer_on_by_default1: Boolean!
  ) {
    findEmployerJobs(input: $input) {
      pageInfo {
        ...Jmfe_PaginationControl_BidirectionalCursorInfo
        hasNextPage
        hasPreviousPage
        __typename
      }
      results {
        employerJob {
          id
          jobData {
            id
            ... on HostedJobPost {
              legacyId
              __typename
            }
            __typename
          }
          ...Jmfm_ActionDropdown_EmployerJob
          ...Jmfm_JobStatusDropdown_EmployerJob
          ...UjlCandidatesPipeline_EmployerJob
          ...Jmfm_JobTld_EmployerJob
          ...Jmfm_SponsorshipStatus_EmployerJob
          ...Jmfm_IndividualJobMessage_EmployerJob
          ...EJM_BulkActions_EmployerJob
          ...EJM_DateCreated_EmployerJob
          ...EJM_PostedBy_EmployerJob
          ...EJM_JobStar_EmployerJob
          ...Ijm_IndeedApplyQuery
          __typename
        }
        __typename
      }
      __typename
    }
  }

  fragment Jmfm_ActionDropdown_EmployerJob on EmployerJob {
    id
    jobData {
      id
      description
      formattedDescription {
        htmlDescription
      }
      advertisingLocations {
        active
        jobKey
        location
        publicJobPageUrl
        __typename
      }
      claimData {
        __typename
        claimVersion
        status
        isEditable
        claimedBy {
          id
          hostedEmployerId
          __typename
        }
      }
      __typename
      externalJobPageUrl
      source {
        id
        __typename
      }
      applyMethod {
        method
        __typename
      }
      company
      ... on HostedJobPost {
        legacyId
        status
        campaign {
          __typename
          id
          status
          type
          isMigratedFromSponsorAll
          budget
          isSponsorAll
          uuid
          name
        }
        ujlActionDropdownAttributes: attributes(
          keys: [
            "isCpoEligible"
            "itaAssociated"
            "icrClaimStatus"
            "d2i1mInterviewSessionUuid"
            "expectedHireDate"
            "sponsorshipOptionLocked"
          ]
        ) {
          key
          value
          __typename
        }
        hostedJobBudget {
          id
          __typename
          ... on PeriodicSponsoredJobBudget {
            amount
            cost
            currency
            outOfBudget
            plan
            endDate
            maxCpc
            __typename
          }
        }
        title
        country
        language
        dateCreated
        origin
        hostedJobPostVisibility {
          level
          __typename
        }
        oneToOneDirectToInterviewInfo {
          isEnabled
          __typename
        }
        oneToOneDirectToMessagingInfo {
          jobOptInInfo {
            status
            __typename
          }
          __typename
        }
        enabledAutomationsAttributes: attributes(
          keys: ["employerAssistOptedIn"]
        ) {
          key
          value
          __typename
        }
        highQualityMarketplaceInfo @include(if: $hqm_employer_on_by_default1) {
          isOptedIn
          isEnabled
          eligibilityState
          pointOfContactAccountKey
          responsiveness {
            atRiskContacts
            deadlineExceededContacts
            __typename
          }
          __typename
        }
        __typename
      }
    }
    jobPostStatus {
      surfaceStatuses {
        isSponsorshipRequired
        isSponsorshipTargeted
        isSponsorshipApplied
        __typename
      }
      __typename
    }
    applicationsCount {
      total
      milestoneCounts {
        count
        milestone
        __typename
      }
      __typename
    }
    __typename
  }

  fragment Jmfm_JobStatusDropdown_EmployerJob on EmployerJob {
    id
    applicationsCount {
      total
      __typename
    }
    jobData {
      ... on HostedJobPost {
        id
        legacyId
        title
        status
        origin
        ujlJobStatusDropdownAttributes: attributes(
          keys: ["icrClaimStatus", "itaAssociated"]
        ) {
          key
          value
          __typename
        }
        messagingTag {
          structuredTags {
            tagName
            __typename
          }
          __typename
        }
        hostedJobPostVisibility {
          level
          __typename
        }
        hostedJobBudget {
          __typename
          id
          ... on PeriodicSponsoredJobBudget {
            outOfBudget
            __typename
          }
        }
        dateCreated
        dateLastModified
        __typename
      }
      ... on ExternalJobPost {
        id
        __typename
      }
      __typename
    }
    jobPostStatus {
      surfaceStatuses {
        isSponsorshipApplied
        isSponsorshipRequired
        isSponsorshipTargeted
        __typename
      }
      __typename
    }
    __typename
  }

  fragment UjlCandidatesPipeline_EmployerJob on EmployerJob {
    id
    jobData {
      id
      applyMethod {
        method
        __typename
      }
      claimData {
        isEditable
        status
        __typename
      }
      ... on HostedJobPost {
        origin
        __typename
      }
      __typename
    }
    ...UjlCandidatesPipeline_ApplyOnCareerSite_EmployerJob
    ...UjlCandidatesPipeline_HostedIndeedApply_EmployerJob
    ...UjlCandidatesPipeline_IndeedHiringPlatform_EmployerJob
    ...UjlCandidatesPipeline_InputForApplyStarts_EmployerJob
    __typename
  }

  fragment UjlCandidatesPipeline_ApplyOnCareerSite_EmployerJob on EmployerJob {
    id
    jobData {
      id
      title
      ... on HostedJobPost {
        legacyId
        origin
        ujlCandidatesPipelineApplyOnCareerSiteAttributes: attributes(
          keys: ["icrInitialClaimStatus"]
        ) {
          key
          value
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment UjlCandidatesPipeline_HostedIndeedApply_EmployerJob on EmployerJob {
    id
    applicationsCount {
      sponsored
      total
      milestoneCounts {
        count
        milestone
        __typename
      }
      __typename
    }
    jobData {
      id
      ... on HostedJobPost {
        country
        status
        legacyId
        hostedJobPostVisibility {
          level
          __typename
        }
        ujlCandidatesPipelineHostedIndeedApplyAttributes: attributes(
          keys: [
            "autopausedDismissedTimestamp"
            "intHiresNeeded"
            "intHiresMadeExternal"
            "intHiresMadeIndeed"
            "updateStatusReason"
          ]
        ) {
          key
          value
          __typename
        }
        hostedJobBudget {
          id
          ... on OutcomeSponsoredJobBudget {
            planAttributes {
              name
              value
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
    __typename
  }

  fragment UjlCandidatesPipeline_IndeedHiringPlatform_EmployerJob on EmployerJob {
    id
    jobData {
      id
      advertisingLocations {
        active
        jobKey
        __typename
      }
      ... on HostedJobPost {
        legacyId
        ujlCandidatesPipelineIndeedHiringPlatformAttributes: attributes(
          keys: ["d2i1mInterviewSessionUuid"]
        ) {
          key
          value
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment UjlCandidatesPipeline_InputForApplyStarts_EmployerJob on EmployerJob {
    id
    jobData {
      id
      dateCreated
      advertisingLocations {
        jobKey
        __typename
      }
      __typename
    }
    __typename
  }

  fragment Jmfm_JobTld_EmployerJob on EmployerJob {
    id
    jobData {
      id
      title
      datePostedOnIndeed
      __typename
      advertisingLocations {
        __typename
        active
        jobKey
        location
      }
      location {
        __typename
        streetAddress
        formatted {
          __typename
          long
        }
      }
      country
      ... on HostedJobPost {
        origin
        legacyId
        attributes(keys: ["icrClaimStatus"]) {
          key
          value
          __typename
        }
        oneToOneDirectToInterviewInfo {
          isEnabled
          __typename
        }
        hostedJobBudget {
          id
          ... on PeriodicSponsoredJobBudget {
            endDate
            __typename
          }
          __typename
        }
        __typename
      }
      ... on ExternalJobPost {
        dateCreated
        __typename
      }
    }
    __typename
  }

  fragment Jmfm_SponsorshipStatus_EmployerJob on EmployerJob {
    id
    jobPostStatus {
      surfaceStatuses {
        isSponsorshipApplied
        isSponsorshipTargeted
        __typename
      }
      __typename
    }
    jobData {
      id
      datePostedOnIndeed
      dateCreated
      __typename
      advertisingLocations {
        active
        jobKey
        location
        publicJobPageUrl
        __typename
      }
      ... on HostedJobPost {
        legacyId
        hostedJobBudget {
          id
          ... on PeriodicSponsoredJobBudget {
            currency
            amount
            cost
            plan
            __typename
          }
          ... on OutcomeSponsoredJobBudget {
            planStartDate
            desiredOutcomes
            planType
            __typename
          }
          __typename
        }
        campaign {
          id
          status
          name
          __typename
          uuid
          type
          isMigratedFromSponsorAll
        }
        status
        claimData {
          __typename
          claimVersion
        }
        jmfmSponsorshipStatusAttributes: attributes(
          keys: ["isCpoEligible", "intHiresNeeded"]
        ) {
          key
          value
          __typename
        }
        __typename
      }
    }
    __typename
  }

  fragment Jmfm_IndividualJobMessage_EmployerJob on EmployerJob {
    id
    jobData {
      __typename
      id
      advertisingLocations {
        location
        active
        __typename
      }
      title
      country
      claimData {
        __typename
        claimVersion
        isEditable
        status
      }
      ... on HostedJobPost {
        hostedJobPostVisibility {
          __typename
          level
        }
        campaign {
          id
          status
          __typename
        }
        dateCreated
        dateLastModified
        hostedJobBudget {
          __typename
          id
          ... on PeriodicSponsoredJobBudget {
            outOfBudget
            amount
            currency
            plan
            __typename
          }
        }
        highQualityMarketplaceInfo {
          __typename
          eligibilityState
          isOptedIn
          isEnabled
          pointOfContactAccountKey
          responsiveness {
            __typename
            atRiskContacts
            deadlineExceededContacts
          }
        }
        individualJobMessageAttributes: attributes(
          keys: [
            "isCpoEligible"
            "intHiresNeeded"
            "itaAssociated"
            "topLevelResponse"
            "updateStatusReason"
          ]
        ) {
          key
          value
          __typename
        }
        legacyId
        origin
        status
        messagingTag {
          msgTagResultExclude
          isEstimated
          jobKey
          estimatedVisibility
          structuredTags {
            tagId
            tagName
            generalMessage
            jobsMessage
            policyLink
            notification
            translations {
              jobsMessage {
                locale
                translatedText
                __typename
              }
              generalMessage {
                locale
                translatedText
                __typename
              }
              policyLink {
                locale
                translatedText
                __typename
              }
              __typename
            }
            matchingStrings {
              field
              matchingText
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
    }
    __typename
  }

  fragment EJM_BulkActions_EmployerJob on EmployerJob {
    id
    ...EJM_BulkActions_AggregatedData
    ...EJM_BulkActions_Eligibility_EmployerJob
    ...EJM_BulkActions_BulkReportHireModal_EmployerJob
    ...EJM_BulkActions_ErrorModal_EmployerJob
    __typename
  }

  fragment EJM_BulkActions_AggregatedData on EmployerJob {
    ...EJM_BulkActions_Aggregated_Source_EmployerJob
    ...EJM_BulkActions_Aggregated_JobKeys_EmployerJob
    ...EJM_BulkActions_Aggregated_LegacyId_EmployerJob
    ...EJM_BulkActions_Aggregated_UuId_EmployerJob
    __typename
  }

  fragment EJM_BulkActions_Aggregated_Source_EmployerJob on EmployerJob {
    jobData {
      source {
        id
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_BulkActions_Aggregated_JobKeys_EmployerJob on EmployerJob {
    jobData {
      advertisingLocations {
        active
        jobKey
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_BulkActions_Aggregated_LegacyId_EmployerJob on EmployerJob {
    jobData {
      __typename
      ... on HostedJobPost {
        legacyId
        __typename
      }
    }
    __typename
  }

  fragment EJM_BulkActions_Aggregated_UuId_EmployerJob on EmployerJob {
    jobData {
      __typename
      ... on HostedJobPost {
        id
        __typename
      }
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_EmployerJob on EmployerJob {
    ...EJM_BulkActions_Eligibility_Sources_EmployerJob
    ...EJM_BulkActions_Eligibility_MultiLocation_EmployerJob
    ...EJM_BulkActions_Eligibility_Pending_EmployerJob
    ...EJM_BulkActions_Eligibility_CPA_EmployerJob
    ...EJM_BulkActions_Eligibility_JobType_EmployerJob
    ...EJM_BulkActions_Eligibility_ApplyMethod_EmployerJob
    ...EJM_BulkActions_Eligibility_Active_EmployerJob
    __typename
  }

  fragment EJM_BulkActions_Eligibility_Sources_EmployerJob on EmployerJob {
    id
    jobData {
      source {
        id
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_MultiLocation_EmployerJob on EmployerJob {
    id
    jobData {
      advertisingLocations {
        active
        jobKey
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_Pending_EmployerJob on EmployerJob {
    id
    jobData {
      advertisingLocations {
        active
        jobKey
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_CPA_EmployerJob on EmployerJob {
    id
    jobData {
      __typename
      ... on HostedJobPost {
        hostedJobBudget {
          __typename
        }
        __typename
      }
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_JobType_EmployerJob on EmployerJob {
    id
    jobData {
      __typename
      claimData {
        claimVersion
        status
        isEditable
        __typename
      }
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_ApplyMethod_EmployerJob on EmployerJob {
    id
    jobData {
      __typename
      applyMethod {
        __typename
        method
      }
    }
    __typename
  }

  fragment EJM_BulkActions_Eligibility_Active_EmployerJob on EmployerJob {
    id
    jobData {
      __typename
      ... on HostedJobPost {
        status
        __typename
      }
    }
    __typename
  }

  fragment EJM_BulkActions_BulkReportHireModal_EmployerJob on EmployerJob {
    id
    jobData {
      ... on HostedJobPost {
        id
        legacyId
        title
        advertisingLocations {
          active
          location
          __typename
        }
        claimData {
          claimVersion
          status
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_BulkActions_ErrorModal_EmployerJob on EmployerJob {
    id
    jobData {
      __typename
      id
      title
      location {
        formatted {
          long
          __typename
        }
        __typename
      }
      advertisingLocations {
        active
        jobKey
        __typename
      }
      claimData {
        claimVersion
        status
        __typename
      }
    }
    __typename
  }

  fragment EJM_DateCreated_EmployerJob on EmployerJob {
    id
    jobData {
      ... on HostedJobPost {
        legacyId
        datePostedOnIndeed
        hostedJobBudget {
          ... on PeriodicSponsoredJobBudget {
            endDate
            grouping
            __typename
          }
          __typename
        }
        __typename
      }
      ... on ExternalJobPost {
        datePostedOnIndeed
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_PostedBy_EmployerJob on EmployerJob {
    jobData {
      applyMethod {
        method
        ... on JobPostEmailApplyMethod {
          emails
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment EJM_JobStar_EmployerJob on EmployerJob {
    employerJobGroupMembership {
      isStarred
      __typename
    }
    __typename
  }

  fragment Ijm_IndeedApplyQuery on EmployerJob {
    id
    jobData {
      title
      salary {
        maximumMinor
        minimumMinor
        period
        __typename
      }
      ... on HostedJobPost {
        indeedApplySingleJobEditModalAttributes: attributes(
          keys: ["workLocationType"]
        ) {
          key
          value
          __typename
        }
        taxonomyAttributes {
          attributes {
            label
            __typename
          }
          customClassUuid
          __typename
        }
        __typename
      }
      __typename
    }
    jobPostStatus {
      surfaceStatuses {
        isSponsorshipRequired
        isSponsorshipTargeted
        isSponsorshipApplied
        __typename
      }
      __typename
    }
    __typename
  }
`;

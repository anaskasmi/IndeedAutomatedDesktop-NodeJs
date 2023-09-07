const { gql } = require("graphql-request");
module.exports = gql`

  query EntJobTableMfe_EmployerJobSearch_Optimized(
    $input: FindEmployerJobsInput!
  ) {
    findEmployerJobs(input: $input) {
      results {
        employerJob {
          id
          jobData {
            id
            applyMethod {
              method
              ... on JobPostEmailApplyMethod {
                emails
                __typename
              }
              __typename
            }
            __typename      
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
      formattedDescription {
        htmlDescription
      }
      company
      ... on HostedJobPost {
        status
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
        dateCreated
      }
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
        ujlActionDropdownAttributes: attributes(
          keys: [
            "expectedHireDate"
          ]
        ) {
          key
          value
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
      }
    }
    __typename
  }

  fragment EJM_BulkActions_EmployerJob on EmployerJob {
    id
    ...EJM_BulkActions_ErrorModal_EmployerJob
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
    __typename
  }
`;

const { request, gql, GraphQLClient } = require('graphql-request');

export function getJobEditDraft() {

    const query = gql `
    query getdraftJobPosts($jobIds: [ID!]!) {
        draftJobPosts(ids: $jobIds) {
          results {
            draftJobPost {
              ...DraftJobPostFields
              __typename
            }
            __typename
          }
          __typename
        }
      }

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
      }       

        `;
    const variables = {
        "jobIds": [
            "627a9fa83fa1675404443685"
        ]
    };

    const client = new GraphQLClient("https://apis.indeed.com/graphql?locale=en&co=US", {
        headers: {
            'indeed-api-key': '0f2b0de1b8ff96890172eeeba0816aaab662605e3efebbc0450745798c4b35ae',
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "indeed-client-application": "ic-jobs-management",
            "sec-ch-ua": "\"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-datadog-origin": "rum",
            "x-datadog-parent-id": "1256698936099227697",
            "x-datadog-sampled": "1",
            "x-datadog-sampling-priority": "1",
            "x-datadog-trace-id": "4781717318849204701",
            "x-indeed-rpc": "1",
            "cookie": JobsServices.cookie,
            "Referer": `https://employers.indeed.com/em/job-details/${jobId}`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    })
    let response = await client.request(query, variables);
    if (!response ||
        !response.draftJobPosts ||
        !response.draftJobPosts.results ||
        !response.draftJobPosts.results[0] ||
        !response.draftJobPosts.results[0].draftJobPost
    ) {
        throw Error('cant getJobFullDetails !');
    }
    return response.draftJobPosts.results[0].draftJobPost;
}
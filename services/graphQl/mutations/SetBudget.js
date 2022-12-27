  const { gql } = require('graphql-request')

  module.exports = gql `mutation SetBudget($encryptedJobId: String!, $budget: BudgetInput!) {
      setBudget(jobId: $encryptedJobId, budgetInput: $budget) {
        ... on FreeBudget {
          plan
          grouping
          __typename
      }
      ... on PeriodicBudget {
          currency
          plan
          amount
          maxCpc
          endDate
          __typename
      }
      __typename
  }
}
  `;
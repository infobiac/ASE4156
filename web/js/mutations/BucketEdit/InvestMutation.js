// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';

import type {
  InvestMutationMutationVariables,
  InvestMutationMutationResponse,
} from './__generated__/InvestMutationMutation.graphql';

const mutation = graphql`
  mutation InvestMutationMutation(
    $quantity: Float!,
    $tradingAccId: ID!,
    $bucketId: ID!,
  ) {
    invest(
      quantity: $quantity,
      tradingAccId: $tradingAccId,
      bucketId: $bucketId,
    ) {
      tradingAccount {
        id
        availableCash
      }
      bucket {
        id
        ownedAmount
      }
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?InvestMutationMutationResponse, errors: ?[Error]) => void,
) => (environment: RelayEnvironment) => (
  variables: InvestMutationMutationVariables,
  optimisticResponse?: ?InvestMutationMutationResponse,
) => {
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse,
    onCompleted,
  });
};

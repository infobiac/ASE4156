// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';

import type {
  CreateBucketMutationVariables,
  CreateBucketMutationResponse,
} from './__generated__/CreateBucketMutation.graphql';

const mutation = graphql`
  mutation CreateBucketMutation($name: String!, $public: Boolean!, $investment: Float!) {
    addBucket(name: $name, public: $public, investment: $investment) {
       bucket {
         id
         ...InvestBucketRelay_bucket
      }
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?CreateBucketMutationResponse, errors: ?[Error]) => void,
) => (environment: RelayEnvironment) => (variables: CreateBucketMutationVariables) => {
  const optimisticResponse = {
    addBucket: {
      bucket: {
        name: variables.name,
        available: variables.investment,
        description: {
          edges: [],
        },
      },
    },
  };
  commitMutation(environment, {
    mutation,
    variables,
    updater,
    optimisticResponse,
    optimisticUpdater,
    onCompleted,
  });
};

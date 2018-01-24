// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';
import type {
  ChangeBucketCompositionMutationVariables,
  ChangeBucketCompositionMutationResponse,
} from './__generated__/ChangeBucketCompositionMutation.graphql';

const mutation = graphql`
  mutation ChangeBucketCompositionMutation($id: ID!, $config: [GInvestmentBucketConfigurationUpdate]!) {
    editConfiguration(config: $config, idValue: $id) {
       bucket {
         id
         ...InvestCompositionRelay_bucket
       }
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?ChangeBucketCompositionMutationResponse, errors: ?[Error]) => void,
) => (environment: RelayEnvironment) => (variables: ChangeBucketCompositionMutationVariables) => {
  const optimisticResponse = {
    editConfiguration: {
      bucket: {
        id: variables.id,
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

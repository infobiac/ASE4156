// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';

import type {
  DeleteBucketMutationVariables,
  DeleteBucketMutationResponse,
} from './__generated__/DeleteBucketMutation.graphql';

const mutation = graphql`
  mutation DeleteBucketMutation($id: ID!) {
    deleteBucket(idValue: $id) {
      isOk
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?DeleteBucketMutationResponse, errors: ?[Error]) => void,
) => (
  environment: RelayEnvironment,
) => (
  variables: DeleteBucketMutationVariables,
) => {
  const optimisticResponse = {
    deleteBucket: {
      ok: true,
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

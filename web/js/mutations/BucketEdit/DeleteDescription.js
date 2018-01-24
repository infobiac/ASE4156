// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';

import type {
  DeleteDescriptionMutationVariables,
  DeleteDescriptionMutationResponse,
} from './__generated__/DeleteDescriptionMutation.graphql';

const mutation = graphql`
  mutation DeleteDescriptionMutation($id: ID!) {
    deleteAttribute(idValue: $id) {
      isOk
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?DeleteDescriptionMutationResponse, errors: ?[Error]) => void,
) => (environment: RelayEnvironment) => (variables: DeleteDescriptionMutationVariables) => {
  const optimisticResponse = {
    deleteAttribute: {
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

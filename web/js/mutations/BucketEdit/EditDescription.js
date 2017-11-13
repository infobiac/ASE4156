// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';

import type {
  EditDescriptionMutationVariables,
  EditDescriptionMutationResponse,
} from './__generated__/EditDescriptionMutation.graphql';

const mutation = graphql`
  mutation EditDescriptionMutation($id: ID!, $text: String!) {
    editAttribute(desc: $text, idValue: $id) {
       bucketAttr {
         text
      }
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?EditDescriptionMutationResponse, errors: ?[Error]) => void,
) => (environment: RelayEnvironment) => (variables: EditDescriptionMutationVariables) => {
  const optimisticResponse = {
    editAttribute: {
      bucketAttr: {
        text: variables.text,
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

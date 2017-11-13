// @flow
import { graphql, commitMutation } from 'react-relay';

import type {
  RecordSourceSelectorProxy,
  RelayEnvironment,
  SelectorData,
} from 'react-relay';
import type {
  AddDescriptionMutationVariables,
  AddDescriptionMutationResponse,
} from './__generated__/AddDescriptionMutation.graphql';

const mutation = graphql`
  mutation AddDescriptionMutation($text: String!, $bucketId: ID!, $isGood: Boolean!) {
    addAttributeToBucket(desc: $text, bucketId: $bucketId, isGood: $isGood) {
       bucketAttr {
         text
         isGood
      }
    }
  }
`;

export default (
  updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  onCompleted?: ?(response: ?AddDescriptionMutationResponse, errors: ?[Error]) => void,
) => (environment: RelayEnvironment) => (variables: AddDescriptionMutationVariables) => {
  const optimisticResponse = {
    addAttributeToBucket: {
      bucketAttr: {
        text: variables.text,
        isGood: variables.isGood,
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

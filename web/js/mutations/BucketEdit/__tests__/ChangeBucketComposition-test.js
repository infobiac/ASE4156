import {
  RecordSource,
  Store,
  Environment,
} from 'relay-runtime';
import { commitMutation } from 'react-relay';
import ChangeBucketComposition from '../ChangeBucketComposition';

jest.mock('react-relay', () => ({
  graphql: jest.fn(),
  commitMutation: jest.fn(),
}));

const ctx = () => {
  const source = new RecordSource();
  const store = new Store(source);
  const network = jest.fn();
  return {
    environment: new Environment({
      network,
      store,
    }),
    variables: {},
  };
};

describe('ChangeBucketComposition', () => {
  it('exists', () => {
    expect(ChangeBucketComposition).toBeTruthy();
  });

  it('mutates', () => {
    const data = { id: '1' };
    ChangeBucketComposition(null, null, null)(ctx().environment)(data);
    expect(commitMutation.mock.calls.length).toEqual(1);
    expect(commitMutation.mock.calls[0][1].variables).toEqual(data);
    expect(commitMutation.mock.calls).toMatchSnapshot();
  });
});

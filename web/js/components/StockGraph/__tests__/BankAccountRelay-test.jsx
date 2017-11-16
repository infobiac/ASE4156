import React from 'react';
import { mount } from 'enzyme';
import {
  Environment,
  RecordSource,
  Store,
} from 'relay-runtime';
import BankAccountRelay from '../BankAccountRelay';

function ctx() {
  const source = new RecordSource();
  const store = new Store(source);
  const network = jest.fn();
  return {
    context: {
      relay: {
        environment: new Environment({
          network,
          store,
        }),
        variables: {},
      },
    },
  };
}

describe('BankAccountRelay', () => {
  it('exists', () => {
    expect(BankAccountRelay).toBeTruthy();
  });

  it('renders', () => {
    const comp = mount(
      (
        <BankAccountRelay
          bank={{
            __id: '1',
            __fragments: { BankAccountRelay_bank: {} },
            name: 'Test Name',
            history: [{
              date: '2017-06-06',
              value: 0.33,
            }],
          }}
        />
      ), ctx(),
    );
    expect(comp).toMatchSnapshot();
  });
});

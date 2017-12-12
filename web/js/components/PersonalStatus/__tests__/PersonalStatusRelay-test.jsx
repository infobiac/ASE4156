import React from 'react';
import { mount } from 'enzyme';
import {
  Environment,
  RecordSource,
  Store,
} from 'relay-runtime';
import PersonalStatusRelay from '../PersonalStatusRelay';

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

describe('PersonalStatusRelay', () => {
  it('exists', () => {
    expect(PersonalStatusRelay).toBeTruthy();
  });

  it('renders', () => {
    const comp = mount(
      (
        <PersonalStatusRelay
          bank={{
            balance: 100.0,
            income: 101.00,
            outcome: 30.0,
            monthlyStart: '2017-06-06',
            monthlyEnd: '2017-07-06',
            balanceDate: '2017-07-06',
            __id: '1',
            __fragments: {
              PersonalStatusRelay_bank: {},
            },
          }}
          account={{
            totalValue: 3.33,
            availableCash: 4.44,
            accountName: 'Some Name',
            __id: '2',
            __fragments: {
              PersonalStatusRelay_account: {},
            },
          }}
        />
      ), ctx(),
    );
    expect(comp).toMatchSnapshot();
  });
});

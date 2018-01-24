import React from 'react';
import { mount } from 'enzyme';
import {
  Environment,
  RecordSource,
  Store,
} from 'relay-runtime';
import Home from '../Home';

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

jest.mock(
  '../../components/PersonalStatus/PersonalStatusRelay',
  () => require('../../__mocks__/EmptyComponent'), // eslint-disable-line global-require
);
jest.mock(
  '../../components/StockGraph/BankAccountRelay',
  () => require('../../__mocks__/EmptyComponent'), // eslint-disable-line global-require
);
jest.mock(
  '../../components/InvestBucket/InvestBucketGridRelay',
  () => require('../../__mocks__/EmptyComponent'), // eslint-disable-line global-require
);

describe('Home', () => {
  it('exists', () => {
    expect(Home).toBeTruthy();
  });

  it('renders', () => {
    const comp = mount(
      (
        <Home
          viewer={{
            __id: '3',
            __fragments: {
              Home_viewer: {},
            },
            profile: {
              __id: '1',
              __fragments: {
                InvestBucketGridRelay_profile: {},
              },
            },
            userbank: {
              edges: [{
                node: { bank: null },
                __id: '2',
                __fragments: {
                  BankAccountRelay_bank: {},
                  PersonalStatusRelay_bank: {},
                },
              }],
            },
          }}
        >
          <div>Child Test</div>
        </Home>
      ), ctx(),
    );
    expect(comp).toMatchSnapshot();
  });

  it('fails on no bank', () => {
    const comp = mount(
      (
        <Home
          viewer={{
            __id: '3',
            __fragments: {
              Home_viewer: {},
            },
            profile: {
              __id: '1',
              __fragments: {
                InvestBucketGridRelay_profile: {},
              },
            },
            userbank: {
              edges: [],
            },
          }}
        />
      ), ctx(),
    );
    expect(comp).toMatchSnapshot();
  });

  it('fails on no userbank', () => {
    const comp = mount(
      (
        <Home
          viewer={{
            __id: '3',
            __fragments: {
              Home_viewer: {},
            },
            profile: {
              __id: '1',
              __fragments: {
                InvestBucketGridRelay_profile: {},
              },
            },
            userbank: null,
          }}
        />
      ), ctx(),
    );
    expect(comp).toMatchSnapshot();
  });

  it('skips empty bank', () => {
    const comp = mount(
      (
        <Home
          viewer={{
            __id: '3',
            __fragments: {
              Home_viewer: {},
            },
            profile: {
              __id: '1',
              __fragments: {
                InvestBucketGridRelay_profile: {},
              },
            },
            userbank: {
              edges: [null],
            },
          }}
        />
      ), ctx(),
    );
    expect(comp).toMatchSnapshot();
  });
});

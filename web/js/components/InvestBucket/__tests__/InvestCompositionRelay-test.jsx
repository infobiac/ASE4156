import React from 'react';
import { mount } from 'enzyme';
import {
  Environment,
  RecordSource,
  Store,
  Network,
} from 'relay-runtime';
import PropTypes from 'prop-types';
import { routerShape } from 'found';

import type { Node } from 'react';

import InvestCompositionRelay from '../InvestCompositionRelay';
import ChangeComposition from '../../../mutations/BucketEdit/ChangeBucketComposition';
import InvestComposition from '../InvestComposition';

jest.mock(
  '../InvestComposition',
  () => jest.fn(() => <div />),
);
jest.mock(
  '../../../mutations/BucketEdit/ChangeBucketComposition',
  () => {
    const inner1 = jest.fn();
    const inner2 = jest.fn(() => inner1);
    const outer = jest.fn(() => inner2);
    return outer;
  },
);

const ctx = () => {
  const source = new RecordSource();
  const store = new Store(source);
  const nf = jest.fn(() => ({ data: { viewer: null } }));
  const network = Network.create(nf);
  const relay = {
    environment: new Environment({
      network,
      store,
    }),
    variables: {},
  };
  return ({
    errorDisplay: jest.fn(),
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      go: jest.fn(),
      createHref: jest.fn(),
      createLocation: jest.fn(),
      isActive: jest.fn(),
      matcher: {
        match: jest.fn(),
        getRoutes: jest.fn(),
        isActive: jest.fn(),
        format: jest.fn(),
      },
      addTransitionHook: jest.fn(),
    },
    relay,
    network: nf,
  });
};

class CtxProvider extends React.Component<{children: () => Node, ctx: any}> {
  static childContextTypes = {
    errorDisplay: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    relay: PropTypes.any.isRequired,
    network: PropTypes.any.isRequired,
  }
  getChildContext() {
    return this.props.ctx;
  }
  render() {
    return (
      <div>
        {this.props.children(this.props.ctx.relay)}
      </div>
    );
  }
}

describe('InvestCompositionRelay', () => {
  let comp;
  let context;

  beforeEach(() => {
    context = ctx();
    comp = mount((
      <CtxProvider ctx={context}>
        {
          con => (
            <InvestCompositionRelay
              relay={con.relay}
              bucket={{
                __id: '1',
                __fragments: { InvestCompositionRelay_bucket: {} },
                id: '1',
                available: 30.0,
                stocks: {
                  edges: [
                  {
                    node: {
                      quantity: 3,
                      stock: {
                        id: '4',
                        name: 'Stock',
                        latestQuote: {
                          value: 44.4,
                        },
                      },
                    },
                  }, null,
                  ],
                },
              }}
              profile={{
                __id: '2',
                __fragments: { InvestCompositionRelay_profile: {} },
                investSearch: [{ name: 'Name', id: '3', latestQuote: { value: 3.3 } }, null],
              }}
            />
          )
        }
      </CtxProvider>
    ));
  });

  it('exists', () => {
    expect(InvestCompositionRelay).toBeTruthy();
  });

  it('renders', () => {
    expect(comp).toMatchSnapshot();
  });

  it('closes', () => {
    InvestComposition.mock.calls[InvestComposition.mock.calls.length - 1][0].cancelFunc();
    expect(context.router.replace.mock.calls.length).toEqual(1);
    expect(context.router.replace.mock.calls[0][0]).toEqual('/home');
  });

  it('updates Chunk', () => {
    InvestComposition.mock.calls[InvestComposition.mock.calls.length - 1][0].chunkUpdate([{
      id: '5',
      quantity: 2,
      value: 77,
      name: 'Testy McTestface',
    }]);
    expect(InvestComposition.mock.calls[InvestComposition.mock.calls.length - 1]).toMatchSnapshot();
  });

  it('fetches latest suggestions', () => {
    InvestComposition.mock.calls[InvestComposition.mock.calls.length - 1][0].suggestionFieldChange('my text');
    expect(context.network.mock.calls.length).toEqual(1);
  });

  it('saves', () => {
    InvestComposition.mock.calls[InvestComposition.mock.calls.length - 1][0].saveFunc('my text');
    expect(ChangeComposition.mock.calls.length).toEqual(1);
    expect(ChangeComposition.mock.calls[0]).toMatchSnapshot();
    expect(ChangeComposition().mock.calls.length).toEqual(1);
    expect(ChangeComposition().mock.calls[0]).toMatchSnapshot();
    expect(ChangeComposition()().mock.calls.length).toEqual(1);
    expect(ChangeComposition()().mock.calls[0]).toMatchSnapshot();
    ChangeComposition.mock.calls[0][0]({
      getRootField: jest.fn(() => ({
        getLinkedRecord: jest.fn(() => ({
          getValue: jest.fn(),
          getLinkedRecord: jest.fn(),
        })),
      })),
      getRoot: jest.fn(() => ({
        copyFieldsFrom: jest.fn(),
      })),
      get: jest.fn(() => ({
        setValue: jest.fn(),
        setLinkedRecord: jest.fn(),
      })),
    });
    expect(ChangeComposition.mock.calls[0][2](null, [Error('EEE')]));
    expect(ChangeComposition.mock.calls[0][2]({}, null));
    expect(context.errorDisplay.mock.calls).toMatchSnapshot();
  });

  it('fails render without data', () => {
    const comp2 = mount((
      <CtxProvider ctx={context}>
        {
          con => (
            <InvestCompositionRelay
              relay={con.relay}
              bucket={{
                  __id: '1',
                __fragments: { InvestCompositionRelay_bucket: {} },
                  id: '1',
                  available: 30.0,
                stocks: {
                    edges: [
                  {
                    node: {
                        quantity: 3,
                      stock: {
                          id: '4',
                          name: 'Stock',
                        latestQuote: {
                            value: 44.4,
                        },
                      },
                    },
                  },
                    ],
                },
              }}
              profile={{
                  __id: '2',
                __fragments: { InvestCompositionRelay_profile: {} },
                investSearch: null,
                }}
            />
            )
          }
      </CtxProvider>
    ));
    expect(comp2).toMatchSnapshot();
  });
});

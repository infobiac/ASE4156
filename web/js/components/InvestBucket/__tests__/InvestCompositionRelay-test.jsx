import React from 'react';
import { mount } from 'enzyme';
import {
  Environment,
  RecordSource,
  Store,
} from 'relay-runtime';
import PropTypes from 'prop-types';
import { routerShape } from 'found';

import type { Node } from 'react';

import InvestCompositionRelay from '../InvestCompositionRelay';

class CtxProvider extends React.Component<{children: () => Node}> {
  static childContextTypes = {
    errorDisplay: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    relay: PropTypes.any.isRequired,
  }
  constructor() {
    super();
    const source = new RecordSource();
    const store = new Store(source);
    const network = jest.fn();
    this.relay = {
      environment: new Environment({
        network,
        store,
      }),
      variables: {},
    };
  }
  getChildContext() {
    return {
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
      relay: this.relay,
    };
  }
  render() {
    return (
      <div>
        {this.props.children(this.relay)}
      </div>
    );
  }
}

describe('InvestCompositionRelay', () => {
  it('exists', () => {
    expect(InvestCompositionRelay).toBeTruthy();
  });

  it('renders', () => {
    const comp = mount((
      <CtxProvider>
        {
          context => (
            <InvestCompositionRelay
              relay={context.relay}
              bucket={{
                __id: '1',
                __fragments: { InvestCompositionRelay_bucket: {} },
                id: '1',
                available: 30.0,
                stocks: { edges: [] },
              }}
              profile={{
                __id: '2',
                __fragments: { InvestCompositionRelay_profile: {} },
                investSearch: [],
              }}
            />
          )
        }
      </CtxProvider>
    ));
    expect(comp).toMatchSnapshot();
  });
});

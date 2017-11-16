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

import InvestPanelRelay from '../InvestPanelRelay';

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

describe('InvestPanelRelay', () => {
  it('exists', () => {
    expect(InvestPanelRelay).toBeTruthy();
  });

  it('renders', () => {
    const comp = mount((
      <CtxProvider>
        {
          context => (
            <InvestPanelRelay
              relay={context.relay}
              bucket={{
                __id: '1',
                __fragments: { InvestPanelRelay_bucket: {} },
                id: '1',
                name: 'Some name',
                value: 33.3,
                ownedAmount: 7,
                history: [{ date: '2017-07-07', value: 55.3 }],
              }}
              profile={{
                __id: '2',
                __fragments: { InvestPanelRelay_profile: {} },
                id: '2',
                selectedAcc: {
                  availableCash: 1234.56,
                  id: '3',
                },
              }}
            />
          )
        }
      </CtxProvider>
    ));
    expect(comp).toMatchSnapshot();
  });
});

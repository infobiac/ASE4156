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

import InvestPanel from '../InvestPanel';
import InvestPanelRelay from '../InvestPanelRelay';
import InvestMutation from '../../../mutations/BucketEdit/InvestMutation';

jest.mock(
  '../InvestPanel',
  () => jest.fn(() => <div />),
);
jest.mock(
  '../../../mutations/BucketEdit/InvestMutation',
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
  const network = jest.fn();
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
  });
};

class CtxProvider extends React.Component<{children: () => Node, ctx: any}> {
  static childContextTypes = {
    errorDisplay: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    relay: PropTypes.any.isRequired,
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

describe('InvestPanelRelay', () => {
  it('exists', () => {
    expect(InvestPanelRelay).toBeTruthy();
  });

  it('renders', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {
          con => (
            <InvestPanelRelay
              id="panel"
              relay={con.relay}
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
    // Cancel closes
    InvestPanel.mock.calls[0][0].cancelFunc();
    expect(context.router.replace.mock.calls.length).toEqual(1);
    expect(context.router.replace.mock.calls[0][0]).toEqual('/home');
    // Save
    InvestPanel.mock.calls[0][0].investFunc(3);
    expect(InvestMutation.mock.calls.length).toEqual(1);
    expect(InvestMutation.mock.calls[0]).toMatchSnapshot();
    expect(InvestMutation().mock.calls.length).toEqual(1);
    expect(InvestMutation().mock.calls[0]).toMatchSnapshot();
    expect(InvestMutation()().mock.calls.length).toEqual(1);
    expect(InvestMutation()().mock.calls[0]).toMatchSnapshot();
    InvestPanel.mock.calls[0][0].investFunc(-3);
    InvestMutation.mock.calls[0][2]({}, null);
    InvestMutation.mock.calls[InvestMutation.mock.calls.length - 1][2]({}, null);
    InvestMutation.mock.calls[0][2](null, [Error('Test')]);
    expect(context.errorDisplay.mock.calls).toMatchSnapshot();
  });
});

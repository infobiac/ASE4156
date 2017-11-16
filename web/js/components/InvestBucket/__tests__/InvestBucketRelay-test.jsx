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

import InvestBucketRelay from '../InvestBucketRelay';

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

describe('InvestBucketRelay', () => {
  it('exists', () => {
    expect(InvestBucketRelay).toBeTruthy();
  });

  it('render minimal', () => {
    const comp = mount((
      <CtxProvider>
        {context => (<InvestBucketRelay
          relay={context.relay}
          bucket={{
              __id: '1',
            __fragments: {
              InvestBucketRelay_bucket: {},
            },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: false,
              description: null,
          }}
        />)
        }
      </CtxProvider>
    ));
    expect(comp).toMatchSnapshot();
  });

  it('render owner', () => {
    const comp = mount((
      <CtxProvider>
        {context => (<InvestBucketRelay
          relay={context.relay}
          bucket={
            {
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: false,
              isOwner: true,
              description: {
                edges: [{
                  node: {
                    id: '2',
                    text: 'my text',
                    isGood: true,
                  },
                }, {
                  node: {
                    id: '3',
                    text: 'my bad text',
                    isGood: false,
                  },
                }, null],
                pageInfo: { hasNextPage: false },
              },
            }
          }
        />)
        }
      </CtxProvider>
    ));
    expect(comp).toMatchSnapshot();
  });
});

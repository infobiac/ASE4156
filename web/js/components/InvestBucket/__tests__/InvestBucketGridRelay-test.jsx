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

import InvestBucketGridRelay from '../InvestBucketGridRelay';

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

describe('InvestBucketGridRelay', () => {
  it('exists', () => {
    expect(InvestBucketGridRelay).toBeTruthy();
  });

  it('renders', () => {
    const comp = mount((
      <CtxProvider>
        {
          () => (
            <InvestBucketGridRelay
              profile={{
                id: '1',
                investSuggestions: {
                  edges: [{
                    node: {
                      __id: '2',
                      __fragments: {
                        InvestBucketRelay_bucket: {},
                      },
                      id: '2',
                      name: 'Bucket name',
                      public: true,
                      isOwner: false,
                      description: null,
                    },
                  }],
                  pageInfo: { hasNextPage: false },
                },
                __id: '1',
                __fragments: { InvestBucketGridRelay_profile: {} },
              }}
            />
          )
        }
      </CtxProvider>
    ));
    expect(comp).toMatchSnapshot();
  });
});

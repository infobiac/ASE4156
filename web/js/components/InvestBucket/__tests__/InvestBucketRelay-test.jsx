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

import InvestBucketRelay from '../InvestBucketRelay';
import deleteBucket from '../../../mutations/BucketEdit/DeleteBucket';
import addDescription from '../../../mutations/BucketEdit/AddDescription';
import editDescription from '../../../mutations/BucketEdit/EditDescription';
import deleteDescription from '../../../mutations/BucketEdit/DeleteDescription';

jest.mock(
  '../../../mutations/BucketEdit/DeleteBucket',
  () => {
    const inner1 = jest.fn();
    const inner2 = jest.fn(() => inner1);
    const outer = jest.fn(() => inner2);
    return outer;
  },
);
jest.mock(
  '../../../mutations/BucketEdit/AddDescription',
  () => {
    const inner1 = jest.fn();
    const inner2 = jest.fn(() => inner1);
    const outer = jest.fn(() => inner2);
    return outer;
  },
);
jest.mock(
  '../../../mutations/BucketEdit/EditDescription',
  () => {
    const inner1 = jest.fn();
    const inner2 = jest.fn(() => inner1);
    const outer = jest.fn(() => inner2);
    return outer;
  },
);
jest.mock(
  '../../../mutations/BucketEdit/DeleteDescription',
  () => {
    const inner1 = jest.fn();
    const inner2 = jest.fn(() => inner1);
    const outer = jest.fn(() => inner2);
    return outer;
  },
);

const ctx = (data) => {
  const source = new RecordSource();
  const store = new Store(source);
  const network = Network.create(jest.fn(() => data));
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

describe('InvestBucketRelay', () => {
  it('exists', () => {
    expect(InvestBucketRelay).toBeTruthy();
  });

  it('render minimal', () => {
    const comp = mount((
      <CtxProvider ctx={ctx()}>
        {relay => (<InvestBucketRelay
          relay={relay}
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

  it('close without delete', () => {
    const comp = mount((
      <CtxProvider ctx={ctx()}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
            bucket={{
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: true,
              description: null,
            }}
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#delete').first().simulate('click');
    expect(comp).toMatchSnapshot();
    comp.find('#dialog1').first().props().onRequestClose();
    expect(comp).toMatchSnapshot();
    comp.find('#delete').first().simulate('click');
    comp.find('#keep').first().simulate('click');
    expect(comp).toMatchSnapshot();
  });

  it('delete click', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
            bucket={{
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: true,
              description: null,
            }}
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#delete').first().simulate('click');
    expect(comp).toMatchSnapshot();
    comp.find('#delete2').first().simulate('click');
    expect(deleteBucket.mock.calls.length).toEqual(1);
    expect(deleteBucket.mock.calls[0]).toMatchSnapshot();
    expect(deleteBucket().mock.calls.length).toEqual(1);
    expect(deleteBucket().mock.calls[0]).toMatchSnapshot();
    expect(deleteBucket()().mock.calls.length).toEqual(1);
    expect(deleteBucket()().mock.calls[0]).toMatchSnapshot();
    const deleteFn = jest.fn();
    deleteBucket.mock.calls[0][0]({
      delete: deleteFn,
    });
    expect(deleteFn.mock.calls[0][0]).toEqual('1');
    deleteBucket.mock.calls[0][2]({}, null);
    deleteBucket.mock.calls[0][2](null, [Error('Test')]);
    expect(context.errorDisplay.mock.calls).toMatchSnapshot();
  });

  it('render owner', () => {
    const comp = mount((
      <CtxProvider ctx={ctx()}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
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
          />
        )
        }
      </CtxProvider>
    ));
    expect(comp).toMatchSnapshot();
  });

  it('Edit Composition', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
            bucket={{
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: true,
              description: null,
            }}
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#edit-comp').first().simulate('click');
    expect(context.router.replace.mock.calls.length).toEqual(1);
    expect(context.router.replace.mock.calls[0][0]).toEqual('/home/composition/1');
  });

  it('Invest', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
            bucket={{
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: true,
              description: null,
            }}
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#invest').first().simulate('click');
    expect(context.router.replace.mock.calls.length).toEqual(1);
    expect(context.router.replace.mock.calls[0][0]).toEqual('/home/invest/1');
  });

  it('see more...', () => {
    const context = ctx({
      data: {
        investBucket: {
          id: '1', name: 'Buck name', public: true, isOwner: true, description: { edges: [null, null, null, null], pageInfo: { hasNextPage: false, endCursor: '4' } },
        },
      },
    });
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
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
                  edges: [null, null],
                  pageInfo: { hasNextPage: true },
                },
            }
          }
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#more').first().simulate('click');
    expect(comp).toMatchSnapshot();
  });

  it('add desc', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
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
                      id: '3',
                      text: 'my bad text',
                      isGood: false,
                    },
                  }],
                  pageInfo: { hasNextPage: true },
                },
              }
            }
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#launch-edit').first().simulate('click');
    comp.find('#name').first().simulate('change', { target: { value: 'New Text' } });
    expect(comp).toMatchSnapshot();
    comp.find('#name').first().simulate('keyPress', { charCode: 13 });
    expect(comp).toMatchSnapshot();
    comp.find('#delete').first().simulate('click');
    expect(comp).toMatchSnapshot();
    comp.find('#delete2').first().simulate('click');
    expect(addDescription.mock.calls.length).toEqual(1);
    expect(addDescription.mock.calls[0]).toMatchSnapshot();
    expect(addDescription().mock.calls.length).toEqual(1);
    expect(addDescription().mock.calls[0]).toMatchSnapshot();
    expect(addDescription()().mock.calls.length).toEqual(1);
    expect(addDescription()().mock.calls[0]).toMatchSnapshot();
    addDescription.mock.calls[0][2]({}, null);
    addDescription.mock.calls[0][2](null, [Error('Test')]);
    expect(context.errorDisplay.mock.calls).toMatchSnapshot();
  });

  it('Delete Description', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
            bucket={{
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: true,
              description: {
                edges: [{
                  node: {
                    id: '3',
                    text: 'my bad text',
                    isGood: false,
                  },
                }],
                pageInfo: { hasNextPage: true },
              },
            }}
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#attr').first().simulate('click');
    comp.find('#delete-ico').first().simulate('click');
    expect(comp).toMatchSnapshot();
    expect(deleteDescription.mock.calls.length).toEqual(1);
    expect(deleteDescription.mock.calls[0]).toMatchSnapshot();
    expect(deleteDescription().mock.calls.length).toEqual(1);
    expect(deleteDescription().mock.calls[0]).toMatchSnapshot();
    expect(deleteDescription()().mock.calls.length).toEqual(1);
    expect(deleteDescription()().mock.calls[0]).toMatchSnapshot();
    const deleteFn = jest.fn();
    deleteDescription.mock.calls[0][0]({
      delete: deleteFn,
    });
    expect(deleteFn.mock.calls[0][0]).toEqual('3');
    deleteDescription.mock.calls[0][2]({}, null);
    deleteDescription.mock.calls[0][2](null, [Error('Test')]);
    expect(context.errorDisplay.mock.calls).toMatchSnapshot();
  });

  it('Edit Description', () => {
    const context = ctx();
    const comp = mount((
      <CtxProvider ctx={context}>
        {relay => (
          <InvestBucketRelay
            relay={relay}
            bucket={{
              __id: '1',
              __fragments: {
                InvestBucketRelay_bucket: {},
              },
              id: '1',
              name: 'Bucket name',
              public: true,
              isOwner: true,
              description: {
                edges: [{
                  node: {
                    id: '3',
                    text: 'my bad text',
                    isGood: false,
                  },
                }],
                pageInfo: { hasNextPage: true },
              },
            }}
          />
        )
        }
      </CtxProvider>
    ));
    comp.find('#attr').first().simulate('click');
    expect(comp).toMatchSnapshot();
    comp.find('#edit-text-field').last().simulate('change', { target: { value: 'New Attr Edit' } });
    expect(comp).toMatchSnapshot();
    comp.find('#edit-text-field').first().simulate('keyPress', { charCode: 13 });
    expect(comp).toMatchSnapshot();
    comp.find('#attr').first().simulate('click');
    comp.find('#delete-ico').first().simulate('click');
    expect(comp).toMatchSnapshot();
    expect(editDescription.mock.calls.length).toEqual(1);
    expect(editDescription.mock.calls[0]).toMatchSnapshot();
    expect(editDescription().mock.calls.length).toEqual(1);
    expect(editDescription().mock.calls[0]).toMatchSnapshot();
    expect(editDescription()().mock.calls.length).toEqual(1);
    expect(editDescription()().mock.calls[0]).toMatchSnapshot();
    editDescription.mock.calls[0][2]({}, null);
    editDescription.mock.calls[0][2](null, [Error('Test')]);
    expect(context.errorDisplay.mock.calls).toMatchSnapshot();
  });
});

// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import LockIcon from 'material-ui-icons/Lock';
import Dialog, {
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import type { RelayContext } from 'react-relay';

import InvestBucket from './InvestBucket';
import InvestPanelRelay from './InvestPanelRelay';
import InvestCompositionRelay from './InvestCompositionRelay';
import addDescription from '../../mutations/BucketEdit/AddDescription';
import editDescription from '../../mutations/BucketEdit/EditDescription';
import deleteDescription from '../../mutations/BucketEdit/DeleteDescription';
import deleteBucket from '../../mutations/BucketEdit/DeleteBucket';
import changeBucketComposition from '../../mutations/BucketEdit/ChangeBucketComposition';

import type { InvestBucketRelay_bucket } from './__generated__/InvestBucketRelay_bucket.graphql';
import type { InvestBucketRelay_profile } from './__generated__/InvestBucketRelay_profile.graphql';

type EditObj = {
  shortDesc: string,
}
type State = {
  itemCount: number,
  compositionDialog: bool,
  editMode: ?string,
  editState: EditObj,
  deleteConfirm: bool,
  investDialog: bool,
}
type Props = {
  bucket: InvestBucketRelay_bucket,
  profile: InvestBucketRelay_profile,
  relay: RelayContext,
}

class InvestBucketRelay extends React.Component<Props, State> {
  static contextTypes = {
    errorDisplay: PropTypes.func.isRequired,
  };
  constructor() {
    super();
    this.state = {
      itemCount: 2,
      compositionDialog: false,
      editMode: null,
      editState: { shortDesc: '' },
      deleteConfirm: false,
      investDialog: false,
    };
  }
  launchEdit = id => () => {
    this.setState((state, props) => {
      if (!props.bucket.description || !props.bucket.description.edges) {
        return {};
      }
      const item = props.bucket.description.edges.find(x => x && x.node && x.node.id === id);
      if (!item || !item.node || !item.node.text) {
        return {};
      }
      return {
        editMode: id,
        editState: {
          shortDesc: item.node.text,
        },
      };
    });
  }
  saveChunks = (chunks) => {
    const updater = (store) => {
      const data = store.getRootField('editConfiguration').getLinkedRecord('bucket');
      store.getRoot().copyFieldsFrom(data);
      store.get(this.props.bucket.id).setValue(data.getValue('available'), 'available');
      store.get(this.props.bucket.id).setLinkedRecord(data.getLinkedRecord('stocks'), 'stocks');
    };
    changeBucketComposition(
      updater, null, (r, e) => this.context.errorDisplay({
        message: e ? e[0].message : 'Composition successfully changed',
      }),
    )(
      this.props.relay.environment,
    )(
      {
        config: chunks.map(c => ({ idValue: c.id, quantity: c.quantity })),
        id: this.props.bucket.id,
      },
    );
  }
  deleteBucket = () => {
    const updater = (store) => {
      store.delete(this.props.bucket.id);
    };
    deleteBucket(
      updater, updater, (r, error) => {
        if (error) {
          this.context.errorDisplay({
            message: error[0].message,
          });
        }
      },
    )(
      this.props.relay.environment,
    )(
      { id: this.props.bucket.id },
    );
  }
  render() {
    let data;
    if (!this.props.bucket.description) {
      data = [];
    } else {
      data = this.props.bucket.description.edges;
    }
    const attributes = data.reduce((all, item) => {
      if (!item || !item.node) {
        return all;
      }
      const textAttr = {};
      const iconAttr = {};
      let extra = {};
      if (!item || !item.node || !item.node.id) {
        return all;
      }
      const id = item.node.id;
      if (this.props.bucket.isOwner) {
        if (id === this.state.editMode) {
          textAttr.onKeyPress = (e) => {
            if (e.charCode === 13) {
              this.setState(() => ({
                editMode: null,
              }), () => {
                editDescription(
                  null, null, (r, error) => {
                    if (error) {
                      this.context.errorDisplay({
                        message: error[0].message,
                      });
                    }
                  },
                )(
                  this.props.relay.environment,
                )(
                  { text: this.state.editState.shortDesc, id },
                );
              });
            }
          };
          textAttr.onChange = (e: SyntheticInputEvent<>) => {
            const text = e.target.value;
            this.setState(() => ({
              editState: {
                shortDesc: text,
              },
            }));
          };
          textAttr.autoFocus = true;
          iconAttr.onClick = () => {
            this.setState(() => ({
              editMode: null,
            }), () => {
              const updater = (store) => {
                store.delete(id);
              };
              deleteDescription(
                updater, updater, (r, error) => {
                  if (error) {
                    this.context.errorDisplay({
                      message: error[0].message,
                    });
                  }
                },
              )(
                this.props.relay.environment,
              )(
                { id },
              );
            });
          };
          extra = this.state.editState;
        } else {
          const edit = this.launchEdit(id);
          textAttr.onClick = edit;
          iconAttr.onClick = edit;
        }
      }
      all[item.node.isGood ? 'good' : 'bad'].push({
        ...item.node,
        text: textAttr,
        icon: iconAttr,
        editMode: (id === this.state.editMode),
        shortDesc: item.node.text,
        ...extra,
      });
      return all;
    }, {
      good: [],
      bad: [],
    });
    let editFunc = null;
    if (this.props.bucket.isOwner) {
      const updater = (store) => {
        const connection = ConnectionHandler.getConnection(
          store.get(this.props.bucket.id),
          'InvestBucketRelay_description',
        );
        const newEdge = ConnectionHandler.createEdge(
          store,
          connection,
          store.getRootField('addAttributeToBucket').getLinkedRecord('bucketAttr'),
          'GInvestmentBucketAttributeConnection',
        );
        ConnectionHandler.insertEdgeAfter(connection, newEdge);
      };
      editFunc = (text, isGood) => addDescription(
        updater, updater, (r, error) => {
          if (error) {
            this.context.errorDisplay({
              message: error[0].message,
            });
          }
        },
      )(
        this.props.relay.environment,
      )(
        { text, bucketId: this.props.bucket.id, isGood },
      );
    }
    let seeMoreFunc = null;
    if (this.props.bucket.description && this.props.bucket.description.pageInfo.hasNextPage) {
      seeMoreFunc = () => {
        this.setState(
          state => ({ itemCount: state.itemCount + 2 }),
          () => this.props.relay.refetch(() => ({
            id: this.props.bucket.id,
            first: this.state.itemCount,
          })))
        ;
      };
    }
    let title = this.props.bucket.name;
    if (!this.props.bucket.public) {
      title = <div>{title}<LockIcon /></div>;
    }
    return (
      <div>
        {
          this.state.compositionDialog ?
            <InvestCompositionRelay
              close={() => this.setState(() => ({ compositionDialog: false }))}
              bucket={this.props.bucket}
              save={this.saveChunks}
              profile={this.props.profile}
            /> :
            null
        }
        {
          this.state.investDialog ?
            <InvestPanelRelay
              bucket={this.props.bucket}
              profile={this.props.profile}
              closeFunc={() => this.setState(() => ({ investDialog: false }))}
            /> : null
        }
        <Dialog
          open={this.state.deleteConfirm}
          onRequestClose={(() => this.setState(() => ({ deleteConfirm: false })))}
        >
          <DialogTitle>{'Are you sure?'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the bucket forever?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={(() => this.setState(() => ({ deleteConfirm: false })))} color="primary">
              Keep it
            </Button>
            <Button onClick={this.deleteBucket} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <InvestBucket
          title={title}
          attributes={attributes}
          editFunc={editFunc}
          seeMoreFunc={seeMoreFunc}
          editCompositionFunc={
            this.props.bucket.isOwner ?
              (() => this.setState(() => ({ compositionDialog: true }))) :
              null
          }
          deleteFunc={
            this.props.bucket.isOwner ?
              (() => this.setState(() => ({ deleteConfirm: true }))) :
              null
          }
          investFunc={() => this.setState(() => ({ investDialog: true }))}
        />
      </div>
    );
  }
}

export default createRefetchContainer(InvestBucketRelay, {
  bucket: graphql`
    fragment InvestBucketRelay_bucket on GInvestmentBucket
    @argumentDefinitions(
      first: {type: "Int!", defaultValue: 2}
    ) {
      id
      name
      public
      isOwner
      description(first: $first) @connection(key: "InvestBucketRelay_description") {
        edges {
          node {
            id
            text
            isGood
          }
        }
        pageInfo {
          hasNextPage
        }
      }
      ...InvestCompositionRelay_bucket
      ...InvestPanelRelay_bucket
    }
  `,
  profile: graphql`
    fragment InvestBucketRelay_profile on GProfile {
      ...InvestCompositionRelay_profile
      ...InvestPanelRelay_profile
    }
  `,
}, graphql`
    query InvestBucketRelayQuery($id: ID!, $first: Int!) {
      investBucket(id: $id) {
        ...InvestBucketRelay_bucket @arguments(first: $first)
      }
    }
  `,
);

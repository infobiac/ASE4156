// @flow
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import VisibilitySensor from 'react-visibility-sensor';

import type { RelayContext } from 'react-relay';

import InvestBucketRelay from './InvestBucketRelay';
import EditBucket from '../EditBucket/EditBucket';
import createBucket from '../../mutations/BucketEdit/CreateBucket';

import type { InvestBucketGridRelay_profile } from './__generated__/InvestBucketGridRelay_profile.graphql';

type Props = {
  profile: InvestBucketGridRelay_profile,
  relay: RelayContext,
}
type State = {
  showDialog: bool,
  errors: ?Array<Error>,
  count: number,
}

const spacing = { xs: 12, sm: 6, md: 4 };

class InvestBucketGridRelay extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      showDialog: false,
      errors: [],
      count: 3,
    };
  }
  dialogAction = diagState => () => {
    this.setState(() => ({
      showDialog: diagState,
    }));
  }
  dialogSave = (name: string, publicBucket: bool, investment: number) => {
    let updater = null;
    updater = (store) => {
      const connection = ConnectionHandler.getConnection(
        store.get(this.props.profile.id),
        'InvestBucketGridRelay_investSuggestions',
      );
      const newEdge = ConnectionHandler.createEdge(
        store,
        connection,
        store.getRootField('addBucket').getLinkedRecord('bucket'),
        'GInvestmentBucketConnection',
      );
      ConnectionHandler.insertEdgeAfter(connection, newEdge);
    };
    createBucket(
      updater,
      updater,
      (response: ?Object, errors: ?[Error]) => {
        if (errors) {
          const e = errors[0];
          this.setState(() => ({ errors: [e] }));
        } else {
          this.dialogAction(false)();
        }
      },
    )(
      this.props.relay.environment,
    )(
      { name, public: publicBucket, investment },
    );
  }
  loadMore = () => {
    this.setState(() => ({ count: this.state.count + 3 }), () => {
      this.props.relay.refetch(() => ({ count: this.state.count }));
    });
  }
  render() {
    if (!this.props.profile.investSuggestions) {
      return null;
    }
    const emptyFillers = [];
    if (this.props.profile.investSuggestions.pageInfo.hasNextPage) {
      for (
        let i = this.props.profile.investSuggestions.edges.length;
        i < this.state.count;
        i += 1) {
        emptyFillers.push((
          <Grid item {...spacing} key={i}>
            <Card>
              <CardHeader title="Loading more buckets" />
              <CardContent>Sit tight!</CardContent>
            </Card>
          </Grid>
        ));
      }
    }
    const createMoreBucket = (
      <Card>
        <CardHeader title="Create new bucket" />
        <CardContent>Here you can add a new bucket!</CardContent>
        <CardActions>
          <Button dense color="primary" aria-label="add" onClick={this.dialogAction(true)}>
              New
          </Button>
        </CardActions>
      </Card>);
    return (
      <Grid container spacing={16} align="stretch">
        <Grid item {...spacing}>
          {createMoreBucket}
        </Grid>
        {
          this.props.profile.investSuggestions ?
            this.props.profile.investSuggestions.edges.map(b => (b && b.node ? (
              <Grid item {...spacing} key={b.node.id}>
                <InvestBucketRelay profile={this.props.profile} bucket={b.node} />
              </Grid>
            ) : null)) : null
        }
        {emptyFillers}
        <Grid item {...spacing}>
          {
            this.props.profile.investSuggestions
            && this.props.profile.investSuggestions.pageInfo.hasNextPage ?
              <VisibilitySensor onChange={v => v && this.loadMore()} />
              : createMoreBucket
          }
        </Grid>
        {
          this.state.showDialog ?
            <EditBucket
              save={this.dialogSave}
              cancel={this.dialogAction(false)}
              errors={this.state.errors}
            /> :
            null
        }
      </Grid>
    );
  }
}

export default createRefetchContainer(InvestBucketGridRelay, {
  profile: graphql`
    fragment InvestBucketGridRelay_profile on GProfile
    @argumentDefinitions(
      count: {type: "Int!", defaultValue: 3}
    ) {
      id
      investSuggestions(first: $count) @connection(key: "InvestBucketGridRelay_investSuggestions") {
        edges {
          node {
            id
            ...InvestBucketRelay_bucket
          }
        }
        pageInfo {
          hasNextPage
        }
      }
      ...InvestBucketRelay_profile
    }
  `,
}, graphql`
  query InvestBucketGridRelayQuery($count: Int!) {
    viewer {
      profile {
        ...InvestBucketGridRelay_profile @arguments(count: $count)
      }
    }
  }
`);

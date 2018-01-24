// @flow

import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

import type { Node } from 'react';

import PersonalStatusRelay from '../components/PersonalStatus/PersonalStatusRelay';
import BankAccountRelay from '../components/StockGraph/BankAccountRelay';
import InvestBucketGridRelay from '../components/InvestBucket/InvestBucketGridRelay';
import SnackbarErrorContext from '../components/ErrorReporting/SnackbarErrorContext';

import type { Home_viewer }
  from './__generated__/Home_viewer.graphql';

type Props = {
  children: ?Node,
  viewer: Home_viewer,
}

class Home extends React.Component < Props > {
  render() {
    if (!this.props.viewer.userbank || this.props.viewer.userbank.edges.length === 0) {
      return null;
    }
    return (
      <div style={{ margin: 10 }}>
        <SnackbarErrorContext>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              {
                this.props.viewer.userbank.edges[0]
                && this.props.viewer.userbank.edges[0].node
                && this.props.viewer.profile
                ? (
                  <PersonalStatusRelay
                    bank={this.props.viewer.userbank.edges[0].node}
                    account={this.props.viewer.profile.selectedAcc}
                  />
                )
                : null}
            </Grid>
            <Grid item xs={12}>
              <Paper>
                {this.props.viewer.userbank.edges[0] && this.props.viewer.userbank.edges[0].node
                  ? <BankAccountRelay bank={this.props.viewer.userbank.edges[0].node} />
                  : null}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <InvestBucketGridRelay profile={this.props.viewer.profile} />
            </Grid>
          </Grid>
          {
            this.props.children
              ? this.props.children
              : null
          }
        </SnackbarErrorContext>
      </div>
    );
  }
}

export default createFragmentContainer(Home, {
  viewer: graphql`
    fragment Home_viewer on GUser {
      profile {
        ...InvestBucketGridRelay_profile
        selectedAcc {
          ...PersonalStatusRelay_account
        }
      }
      userbank {
        edges {
          node {
            ...BankAccountRelay_bank
            ...PersonalStatusRelay_bank
          }
        }
      }
    }
`,
});

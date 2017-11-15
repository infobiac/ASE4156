// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import PropTypes from 'prop-types';
import { routerShape } from 'found';

import type { RelayContext } from 'react-relay';

import InvestMutation from '../../mutations/BucketEdit/InvestMutation';
import InvestPanel from './InvestPanel';

import type { InvestPanelRelay_profile } from './__generated__/InvestPanelRelay_profile.graphql';
import type { InvestPanelRelay_bucket } from './__generated__/InvestPanelRelay_bucket.graphql';

type Props = {
  relay: RelayContext,
  profile: InvestPanelRelay_profile,
  bucket: InvestPanelRelay_bucket,
}
type State = {}

class InvestPanelRelay extends React.Component<Props, State> {
  static contextTypes = {
    errorDisplay: PropTypes.func.isRequired,
    router: routerShape.isRequired,
  };
  close = () => {
    this.context.router.replace('/home');
  }
  investFunc = (quantity) => {
    const optimisticResponse = {
      invest: {
        tradingAccount: {
          id: this.props.profile.selectedAcc.id,
          availableCash: (
            this.props.profile.selectedAcc.availableCash
            - (quantity * this.props.bucket.value)
          ),
        },
        bucket: {
          id: this.props.bucket.id,
          ownedAmount: this.props.bucket.ownedAmount + quantity,
        },
      },
    };
    InvestMutation(null, null, (r, error) => {
      if (error) {
        this.context.errorDisplay({
          message: error[0].message,
        });
      } else {
        this.context.errorDisplay({
          message: `Successfully ${quantity > 0 ? 'bought' : 'sold'} the bucket!`,
        });
        this.close();
      }
    })(this.props.relay.environment)({
      quantity,
      tradingAccId: this.props.profile.selectedAcc.id,
      bucketId: this.props.bucket.id,
    }, optimisticResponse);
  }
  render() {
    const bucket = {
      name: this.props.bucket.name,
      value: this.props.bucket.value,
      ownedAmount: this.props.bucket.ownedAmount,
      history: this.props.bucket.history.map((dp) => {
        const newStuff = { value: dp.value, date: new Date(dp.date) };
        return newStuff;
      }),
    };
    return (<InvestPanel
      bucket={bucket}
      available={this.props.profile.selectedAcc.availableCash}
      cancelFunc={this.close}
      investFunc={this.investFunc}
    />);
  }
}

export default createFragmentContainer(InvestPanelRelay, {
  bucket: graphql`
    fragment InvestPanelRelay_bucket on GInvestmentBucket {
      id
      name
      value
      ownedAmount
      history(count: 30) {
        date
        value
      }
    }
  `,
  profile: graphql`
    fragment InvestPanelRelay_profile on GProfile {
      selectedAcc {
        availableCash
        id
      }
    }
  `,
});

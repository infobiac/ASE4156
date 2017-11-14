// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';

import type { RelayContext } from 'react-relay';

import InvestMutation from '../../mutations/BucketEdit/InvestMutation';
import InvestPanel from './InvestPanel';

import type { InvestPanelRelay_profile } from './__generated__/InvestBucketRelay_profile.graphql';
import type { InvestPanelRelay_bucket } from './__generated__/InvestBucketRelay_bucket.graphql';

type Props = {
  closeFunc: () => void,
  relay: RelayContext,
  profile: InvestPanelRelay_profile,
  bucket: InvestPanelRelay_bucket,
}
type State = {}

class InvestPanelRelay extends React.Component<Props, State> {
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
      }
    })(this.props.relay.environment)({
      quantity,
      tradingAccId: this.props.profile.selectedAcc.id,
      bucketId: this.props.bucket.id,
    }, optimisticResponse);
  }
  render() {
    const bucket = {
      ...this.props.bucket,
      history: this.props.bucket.history.map(dp => ({ ...dp, date: new Date(dp.date) })),
    };
    return (<InvestPanel
      bucket={bucket}
      available={this.props.profile.selectedAcc.availableCash}
      cancelFunc={this.props.closeFunc}
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
      history {
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

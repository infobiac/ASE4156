// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import HighlightBox from '../HighlightBox';

import type { PersonalStatusRelay_bank }
  from './__generated__/PersonalStatusRelay_bank.graphql';
import type { PersonalStatusRelay_account } from './__generated__/PersonalStatusRelay_account.graphql';

type Props = {
  bank: PersonalStatusRelay_bank,
  account: PersonalStatusRelay_account
}

const spacing = { xs: 12, sm: 6, md: 3 };

export default class PersonalStatus extends React.Component < Props > {
  static propTypes = {
    bank: PropTypes.shape({
      balance: PropTypes.number.isRequired,
      income: PropTypes.number.isRequired,
      outcome: PropTypes.number.isRequired,
    }).isRequired,
  }
  render() {
    return (
      <Grid container spacing={16} align="stretch" id="personal-status">
        <Grid item {...spacing}>
          <HighlightBox
            title="Current balance"
            value={this.props.bank.balance.toFixed(2)}
            secondaryInfo={[{
              text: this.props.account.accountName,
              value: this.props.account.totalValue.toFixed(2),
            }]}
          />
        </Grid>
        <Grid item {...spacing}>
          <HighlightBox title="Total Income" value={this.props.bank.income.toFixed(2)} />
        </Grid>
        <Grid item {...spacing}>
          <HighlightBox title="Total Expenditures" value={this.props.bank.outcome.toFixed(2)} />
        </Grid>
        <Grid item {...spacing}>
          <HighlightBox
            title="Available money"
            value={(this.props.bank.income + this.props.bank.outcome).toFixed(2)}
            secondaryInfo={[{
              text: this.props.account.accountName,
              value: this.props.account.availableCash.toFixed(2),
            }]}
          />
        </Grid>
      </Grid>
    );
  }
}

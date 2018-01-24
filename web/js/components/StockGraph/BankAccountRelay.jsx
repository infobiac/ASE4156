// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StockGraph from './StockGraph';

import type { BankAccountRelay_bank } from './__generated__/BankAccountRelay_bank.graphql';

type Props = {
  bank: BankAccountRelay_bank,
}

class BankAccountRelay extends React.Component<Props> {
  render() {
    const quotes: any = [{
      name: this.props.bank.name,
      data: this.props.bank.history.map(dp => ({
        ...dp,
        date: new Date(dp.date),
      })),
    }];
    return <StockGraph id="BAR" compare="ABSOLUTE" title="Your account history" quotes={quotes} />;
  }
}

export default createFragmentContainer(BankAccountRelay, {
  bank: graphql`
    fragment BankAccountRelay_bank on GUserBank {
      name
      history(start: "2017-09-10") {
        date
        value
      }
    }
  `,
});

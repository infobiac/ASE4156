// @flow
import { createFragmentContainer, graphql } from 'react-relay';
import PersonalStatus from './PersonalStatus';

export default createFragmentContainer(PersonalStatus, {
  bank: graphql`
    fragment PersonalStatusRelay_bank on GUserBank {
      balance
      balanceDate
      income
      outcome
      monthlyStart
      monthlyEnd
    }
`,
  account: graphql`
    fragment PersonalStatusRelay_account on GTradingAccount {
      totalValue
      accountName
      availableCash
    }
  `,
});

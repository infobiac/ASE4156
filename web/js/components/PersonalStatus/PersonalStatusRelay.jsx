// @flow
import { createFragmentContainer, graphql } from 'react-relay';
import PersonalStatus from './PersonalStatus';

export default createFragmentContainer(PersonalStatus, {
  bank: graphql`
    fragment PersonalStatusRelay_bank on GUserBank {
      balance
      income
      outcome
    }
`,
});

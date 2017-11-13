// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';

import type { Node } from 'react';

type Props = {
  children: Node,
}
type State = {
  errorMessages: {[key: string]: any},
  nextErrorId: number,
}

export default class SnackbarErrorContext extends React.Component<Props, State> {
  static childContextTypes = {
    errorDisplay: PropTypes.func.isRequired,
  }
  constructor() {
    super();
    this.state = {
      errorMessages: {},
      nextErrorId: 0, // eslint-disable-line react/no-unused-state
    };
  }
  getChildContext() {
    return {
      errorDisplay: this.errorDisplay,
    };
  }
  errorDisplay = (errorProps: any) => {
    this.setState(state => ({
      errorMessages: {
        [state.nextErrorId]: errorProps,
        ...state.errorMessages,
      },
      nextErrorId: state.nextErrorId + 1,
    }));
  }
  closeDisplay = (id: string) => () => {
    this.setState((state) => {
      const { errorMessages } = state;
      delete errorMessages[id];
      return {
        errorMessages,
      };
    });
  }
  render() {
    return (
      <div>
        {
          Object.keys(this.state.errorMessages).map(e => (
            <Snackbar
              open
              key={e}
              action={<Button color="accent" dense onClick={this.closeDisplay(e)}>Close</Button>}
              autoHideDuration={4000}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              onRequestClose={this.closeDisplay(e)}
              {...this.state.errorMessages[e]}
            />
          ))
      }
        {this.props.children}
      </div>
    );
  }
}

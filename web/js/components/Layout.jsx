import React from 'react';
import { MuiThemeProvider } from 'material-ui/styles';
import PropTypes from 'prop-types';

import AppBar from './AppBar';
import theme from '../theme/muiTheme';

type Props = {
  children: PropTypes.Node.isRequired,
}

function layout(props: Props) {
  return (
    <MuiThemeProvider theme={theme}>
      <div>
        <div>
          <AppBar />
        </div>
        <div style={{ paddingTop: '60.5px' }}>
          {props.children}
        </div>
      </div>
    </MuiThemeProvider>
  );
}

export default layout;

// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { MuiThemeProvider } from 'material-ui/styles';
import environment from './relay/environment';
import StockSearchView from './StockSearchView';
import Home from './pages/Home';
import Loading from './components/Loading';
import theme from './theme/muiTheme';


export default class App extends React.Component <*> {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql` query appQuery { viewer { username ...StockSearchView_user ...Home_viewer } } `}
        render={({ error, props }) => {
          if (error) {
            return <div>{error.message}</div>;
          } else if (props) {
            if (props.viewer != null) {
              return (
                <div>
                  <Home viewer={props.viewer} />
                  <StockSearchView user={props.viewer} />
                  <a href="/logout">Logout</a>
                </div>
              );
            }
            window.location.href = '/auth';
            return <h1>Plz log in</h1>;
          }
          return <MuiThemeProvider theme={theme}><Loading /></MuiThemeProvider>;
        }}
      />
    );
  }
}

import makeRouteConfig from 'found/lib/makeRouteConfig';
import Route from 'found/lib/Route';
import React from 'react';
import { graphql } from 'react-relay';

import Home from '../pages/Home';
import Layout from '../components/Layout';

export default makeRouteConfig((
  <Route path="/" Component={Layout}>
    <Route
      path="/home"
      Component={Home}
      query={graphql`
        query routesQuery {
          viewer {
            ...Home_viewer
          }
        }
      `}
    />
  </Route>
));

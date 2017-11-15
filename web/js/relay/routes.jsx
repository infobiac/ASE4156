import makeRouteConfig from 'found/lib/makeRouteConfig';
import Route from 'found/lib/Route';
import React from 'react';
import { graphql } from 'react-relay';

import Home from '../pages/Home';
import Layout from '../components/Layout';
import InvestCompositionRelay from '../components/InvestBucket/InvestCompositionRelay';
import InvestPanelRelay from '../components/InvestBucket/InvestPanelRelay';

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
    >
      <Route
        path="/composition/:bucketId"
        Component={InvestCompositionRelay}
        render={({ Component, props }) => {
          if (!props) {
            return null;
          }
          return (
            <Component profile={props.viewer.profile} bucket={props.investBucket} />
          );
        }}
        query={graphql`
          query routesCompositionQuery($bucketId: ID!) {
            viewer {
              profile {
                ...InvestCompositionRelay_profile
              }
            }
            investBucket(idValue: $bucketId) {
              ...InvestCompositionRelay_bucket
            }
          }
        `}
      />
      <Route
        path="/invest/:bucketId"
        Component={InvestPanelRelay}
        render={({ Component, props }) => {
          if (!props) {
              return null;
          }
          return (
            <Component profile={props.viewer.profile} bucket={props.investBucket} />
          );
        }}
        query={graphql`
            query routesInvestQuery($bucketId: ID!) {
              viewer {
                profile {
                  ...InvestPanelRelay_profile
                }
              }
              investBucket(idValue: $bucketId) {
                ...InvestPanelRelay_bucket
              }
            }
          `}
      />
    </Route>
  </Route>
));

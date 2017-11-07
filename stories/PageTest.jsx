// @flow
import React from 'react';
import Grid from 'material-ui/Grid';
import { MuiThemeProvider } from 'material-ui/styles';
import Paper from 'material-ui/Paper';

import HighlightBox from '../web/js/components/HighlightBox/HighlightBox';
import StockGraph from '../web/js/components/StockGraph/StockGraph';
import InvestBucket from '../web/js/components/InvestBucket/InvestBucket';
import AppBar from '../web/js/components/AppBar';
import theme from '../web/js/theme/muiTheme';
import '../web/css/styles.css';

class PageTest extends React.Component<{}> {
  render() {
    const values = [
      {
        name: 'Your current net worth',
        data: [
          {
            date: new Date(2007, 1),
            value: 1000,
          }, {
            date: new Date(2008, 1),
            value: 1500,
          }, {
            date: new Date(2009, 1),
            value: 1600,
          }, {
            date: new Date(2011, 1),
            value: 1300,
          },
        ],
      }, {
        name: 'If you would have invested',
        data: [
          {
            date: new Date(2007, 1),
            value: 1000,
          }, {
            date: new Date(2008, 1),
            value: 1200,
          }, {
            date: new Date(2009, 1),
            value: 1800,
          }, {
            date: new Date(2010, 1),
            value: 2000,
          }, {
            date: new Date(2011, 1),
            value: 2100,
          },
        ],
      },
    ];
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <div>
            <AppBar />
          </div>
          <div style={{ margin: 10, paddingTop: '70.5px' }}>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                <Grid container spacing={16} align="stretch">
                  <Grid item xs={12} sm={6} md={3}>
                    <HighlightBox title={'Current balance'} value={'$1300'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <HighlightBox title={'Total Income'} value={'$300'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <HighlightBox title={'Total Expenditures'} value={'$250'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <HighlightBox title={'Another box'} value={'$1000'} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Paper>
                  <StockGraph
                    title="Portfolio Growth"
                    height="450px"
                    id={'chart'}
                    compare={'ABSOLUTE'}
                    quotes={values}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={16} align="stretch">
                  <Grid item xs={12} sm={6} md={4}>
                    <InvestBucket
                      title={'Risk 1'}
                      attributes={{
                        good: [{
                          id: '1',
                          shortDesc: 'Good to get started',
                          editMode: false,
                        }, {
                          id: '2',
                          shortDesc: 'Low risk',
                          editMode: false,
                        }],
                        bad: [{
                          id: '3',
                          shortDesc: 'Low reward',
                          editMode: false,
                        }],
                      }}
                      investFunc={() => {}}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InvestBucket
                      title={'Risk 2'}
                      attributes={{
                        good: [{
                          id: '1',
                          shortDesc: 'Allows you to take more risk',
                          editMode: false,
                        }, {
                          id: '2',
                          shortDesc: 'Pays significant rewards',
                          editMode: false,
                        }],
                        bad: [{
                          id: '3',
                          shortDesc: 'You might lose some money',
                          editMode: false,
                        }],
                      }}
                      investFunc={() => {}}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InvestBucket
                      title={'Risk 3'}
                      attributes={{
                        good: [{
                          id: '1',
                          shortDesc: '$$$',
                          editMode: false,
                        }, {
                          id: '2',
                          shortDesc: 'More $$$',
                          editMode: false,
                        }],
                        bad: [{
                          id: '3',
                          shortDesc: 'You\'re fucking insane of you invest in this',
                          editMode: false,
                        }],
                      }}
                      investFunc={() => {}}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
export default PageTest;

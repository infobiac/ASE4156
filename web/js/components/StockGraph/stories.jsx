// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';
import StockGraph from './StockGraph';

storiesOf('StockGraph', module).add('Playground', () => {
  const values = [
    {
      name: 'Chart 1',
      data: [
        {
          date: new Date(2007, 1),
          value: 1,
        }, {
          date: new Date(2008, 1),
          value: 2,
        }, {
          date: new Date(2009, 1),
          value: 4,
        }, {
          date: new Date(2011, 1),
          value: 6,
        },
      ],
    }, {
      name: 'Chart 2',
      data: [
        {
          date: new Date(2007, 1),
          value: 5,
        }, {
          date: new Date(2008, 1),
          value: 2,
        }, {
          date: new Date(2009, 1),
          value: 1,
        }, {
          date: new Date(2010, 1),
          value: 7,
        },
      ],
    },
  ];
  return (<StockGraph
    id="chart"
    compare={select('Compare type', [
      'PERCENT', 'ABSOLUTE',
    ], 'ABSOLUTE')}
    title="Test Chart"
    quotes={values}
  />);
});

storiesOf('Simple Percent', module).add('Playground', () => {
  const values = [
    {
      name: 'Chart 1',
      data: [
        {
          date: new Date(2007, 1),
          value: 1,
        }, {
          date: new Date(2008, 1),
          value: 2,
        }, {
          date: new Date(2009, 1),
          value: 4,
        }, {
          date: new Date(2011, 1),
          value: 6,
        },
      ],
    },
  ];
  return (<StockGraph
    id="chart"
    compare={select('Compare type', [
      'PERCENT', 'ABSOLUTE',
    ], 'PERCENT')}
    title="Test Chart"
    quotes={values}
  />);
});

storiesOf('Empty Data', module).add('Playground', () => {
  const values = [];
  return (<StockGraph
    id="chart"
    compare={select('Compare type', [
      'PERCENT', 'ABSOLUTE',
    ], 'ABSOLUTE')}
    title="Test Chart"
    quotes={values}
  />);
});

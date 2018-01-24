// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { number, text } from '@storybook/addon-knobs';
import Saldo from './Saldo';

storiesOf('Saldo', module).add('Playground', () => {
  const values = [
    {
      name: 'investedSharesValue',
      value: number('Invested Shares Value', 700.00),
    }, {
      name: 'earnedSharesValue',
      value: number('Earned Shares Value', 74.93),
    }, {
      name: 'bonusSharesValue',
      value: number('Bonus Shares Value', 0.0),
    }, {
      name: 'reinvestedSharesValue',
      value: number('Reinvested Shares Value', 0.0),
    },
  ];
  return (<Saldo values={values} currency={text('Currency sign', '$')} />);
});

storiesOf('Saldo', module).add('Without total', () => {
  const values = [
    {
      name: 'investedSharesValue',
      value: number('Invested Shares Value', 700.00),
    }, {
      name: 'earnedSharesValue',
      value: number('Earned Shares Value', 74.93),
    }, {
      name: 'bonusSharesValue',
      value: number('Bonus Shares Value', 0.0),
    }, {
      name: 'reinvestedSharesValue',
      value: number('Reinvested Shares Value', 0.0),
    },
  ];
  return (<Saldo values={values} showTotal={false} currency={text('Currency sign', '$')} />);
});

// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { number, text } from '@storybook/addon-knobs';
import HighlightBox from './HighlightBox';

storiesOf('HighlightBox', module).add('Playground', () => (
  <HighlightBox
    title={text('Title', 'Account Total')}
    value={`$${number('Value', 1234.56)}`}
    secondaryInfo={[
      {
        value: '$7,000.00',
        text: 'Invested Total',
      },
    ]}
  />
));

storiesOf('HighlightBox', module).add('Simple', () => (<HighlightBox
  title="Stuff"
  value="More stuff"
/>));

storiesOf('HighlightBox', module).add('Account Total', () => (<HighlightBox
  title="Account Total"
  value="$7,749.34"
  secondaryInfo={[
    {
      value: '$7,000.00',
      text: 'Invested Total',
    },
  ]}
/>));

storiesOf('HighlightBox', module).add('Annulized Percentage Return', () => (<HighlightBox
  title="Annulized Percentage Return"
  value="3.75%"
  secondaryInfo={[
    {
      value: '$774.90',
      text: 'Total Shares Owneed',
    },
  ]}
/>));

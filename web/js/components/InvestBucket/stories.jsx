// @flow
import React from 'react';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import InvestBucket from './InvestBucket';
import InvestComposition from './InvestComposition';
import InvestPanel from './InvestPanel';

storiesOf('InvestBucket', module).add('Playground', () => {
  const title = text('Title of the risk section', 'Risk 1');
  const riskList = {
    good: [
      {
        id: '1',
        shortDesc: 'Good to get started',
        editMode: false,
        text: {
          onClick: action('click1'),
        },
        icon: {
          onClick: action('click3'),
        },
      }, {
        id: '2',
        shortDesc: 'Low risk',
        editMode: true,
        text: {
          onClick: action('click2'),
        },
        icon: {
          onClick: action('click3'),
        },
      },
    ],
    bad: [
      {
        id: '3',
        shortDesc: 'Low reward',
        editMode: false,
        text: {
          onClick: action('click3'),
        },
        icon: {
          onClick: action('click3'),
        },
      },
    ],
  };
  return (<InvestBucket
    title={title}
    attributes={riskList}
    editFunc={action('edit')}
    investFunc={() => {}}
  />);
});

storiesOf('InvestCompositionDontTest', module).add('Playground', () => {
  const chunks = [{
    name: 'Google',
    value: 150,
    quantity: 0.5,
    id: '1',
  }, {
    name: 'IBM',
    value: 100,
    quantity: 0.75,
    id: '2',
  }, {
    name: 'Palantir',
    value: 50,
    quantity: 2,
    id: '3',
  }, {
    name: 'Facebook',
    value: 100,
    quantity: 1,
    id: '4',
  }];
  const suggestions = [{
    name: 'GOOGL',
    value: 60,
    id: '5',
  }];
  return (
    <InvestComposition
      suggestions={suggestions}
      suggestionFieldChange={action('suggestionFieldChange')}
      total={400}
      chunks={chunks}
      chunkUpdate={action('chunkUpdate')}
      saveFunc={action('save')}
      cancelFunc={action('cancel')}
    />
  );
});
storiesOf('InvestPanelDontTest', module).add('Playground', () => (
  <InvestPanel
    bucket={{ name: 'Some bucket', value: 311.45 }}
    available={555.55}
    investFunc={action('invest')}
    cancelFunc={action('cancel')}
  />
));

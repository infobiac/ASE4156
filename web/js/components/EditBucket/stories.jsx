// @flow
import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import EditBucket from './EditBucket';

storiesOf('EditBucketDontTest', module).add('Playground', () => (
  <EditBucket save={action('save')} cancel={action('cancel')} />
));

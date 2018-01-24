import React from 'react';

import { storiesOf } from '@storybook/react';

import AppBar from '../web/js/components/AppBar';
import { CardWF, MediaCardWF } from '../web/js/components/Cards';
import PageTest from './PageTest';
import Loading from '../web/js/components/Loading';

storiesOf('AppBar', module).add('Main app bar', () => <AppBar />);

storiesOf('Cards', module).add('Simple card', () => <CardWF title="Title" subtitle="sub" cardText="fdsa" />).add('Content card', () => <MediaCardWF content={<h1 > Content </h1>} />);

storiesOf('Page', module).add('Test page', () => {
  const res = <PageTest />;
  return res;
});

storiesOf('Loading', module).add('Linear', () => <Loading />);

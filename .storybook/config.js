import {configure} from '@storybook/react';
import {addDecorator} from '@storybook/react';
import {withKnobs, number, text,} from '@storybook/addon-knobs';
import React from 'react';
import i18nEn from '../web/i18n/en';
import {I18nextProvider} from 'react-i18next';

const i18nDecorator = children => <I18nextProvider i18n={i18nEn}>{children()}</I18nextProvider>;

addDecorator(withKnobs)
addDecorator(i18nDecorator)

function loadStories() {
  require('../stories');
  require('../web/js/components/stories.jsx');
}

configure(loadStories, module);

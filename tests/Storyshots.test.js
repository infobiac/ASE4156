/* eslint-disable */
import initStoryshots from '@storybook/addon-storyshots';

console.log = jest.fn();
console.info = jest.fn();

initStoryshots({
  storyKindRegex:/^((?!.*?DontTest).)*$/
});
/* eslint-enable */

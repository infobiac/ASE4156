import React from 'react';
import { shallow } from 'enzyme';

import Layout from '../Layout';


describe('Layout', () => {
  it('exists', () => {
    expect(Layout).toBeTruthy();
  });

  it('renders', () => {
    const comp = <Layout><div>Layout Test</div></Layout>;
    const wrapper = shallow(comp);
    expect(wrapper).toMatchSnapshot();
  });
});

import React from 'react';
import { mount } from 'enzyme';

import AppBar from '../AppBar';

describe('AppBar', () => {
  it('exists', () => {
    expect(AppBar).toBeTruthy();
  });

  it('logout', () => {
    const assignCall = jest.fn();
    Object.defineProperty(window.location, 'assign', {
      value: assignCall,
    });
    const comp = <AppBar />;
    const wrapper = mount(comp);
    expect(wrapper).toMatchSnapshot();
    wrapper.find('#menu-appbar-button').first().simulate('click');
    expect(wrapper).toMatchSnapshot();
    expect(assignCall.mock.calls.length).toEqual(0);
    wrapper.find('#logout').first().simulate('click');
    expect(assignCall.mock.calls.length).toEqual(1);
    expect(assignCall.mock.calls[0][0]).toEqual('/logout');
  });

  it('close menu', () => {
    const comp = <AppBar />;
    const wrapper = mount(comp);
    expect(wrapper).toMatchSnapshot();
    wrapper.find('#menu-appbar-button').first().simulate('click');
    expect(wrapper).toMatchSnapshot();
    wrapper.find('#overview').first().simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});

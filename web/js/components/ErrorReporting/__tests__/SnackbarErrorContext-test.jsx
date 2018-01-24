import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';

import SnackbarErrorContext from '../SnackbarErrorContext';

class TestFixture extends React.Component {
  static contextTypes = {
    errorDisplay: PropTypes.func.isRequired,
  };
  render() {
    return (
      <div>
        <input
          id="test-click"
          onClick={() => this.context.errorDisplay({ id: 'sample', message: 'test' })}
        />
      </div>
    );
  }
}

describe('SnackbarErrorContext', () => {
  it('exists', () => {
    expect(SnackbarErrorContext).toBeTruthy();
  });

  it('renders', () => {
    const comp = <SnackbarErrorContext><TestFixture /></SnackbarErrorContext>;
    const wrapper = shallow(comp);
    expect(wrapper).toMatchSnapshot();
  });

  it('reports', () => {
    const comp = <SnackbarErrorContext><TestFixture /></SnackbarErrorContext>;
    const wrapper = mount(comp);
    expect(wrapper).toMatchSnapshot();
    wrapper.find('#test-click').simulate('click');
    expect(wrapper).toMatchSnapshot();
    wrapper.find('#close').first().simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});

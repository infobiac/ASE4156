import React from 'react';
import { shallow } from 'enzyme';
import EditBucket from '../EditBucket';

describe('EditBucket', () => {
  it('exists', () => {
    expect(EditBucket).toBeTruthy();
  });

  it('renders', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} />);
    expect(editBucket).toMatchSnapshot();
    expect(cancelFn.mock.calls.length).toBe(0);
    expect(saveFn.mock.calls.length).toBe(0);
  });

  it('cancels', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} />);
    editBucket.find('#cancel').simulate('click');
    expect(cancelFn.mock.calls.length).toBe(1);
    expect(editBucket).toMatchSnapshot();
  });

  it('enter name', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} />);
    editBucket.find('#name').simulate('change', { target: { value: 'bucketName' } });
    expect(editBucket.find('#name').props().value).toEqual('bucketName');
    expect(editBucket).toMatchSnapshot();
  });

  it('enter investment', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} />);
    editBucket.find('#investment').simulate('change', { target: { value: '200' } });
    expect(editBucket.find('#investment').props().value).toEqual('200.00');
    expect(editBucket).toMatchSnapshot();
  });

  it('change public', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} />);
    const cb = shallow(editBucket.find('#publicContainer').props().control);
    expect(cb).toMatchSnapshot();
    cb.simulate('change');
    expect(editBucket.state().public).toBe(true);
  });

  it('saves', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} />);
    editBucket.find('#name').simulate('change', { target: { value: 'bucketName' } });
    editBucket.find('#investment').simulate('change', { target: { value: '200' } });
    editBucket.find('#save').simulate('click');
    expect(saveFn.mock.calls.length).toBe(1);
    expect(saveFn.mock.calls[0]).toEqual(['bucketName', false, 200.0]);
  });

  it('displays error', () => {
    const cancelFn = jest.fn();
    const saveFn = jest.fn();
    const editBucket = shallow(<EditBucket cancel={cancelFn} save={saveFn} errors={[Error('messed up')]} />);
    expect(editBucket).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import InvestBucket from '../InvestBucket';

describe('InvestBucket', () => {
  it('exists', () => {
    expect(InvestBucket).toBeTruthy();
  });

  it('renders', () => {
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{ good: [], bad: [] }}
      investFunc={jest.fn()}
    />);
    expect(comp).toMatchSnapshot();
  });

  it('displays good attributes', () => {
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{ good: [{ id: 1, shortDesc: 'Attr' }], bad: [] }}
      investFunc={jest.fn()}
    />);
    expect(comp).toMatchSnapshot();
  });

  it('displays bad attributes', () => {
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{ good: [], bad: [{ id: 1, shortDesc: 'Attr' }] }}
      investFunc={jest.fn()}
    />);
    expect(comp).toMatchSnapshot();
  });

  it('edit attribute', () => {
    const editFunc = jest.fn();
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{
        good: [{
            id: 1,
            shortDesc: 'Attr',
            editMode: true,
          text: { onChange: editFunc, id: 'editTxt' },
        }],
          bad: [],
      }}
      investFunc={jest.fn()}
    />);
    const obj = { target: { value: '3' } };
    expect(editFunc.mock.calls.length).toEqual(0);
    comp.find('#editTxt').simulate('change', obj);
    expect(editFunc.mock.calls.length).toEqual(1);
    expect(editFunc.mock.calls[0][0]).toEqual(obj);
  });

  it('add attribute', () => {
    const editFunc = jest.fn();
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{
        good: [],
          bad: [],
      }}
      editFunc={editFunc}
      investFunc={jest.fn()}
    />);
    comp.find('#launch-edit').simulate('click');
    expect(comp).toMatchSnapshot();
    comp.find('#name').simulate('change', { target: { value: 'some text' } });
    expect(comp).toMatchSnapshot();
    comp.find('#good-or-bad').simulate('click');
    expect(comp).toMatchSnapshot();
    comp.find('#name').simulate('keyPress', { charCode: 10 });
    expect(editFunc.mock.calls.length).toEqual(0);
    comp.find('#name').simulate('keyPress', { charCode: 13 });
    expect(editFunc.mock.calls.length).toEqual(1);
    expect(editFunc.mock.calls[0][0]).toEqual('some text');
    expect(editFunc.mock.calls[0][1]).toEqual(false);
    expect(comp).toMatchSnapshot();
  });

  it('see more', () => {
    const seeMoreFunc = jest.fn();
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{
        good: [],
          bad: [],
      }}
      seeMoreFunc={seeMoreFunc}
      investFunc={jest.fn()}
    />);
    expect(seeMoreFunc.mock.calls.length).toEqual(0);
    comp.find('#more').simulate('click');
    expect(seeMoreFunc.mock.calls.length).toEqual(1);
  });

  it('delete', () => {
    const deleteFunc = jest.fn();
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{
        good: [],
          bad: [],
      }}
      deleteFunc={deleteFunc}
      investFunc={jest.fn()}
    />);
    expect(deleteFunc.mock.calls.length).toEqual(0);
    comp.find('#delete').simulate('click');
    expect(deleteFunc.mock.calls.length).toEqual(1);
  });

  it('edit composition', () => {
    const editCompositionFunc = jest.fn();
    const comp = shallow(<InvestBucket
      title="Random"
      attributes={{
        good: [],
          bad: [],
      }}
      editCompositionFunc={editCompositionFunc}
      investFunc={jest.fn()}
    />);
    expect(editCompositionFunc.mock.calls.length).toEqual(0);
    comp.find('#edit-comp').simulate('click');
    expect(editCompositionFunc.mock.calls.length).toEqual(1);
  });
});

/*
type ItemObj = {
  id: string,
  shortDesc: string,
  icon?: any,
  text?: any,
  editMode: bool,
}
type Props = {
  title: Node,
  attributes: {
    good: Array<ItemObj>,
    bad: Array<ItemObj>,
  },
  editFunc?: ?(text: string, isGood: bool) => void,
  seeMoreFunc?: ?() => void,
  editCompositionFunc?: ?() => void,
  deleteFunc?: ?() => void,
  investFunc: () => void,
}
 */

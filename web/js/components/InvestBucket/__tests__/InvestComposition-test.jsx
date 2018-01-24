import React from 'react';
import { shallow } from 'enzyme';
import InvestComposition from '../InvestComposition';

describe('InvestComposition', () => {
  it('exists', () => {
    expect(InvestComposition).toBeTruthy();
  });

  it('render', () => {
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={jest.fn()}
      suggestionFieldChange={jest.fn()}
      suggestions={[]}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(comp).toMatchSnapshot();
  });

  it('assert text render', () => {
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={jest.fn()}
      suggestionFieldChange={jest.fn()}
      suggestions={[]}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(comp.find('#select-stock').props().renderItem({ name: 'testname' }, true)).toMatchSnapshot();
    expect(comp.find('#select-stock').props().renderItem({ name: 'testname' }, false)).toMatchSnapshot();
  });

  it('assert text render', () => {
    const chgFn = jest.fn();
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={jest.fn()}
      suggestionFieldChange={chgFn}
      suggestions={['AAA']}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(chgFn.mock.calls.length).toEqual(0);
    comp.find('#select-stock').props().onSelect('AAA');
    expect(chgFn.mock.calls.length).toEqual(1);
    comp.update();
    expect(comp.find('#select-stock').props().value).toEqual('AAA');
    expect(chgFn.mock.calls[0][0]).toEqual('AAA');
  });

  it('assert suggestion render', () => {
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={jest.fn()}
      suggestionFieldChange={jest.fn()}
      suggestions={[]}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(comp.find('#select-stock').props().renderInput({ ref: null })).toMatchSnapshot();
  });

  it('assert item value', () => {
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={jest.fn()}
      suggestionFieldChange={jest.fn()}
      suggestions={[]}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(comp.find('#select-stock').props().getItemValue({ name: 'test' })).toEqual('test');
  });

  it('add stock', () => {
    const suggestionFieldChange = jest.fn();
    const chunkUpdate = jest.fn();
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={chunkUpdate}
      suggestionFieldChange={suggestionFieldChange}
      suggestions={[{ id: 1, name: 'AAA', value: 3 }]}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(suggestionFieldChange.mock.calls.length).toEqual(0);
    comp.find('#select-stock').simulate('change', { target: { value: 'AAA' } });
    expect(suggestionFieldChange.mock.calls.length).toEqual(1);
    expect(suggestionFieldChange.mock.calls[0][0]).toEqual('AAA');
    expect(comp).toMatchSnapshot();
    expect(chunkUpdate.mock.calls.length).toEqual(0);
    comp.find('#add-stock').simulate('click');
    expect(chunkUpdate.mock.calls.length).toEqual(1);
    expect(comp).toMatchSnapshot();
  });

  it('add stock fail', () => {
    const suggestionFieldChange = jest.fn();
    const chunkUpdate = jest.fn();
    const comp = shallow(<InvestComposition
      chunks={[]}
      total={0.0}
      chunkUpdate={chunkUpdate}
      suggestionFieldChange={suggestionFieldChange}
      suggestions={[]}
      saveFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(suggestionFieldChange.mock.calls.length).toEqual(0);
    comp.find('#select-stock').simulate('change', { target: { value: 'AAA' } });
    comp.find('#add-stock').simulate('click');
    expect(chunkUpdate.mock.calls.length).toEqual(0);
  });

  it('delete stock', () => {
    const chunkUpdate = jest.fn();
    const comp = shallow((
      <InvestComposition
        chunks={[{
          id: 2, quantity: 1, value: 3, name: 'Name2',
        }, {
          id: 1, quantity: 1, value: 3, name: 'Name',
        }]}
        total={0.0}
        chunkUpdate={chunkUpdate}
        suggestionFieldChange={jest.fn()}
        suggestions={[]}
        saveFunc={jest.fn()}
        cancelFunc={jest.fn()}
      />
    ));
    expect(chunkUpdate.mock.calls.length).toEqual(0);
    comp.find('#delete-chunk-1').simulate('click');
    expect(chunkUpdate.mock.calls.length).toEqual(1);
    expect(chunkUpdate.mock.calls[0][0]).toEqual([{
      id: 2, quantity: 1, value: 3, name: 'Name2',
    }]);
  });

  it('change composition', () => {
    const chunkUpdate = jest.fn();
    const comp = shallow((
      <InvestComposition
        chunks={[{
          id: 1, quantity: 1, value: 3, name: 'Name',
        }, {
          id: 2, quantity: 2, value: 2, name: 'Name2',
        }]}
        total={100.0}
        chunkUpdate={chunkUpdate}
        suggestionFieldChange={jest.fn()}
        suggestions={[]}
        saveFunc={jest.fn()}
        cancelFunc={jest.fn()}
      />
    ));
    expect(chunkUpdate.mock.calls.length).toEqual(0);
    comp.find('#range').props().onChange([0, 6, 18]);
    expect(chunkUpdate.mock.calls.length).toEqual(1);
    expect(chunkUpdate.mock.calls[0][0]).toEqual([{
      id: 1, name: 'Name', quantity: 2, value: 3,
    }, {
      id: 2, name: 'Name2', quantity: 6, value: 2,
    }]);
    comp.find('#range').props().onChange([0, 6, 18]);
    expect(chunkUpdate.mock.calls.length).toEqual(1);
    comp.find('#range').props().onChange([0, 6, 16]);
  });
});

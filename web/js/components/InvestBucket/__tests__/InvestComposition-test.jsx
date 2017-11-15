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
    comp.find('#delete-chunk').simulate('click');
    expect(chunkUpdate.mock.calls.length).toEqual(1);
    expect(chunkUpdate.mock.calls[0][0]).toEqual([]);
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
  });
});

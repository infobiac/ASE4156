import React from 'react';
import { shallow } from 'enzyme';
import InvestPanel from '../InvestPanel';

describe('InvestPanel', () => {
  it('exists', () => {
    expect(InvestPanel).toBeTruthy();
  });

  it('renders', () => {
    const comp = shallow(<InvestPanel
      available={100.0}
      bucket={{
        name: 'Some bucket', value: 3.0, ownedAmount: 2, history: [],
      }}
      investFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    expect(comp).toMatchSnapshot();
  });

  it('change amount (buy)', () => {
    const comp = shallow(<InvestPanel
      available={100.0}
      bucket={{
        name: 'Some bucket', value: 3.0, ownedAmount: 2, history: [],
      }}
      investFunc={jest.fn()}
      cancelFunc={jest.fn()}
    />);
    comp.find('#invest-amount-slider').props().onChange(15);
    comp.update();
    expect(comp).toMatchSnapshot();
  });

  it('cancel', () => {
    const cancel = jest.fn();
    const comp = shallow(<InvestPanel
      available={100.0}
      bucket={{
        name: 'Some bucket', value: 3.0, ownedAmount: 2, history: [],
      }}
      investFunc={jest.fn()}
      cancelFunc={cancel}
    />);
    expect(cancel.mock.calls.length).toEqual(0);
    comp.find('#cancel').simulate('click');
    expect(cancel.mock.calls.length).toEqual(1);
  });

  it('save (sell)', () => {
    const save = jest.fn();
    const comp = shallow(<InvestPanel
      available={100.0}
      bucket={{
        name: 'Some bucket', value: 3.0, ownedAmount: 2, history: [],
      }}
      investFunc={save}
      cancelFunc={jest.fn()}
    />);
    comp.find('#invest-amount-slider').props().onChange(0);
    comp.update();
    expect(comp).toMatchSnapshot();
    expect(save.mock.calls.length).toEqual(0);
    comp.find('#save').simulate('click');
    expect(save.mock.calls.length).toEqual(1);
    expect(save.mock.calls[0][0]).toEqual(-2);
  });
});

/*
type Props = {
  available: number,
  bucket: {
    name: string,
    value: number,
    ownedAmount: number,
    history: Array<{date: Date, value: number}>
  },
  investFunc: number => void,
  cancelFunc: () => void,
}
 */

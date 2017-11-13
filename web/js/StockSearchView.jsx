import React from 'react';
import { graphql, createRefetchContainer } from 'react-relay';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import type { RelayContext } from 'react-relay';

import StockGraph from './components/StockGraph/StockGraph';

import type { StockSearchView_user } from './__generated__/StockSearchView_user.graphql';

type Props = {
  relay: RelayContext,
  user: StockSearchView_user,
}
type State = {
  text: string,
  startDate: ?Date,
  endDate: ?Date,
  focusedInput: any,
}

class StockSearchView extends React.Component<Props, State> {
  static makeDate(date: string): Date {
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const dateResult = new Date(Date.UTC(year, month, day));
    return dateResult;
  }
  constructor() {
    super();
    this.state = {
      text: 'Google',
      startDate: null,
      endDate: null,
      focusedInput: null,
    };
  }
  setStateCallback = () => {
    this.props.relay.refetch((vars) => {
      if (this.state.startDate == null || this.state.endDate == null) {
        return vars;
      }
      return {
        ...vars,
        text: this.state.text,
        // $FlowFixMe
        start: this.state.startDate.format('YYYY-MM-DD'),
        // $FlowFixMe
        end: this.state.endDate.format('YYYY-MM-DD'),
      };
    });
  }
  handleChange = fieldName => (e) => {
    e.preventDefault();
    const { state } = this;
    state[fieldName] = e.target.value;
    this.setState(state, this.setStateCallback);
  }
  render() {
    if (!this.props.user ||
      !this.props.user.profile ||
      !this.props.user.profile.stockFind
    ) {
      return null;
    }
    const quotes = this.props.user.profile.stockFind.map(stock => (stock ? ({
      name: stock.name,
      data: stock.quoteInRange.map(quote => (quote ? ({
        ...quote,
        date: StockSearchView.makeDate(quote.date),
      }) : null)).filter(x => x != null),
    }) : null)).filter(stock => stock && stock.data.length > 0);
    return (
      <div>
        <StockGraph quotes={quotes} compare="PERCENT" />
        <table style={{
          border: '1px solid black',
        }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Average</th>
              <th>Chart</th>
            </tr>
          </thead>
          <tbody>
            {this.props.user.profile.stockFind.map(stock => (
              <tr key={stock.id}>
                <td>{stock.name}</td>
                <td>{
                  (
                    stock
                      .quoteInRange
                      .map(d => d.value)
                      .reduce((s, v) => s + v, 0)
                    / stock.quoteInRange.leng
                  ).toFixed(2)
                }
                </td>
                <td><StockGraph
                  id={stock.id}
                  quotes={[{
                    name: stock.name,
                    data: stock.quoteInRange.map(quote => ({
                      date: this.makeDate(quote.date),
                      value: quote.value,
                    })),
                  },
                  ]}
                />
                </td>
              </tr>
            ))
            }
          </tbody>
        </table>
        Name:
        <input
          type="text"
          value={this.state.text}
          onChange={this.handleChange('text')}
        />
        <DateRangePicker
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          onDatesChange={({ startDate, endDate }) => {
            this.setState({
              startDate,
              endDate,
            }, this.setStateCallback);
          }}
          focusedInput={this.state.focusedInput}
          onFocusChange={focusedInput => this.setState({ focusedInput })}
          isOutsideRange={() => false}
        />
      </div>
    );
  }
}

export default createRefetchContainer(StockSearchView, {
  user: graphql`
    fragment StockSearchView_user on GUser
    @argumentDefinitions(
      text: {type: "String!", defaultValue: ""},
      start: {type: "String!", defaultValue: "2016-08-20"},
      end: {type: "String!", defaultValue: "2016-09-20"},
    ) {
      profile {
        stockFind(text: $text) {
          id
          name
          quoteInRange(start: $start, end: $end) {
            date
            value
          }
        }
      }
    }
  `,
}, graphql`
  query StockSearchViewQuery($text: String!, $start: String!, $end: String!) {
    viewer {
      ...StockSearchView_user @arguments(text: $text, start: $start, end: $end)
    }
  }
`);

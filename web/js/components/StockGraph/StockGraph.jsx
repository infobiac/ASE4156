// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';

type Props = {
  quotes: Array<{
    name: string,
    data: Array<{
      date: Date,
      value: number,
    }>,
  }>,
  id?: ?string,
  compare?: ?('ABSOLUTE' | 'PERCENT'),
  height?: ?string,
  title?: ?string,
}

class StockGraph extends React.Component <Props> {
  static defaultProps = {
    id: 'line-chart',
    compare: 'ABSOLUTE',
    height: '400px',
    title: null,
  }
  static propTypes = {
    quotes: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.instanceOf(Date).isRequired,
        value: PropTypes.number.isRequired,
      }).isRequired).isRequired,
    }).isRequired).isRequired,
    id: PropTypes.string,
    compare: PropTypes.oneOf(['ABSOLUTE', 'PERCENT']),
    height: PropTypes.string,
    title: PropTypes.string,
  }
  render() {
    const chartData = this.props.quotes.map((quote, i) => ({
      index: i,
      ...quote,
    })).reduce((outerCarry, quote) => {
      const scale = this.props.compare === 'ABSOLUTE'
        ? 1
        : (1.0 / quote.data[0].value);
      return {
        names: [...outerCarry.names, quote.name],
        data: quote.data.reduce((innerCarry, datapoint) => {
          const resultData = {
            ...innerCarry,
          };
          const datetime = datapoint.date.getTime();
          if (!(datetime in resultData)) {
            resultData[datetime] = [];
          }
          while (resultData[datetime].length < quote.index) {
            resultData[datetime].push(null);
          }
          resultData[datetime].push(datapoint.value * scale);
          return resultData;
        }, outerCarry.data),
      };
    }, {
      names: [],
      data: {},
    });
    const graphData = Object.keys(chartData.data).map(k => [
      k, ...chartData.data[k],
    ]).map((v) => {
      const result = new Array(chartData.names.length + 1);
      for (let i = 0; i < v.length; i += 1) {
        result[i] = v[i];
      }
      return result;
    }).sort((a, b) => a[0] - b[0])
      .map(d => ([
        new Date(parseInt(d[0], 10)), ...d.slice(1),
      ]));
    if (graphData.length === 0) {
      return <div>No data</div>;
    }
    let extraOptions = {};
    if (this.props.compare === 'PERCENT') {
      extraOptions = {
        vAxis: {
          format: 'percent', // '#,%'
        },
      };
    }
    return (
      <div className="my-pretty-chart-container">
        <Chart
          width="100%"
          height={this.props.height}
          chartType="LineChart"
          data={[
            [
              'Date', ...chartData.names,
            ],
            ...graphData,
          ]}
          options={{
            curveType: 'function',
            interpolateNulls: true,
            title: this.props.title,
            ...extraOptions,
          }}
          graph_id={this.props.id}
          legend_toggle
        />
      </div>
    );
  }
}

export default StockGraph;

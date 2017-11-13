// @flow
import React from 'react';
import Card, { CardHeader, CardContent } from 'material-ui/Card';
import Table, { TableBody, TableCell, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { withStyles } from 'material-ui/styles';

import type { Element } from 'react';

function formatMoney(currency: string, num: number) {
  return currency + numeral(num).format('0,0.00');
}

type valueShape = {
  name: string,
  value: number,
}

const MyTableCell = withStyles(() => ({
  root: {
    borderBottom: '0px',
  },
}))(TableCell);

class Saldo extends React.Component <*> {
  static defaultProps = {
    currency: '$',
    values: [],
    t: w => w,
    showTotal: true,
  };
  static propTypes = {
    t: PropTypes.func,
    currency: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })),
    showTotal: PropTypes.bool,
  };
  collectRow = () => (
    <TableRow>
      <MyTableCell>{this.props.t('totalSharesValue')}</MyTableCell>
      <MyTableCell style={{
        textAlign: 'right',
      }}
      >
        {formatMoney(this.props.currency, this.props.values.reduce((sum, o) => sum + o.value, 0))}
      </MyTableCell>
    </TableRow>
  )
  valueRow = (value: valueShape, i: number, a: Array<valueShape>) => {
    const Comp = i === a.length - 1
      ? TableCell
      : MyTableCell;
    return (
      <TableRow key={i}>
        <Comp>{this.props.t(value.name)}</Comp>
        <Comp style={{
          textAlign: 'right',
        }}
        >{formatMoney(this.props.currency, value.value)}
        </Comp>
      </TableRow>
    );
  }
  valueRows = (values: Array<valueShape>) => values.map(this.valueRow)
  renderCard = (
    values: Array<Element<*>>,
    bottom: ?Element<*>,
    button: Element <*>,
  ) => (
    <Card>
      <CardHeader title="Saldo" />
      <CardContent>
        <Table>
          <TableBody>
            {values}
            {bottom}
          </TableBody>
        </Table>
        {button}
      </CardContent>
    </Card>
  )
  render(): Element<*> {
    let collectRow = null;
    if (this.props.showTotal) {
      collectRow = this.collectRow();
    }
    const button = (<Button raised>
      Sell Shares
                    </Button>);
    return this.renderCard(this.valueRows(this.props.values), collectRow, button);
  }
}

export default Saldo;

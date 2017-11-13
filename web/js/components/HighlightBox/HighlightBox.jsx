// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Card, { CardHeader, CardContent } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemText } from 'material-ui/List';

type Props = {
  title: string,
  value: string,
  secondaryInfo?: ?Array<{
    value: string,
    text: string,
  }>,
}

class HighlightBox extends React.Component<Props> {
  static propTypes = {
    title: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    secondaryInfo: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.node.isRequired,
      text: PropTypes.node.isRequired,
    })),
  }
  static defaultProps = {
    secondaryInfo: [],
  }
  render() {
    return (
      <Card>
        <CardHeader title={this.props.title} />
        <CardContent>
          <h1>{this.props.value}</h1>
          <Divider />
          <List>
            {this.props.secondaryInfo
              ? this.props.secondaryInfo.map(secondary => (
                <ListItem key={secondary.text}>
                  <ListItemText>{`${secondary.value} ${secondary.text}`}</ListItemText>
                </ListItem>
              ))
              : null
            }
          </List>
        </CardContent>
      </Card>
    );
  }
}

export default HighlightBox;

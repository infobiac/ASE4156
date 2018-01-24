/* eslint react/no-multi-comp: "off" */
import React from 'react';
import PropTypes from 'prop-types';
import Card, { CardHeader, CardContent } from 'material-ui/Card';

export class CardWF extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cardText: PropTypes.node.isRequired,
  }
  render() {
    return (
      <Card >
        <CardHeader title={this.props.title} />
        <CardContent>
          {this.props.cardText}
        </CardContent>
      </Card>
    );
  }
}

export class MediaCardWF extends React.Component {
  static propTypes = {
    content: PropTypes.node.isRequired,
  }
  render() {
    return (
      <Card>
        <div>
          {this.props.content}
        </div>
      </Card>
    );
  }
}

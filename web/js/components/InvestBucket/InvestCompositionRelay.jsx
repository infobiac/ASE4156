// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import { routerShape } from 'found';

import type { RelayContext } from 'react-relay';

import InvestComposition from './InvestComposition';
import changeBucketComposition from '../../mutations/BucketEdit/ChangeBucketComposition';

import type { InvestCompositionRelay_bucket } from './__generated__/InvestCompositionRelay_bucket.graphql';
import type { InvestCompositionRelay_profile } from './__generated__/InvestCompositionRelay_profile.graphql';

type ChunkList = Array<{
  id: string,
  name: string,
  quantity: number,
  value: number,
}>;

type Props = {
  bucket: InvestCompositionRelay_bucket,
  profile: InvestCompositionRelay_profile,
  relay: RelayContext,
}
type State = {
  chunks: ChunkList,
}

class InvestCompositionRelay extends React.Component<Props, State> {
  static contextTypes = {
    errorDisplay: PropTypes.func.isRequired,
    router: routerShape.isRequired,
  };
  constructor(props) {
    super();
    this.state = {
      chunks: props.bucket.stocks.edges.map(s => (s && s.node && s.node.stock.latestQuote ? ({
        id: s.node.stock.id,
        quantity: s.node.quantity,
        value: s.node.stock.latestQuote.value,
        name: s.node.stock.name,
      }) : null)).filter(x => !!x),
    };
  }
  saveChunks = (chunks) => {
    const updater = (store) => {
      const data = store.getRootField('editConfiguration').getLinkedRecord('bucket');
      store.getRoot().copyFieldsFrom(data);
      store.get(this.props.bucket.id).setValue(data.getValue('available'), 'available');
      store.get(this.props.bucket.id).setLinkedRecord(data.getLinkedRecord('stocks'), 'stocks');
    };
    changeBucketComposition(updater, null, (r, e) => this.context.errorDisplay({
      message: e ? e[0].message : 'Composition successfully changed',
    }))(this.props.relay.environment)({
      config: chunks.map(c => ({ idValue: c.id, quantity: c.quantity })),
      id: this.props.bucket.id,
    });
  }
  save = () => {
    this.saveChunks(this.state.chunks);
    this.cancel();
  }
  cancel = () => {
    this.context.router.replace('/home');
  }
  updateChunks = chunks => this.setState(() => ({ chunks }))
  render() {
    if (
      !this.props.profile.investSearch ||
      !this.props.bucket.stocks
    ) {
      return null;
    }
    return (
      <InvestComposition
        chunks={this.state.chunks}
        total={
          this.props.bucket.available
          + this.props.bucket.stocks.edges.reduce((sum, item) =>
              sum
            + (
              item && item.node && item.node.stock.latestQuote
                ? item.node.quantity * item.node.stock.latestQuote.value
                : 0
            ), 0)
        }
        chunkUpdate={this.updateChunks}
        suggestionFieldChange={(text) => {
          this.props.relay.refetch(() => ({ text }));
        }}
        suggestions={
          // $FlowFixMe
          this.props.profile.investSearch.map(s => ({
            value: s && s.latestQuote ? s.latestQuote.value : 0,
            ...s,
          }))
        }
        saveFunc={this.save}
        cancelFunc={this.cancel}
      />
    );
  }
}

export default createRefetchContainer(InvestCompositionRelay, {
  bucket: graphql`
    fragment InvestCompositionRelay_bucket on GInvestmentBucket {
      id
      available
      stocks {
        edges {
          node {
            quantity
            stock {
              id
              name
              latestQuote {
                value
              }
            }
          }
        }
      }
    }
  `,
  profile: graphql`
    fragment InvestCompositionRelay_profile on GProfile
    @argumentDefinitions(
      text: {type: "String!", defaultValue: ""}
    ) {
      investSearch: stockFind(text: $text, first: 4) {
        name
        id
        latestQuote {
          value
        }
      }
    }
  `,
}, graphql`
    query InvestCompositionRelayQuery($text: String!) {
      viewer {
        profile {
          ...InvestCompositionRelay_profile @arguments(text: $text)
        }
      }
    }
  `);

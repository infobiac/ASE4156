"""
GraphQL definitions for the Trading App
"""
from graphene_django import DjangoObjectType
from graphql_relay.node.node import from_global_id
from graphene import AbstractType, Field, Float, Int, Mutation, relay, String
from stocks.models import Stock
from .models import TradeStock, TradingAccount


# pylint: disable=too-few-public-methods
class GTrade(DjangoObjectType):
    """
    Exposing the whole Trade object to GraphQL
    """
    value = Float()

    class Meta(object):
        """
        Meta Model for Trade
        """
        model = TradeStock
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_value(data, _args, _context, _info):
        """
        Returns the value of a trade (see the model)
        """
        return data.current_value()


class GTradingAccount(DjangoObjectType):
    """
    Exposing the whole TradingAccount to GraphQL
    """
    class Meta(object):
        """
        Meta Model for TradingAccount
        """
        model = TradingAccount
        interfaces = (relay.Node, )


# pylint: disable=no-init
class Query(AbstractType):
    """
    We don't want to have any root queries here
    """
    pass
# pylint: enable=no-init


class AddTrade(Mutation):
    """
    AddTrade creates a new Trade for the user and stock
    """
    class Input(object):
        """
        Input to create a trade. Right now it's only ticker and quantity.
        """
        id_value = String()
        quantity = Int()
        account_name = String()
    trade = Field(lambda: GTrade)

    @staticmethod
    def mutate(_self, args, context, _info):
        """
        Creates a Trade and saves it to the DB
        """
        stock = Stock.objects.get(id=from_global_id(args['bucket_id'])[1])
        account = TradingAccount.objects.get(
            account_name=args['account_name'],
            profile_id=context.user.profile.id
        )
        trade = account.stock_trade(stock, args['quantity'])
        return AddTrade(trade=trade)
# pylint: enable=too-few-public-methods

"""
GraphQL definitions for the Trading App
"""
from graphene_django import DjangoObjectType
from graphql_relay.node.node import from_global_id
from graphene import AbstractType, Field, Float, ID, Int, Mutation, NonNull, \
    relay, String
from stocks.models import InvestmentBucket, Stock
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
    total_value = NonNull(Float)
    available_cash = NonNull(Float)

    class Meta(object):
        """
        Meta Model for TradingAccount
        """
        model = TradingAccount
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_total_value(data, _args, _context, _info):
        """
        Returns the total value that the account currently holds
        """
        return data.total_value()

    @staticmethod
    def resolve_available_cash(data, _args, context, _info):
        """
        Returns the amount of cash the user has available
        """
        return data.available_cash() + context.plaid.current_balance()


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
        id_value = NonNull(String)
        quantity = NonNull(Int)
        account_name = NonNull(String)
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


class InvestBucket(Mutation):
    """
    Invests into the bucket
    """
    class Input(object):
        """
        We need quantity, account id and bucket id
        """
        quantity = NonNull(Float)
        trading_acc_id = NonNull(ID)
        bucket_id = NonNull(ID)

    profile = Field(lambda: Int)

    @staticmethod
    def mutate(_self, args, context, _info):
        """
        Creates the trade
        """
        trading_acc_id = from_global_id(args['trading_acc_id'])[1]
        bucket_id = from_global_id(args['bucket_id'])[1]
        trading_acc = TradingAccount.objects.get(id=trading_acc_id, profile=context.user.profile)
        bucket = InvestmentBucket.objects.get(id=bucket_id)
        trading_acc.trade_bucket(bucket, args['quantity'])
        return InvestBucket(profile=1)
# pylint: enable=too-few-public-methods

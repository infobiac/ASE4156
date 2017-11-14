"""
GraphQL definitions for the Trading App
"""
from graphene_django import DjangoObjectType
from graphql_relay.node.node import from_global_id
from graphene import Field, Float, ID, Int, Mutation, NonNull, \
    relay, String
from stocks.graphql import GInvestmentBucket
from stocks.models import InvestmentBucket, Stock
from .models import TradeBucket, TradeStock, TradingAccount


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
    def resolve_value(data, _info, **_args):
        """
        Returns the value of a trade (see the model)
        """
        return data.current_value()


class GInvestmentBucketTrade(DjangoObjectType):
    """
    Exposing the whole Trade object to GraphQL
    """
    value = Float()

    class Meta(object):
        """
        Meta Model for Trade
        """
        model = TradeBucket
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_value(data, _info, **_args):
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
    def resolve_total_value(data, _info, **_args):
        """
        Returns the total value that the account currently holds
        """
        return data.total_value()

    @staticmethod
    def resolve_available_cash(data, _info, **_args):
        """
        Returns the amount of cash the user has available
        """
        return data.available_cash()


# pylint: disable=no-init
class Query(object):
    """
    We don't want to have any root queries here
    """
    pass
# pylint: enable=no-init


class AddTrade(Mutation):
    """
    AddTrade creates a new Trade for the user and stock
    """
    class Arguments(object):
        """
        Arguments to create a trade. Right now it's only ticker and quantity.
        """
        id_value = NonNull(String)
        quantity = NonNull(Int)
        account_name = NonNull(String)
    trade = Field(lambda: GTrade)

    @staticmethod
    def mutate(_self, info, id_value, quantity, account_name, **_args):
        """
        Creates a Trade and saves it to the DB
        """
        stock = Stock.objects.get(id=from_global_id(id_value)[1])
        account = TradingAccount.objects.get(
            account_name=account_name,
            profile_id=info.context.user.profile.id
        )
        trade = account.trade_stock(stock, quantity)
        return AddTrade(trade=trade)


class InvestBucket(Mutation):
    """
    Invests into the bucket
    """
    class Arguments(object):
        """
        We need quantity, account id and bucket id
        """
        quantity = NonNull(Float)
        trading_acc_id = NonNull(ID)
        bucket_id = NonNull(ID)

    trading_account = Field(lambda: GTradingAccount)
    bucket = Field(lambda: GInvestmentBucket)

    @staticmethod
    def mutate(_self, info, quantity, trading_acc_id, bucket_id, **_args):
        """
        Creates the trade
        """
        trading_acc_id = from_global_id(trading_acc_id)[1]
        bucket_id = from_global_id(bucket_id)[1]
        trading_acc = TradingAccount.objects.get(
            id=trading_acc_id,
            profile=info.context.user.profile,
        )
        bucket = InvestmentBucket.objects.get(id=bucket_id)
        trading_acc.trade_bucket(bucket, quantity)
        return InvestBucket(trading_account=trading_acc, bucket=bucket)
# pylint: enable=too-few-public-methods

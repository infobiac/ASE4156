"""
GraphQL definitions for the Authentication App
"""
from django.contrib.auth.models import User
from graphene import AbstractType, Argument, Field, Float, Int, List, Mutation, \
    NonNull, ObjectType, String, relay
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from trading.models import TradingAccount
from trading.graphql import GTradingAccount
from stocks.graphql import GInvestmentBucket, GStock
from stocks.models import InvestmentBucket, Stock
from .models import Profile, UserBank


# pylint: disable=too-few-public-methods
class GUser(DjangoObjectType):
    """
    GraphQL representation of a User
    """
    class Meta(object):
        """
        Meta Model for User. We must make sure to not expose
        the whole usere object
        """
        model = User
        only_fields = ('id', 'profile', 'username', 'userbank')
        interfaces = (relay.Node, )


class GProfile(DjangoObjectType):
    """
    GraphQL representation of a Profile
    """
    stock_find = List(
        NonNull(GStock), args={'text': Argument(NonNull(String)), 'first': Argument(Int)})
    invest_suggestions = DjangoFilterConnectionField(
        GInvestmentBucket,
    )
    selected_acc = NonNull(GTradingAccount)

    class Meta(object):
        """
        Meta Model for Profile
        """
        model = Profile
        only_fields = ('id', 'trading_accounts', 'selected_acc', 'stock_find')
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_stock_find(_self, args, _context, _info):
        """
        Finds a stock given a case insensitive name
        """
        name = args['text']
        if 'first' in args:
            return Stock.find_stock(name, args['first'])
        return Stock.find_stock(name)

    @staticmethod
    def resolve_invest_suggestions(_data, _args, context, _info):
        """
        Finds all the investment suggestions available to the user
        """
        return InvestmentBucket.accessible_buckets(context.user.profile)

    @staticmethod
    def resolve_selected_acc(data, _args, _context, _info):
        """
        Returns the selected account. For now we just assume the user has only 1
        """
        acc = data.trading_accounts.all()[:1]
        if not acc:
            acc = data.trading_accounts.create(
                account_name='default'
            )
        else:
            acc = acc[0]
        return acc


class DataPoint(object):
    """
    Dummy class to represent a date / value DataPoint
    """
    def __init__(self, date, value):
        self.date = date
        self.value = value


class GDataPoint(ObjectType):
    """
    GraphQL definition of the DataPoint above
    """
    date = String()
    value = Float()


class GUserBank(DjangoObjectType):
    """
    GraphQL representation of a UserBank
    """
    balance = NonNull(Float)
    income = NonNull(Float)
    name = NonNull(String)
    outcome = NonNull(Float)
    history = List(GDataPoint, args={'start': Argument(NonNull(String))})

    class Meta(object):
        """
        Meta Model for UserBank
        """
        model = UserBank
        only_fields = ('id', 'balance', 'income', 'outcome')
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_history(_data, args, context, _info):
        """
        Builds the financial history for the user
        """
        return [
            DataPoint(date, value)
            for (date, value)
            in context.plaid.historical_data(args['start'])
        ]

    @staticmethod
    def resolve_balance(_data, _args, context, _info):
        """
        Finds the current balance of the user
        """
        return context.plaid.current_balance()

    @staticmethod
    def resolve_name(_data, _args, context, _info):
        """
        Returns the name of the bank account
        """
        return context.plaid.account_name()

    @staticmethod
    def resolve_income(_data, _args, context, _info):
        """
        Returns the income a user has per month
        """
        return context.plaid.income(30)

    @staticmethod
    def resolve_outcome(_data, _args, context, _info):
        """
        Returns the expenditures a user has per month
        """
        return context.plaid.expenditure(30)


# pylint: disable=no-init
class Query(AbstractType):
    """
    Query represents the entry method for a GraphQL request
    """
    viewer = Field(GUser, )

    @staticmethod
    def resolve_viewer(_self, _args, context, _info):
        """
        The viewer represents the current logged in user
        """
        if not context.user.is_authenticated():
            return None
        return context.user
# pylint: enable=no-init


class AddTradingAccount(Mutation):
    """
    AddTradingAccount creates a new TradingAccount for the user
    """
    class Input(object):
        """
        Input to create a trading account. Right now it's only a name.
        """
        name = String()
    account = Field(lambda: GTradingAccount)

    @staticmethod
    def mutate(_self, args, context, _info):
        """
        Creates a TradingAccount and saves it to the DB
        """
        account = TradingAccount(
            profile=context.user.profile,
            account_name=args['name']
        )
        account.save()
        return AddTradingAccount(account=account)
# pylint: enable=too-few-public-methods

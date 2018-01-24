"""
GraphQL definitions for the Authentication App
"""
import datetime
from django.contrib.auth.models import User
from graphene import Argument, Field, Float, Int, List, Mutation, \
    NonNull, String, relay
from graphene_django import DjangoObjectType, DjangoConnectionField
from trading.models import TradingAccount
from trading.graphql import GTradingAccount
from stocks.graphql import GInvestmentBucket, GStock, GDataPoint, DataPoint
from stocks.models import InvestmentBucket, Stock
from .models import Profile, UserBank


# pylint: disable=too-few-public-methods
class GUser(DjangoObjectType):
    """
    This is the GraphQL representation of a :py:class:`django.contrib.auth.models.User`.
    This should *only* be accessible for the user himself.
    """

    class Meta(object):
        """
        Meta Model for :py:class:`django.contrib.auth.models.User`. Most
        important to note is the fields we expose:
        ID, Profile, Username and UserBank(s)
        """
        model = User
        only_fields = ('id', 'profile', 'username', 'userbank')
        interfaces = (relay.Node, )


class GProfile(DjangoObjectType):
    """
    This is the GraphQL representation of a :py:class:`authentication.models.Profile`.
    This is more of a publically accessible object. Even though we won't expose everything, this
    object allows us to add more fields to the user object.
    """
    stock_find = List(
        NonNull(GStock),
        args={'text': Argument(NonNull(String)),
              'first': Argument(Int)})
    invest_suggestions = DjangoConnectionField(GInvestmentBucket, )
    selected_acc = NonNull(GTradingAccount)

    class Meta(object):
        """
        Meta Model for :py:class:`authentication.models.Profile`. We have edges to the
        :py:class:`trading.models.TradingAccount` the User
        has, a field that is the current Trading Account a User has, and a
        function that allows the user to search for stocks.
        """
        model = Profile
        only_fields = ('id', 'trading_accounts', 'selected_acc', 'stock_find')
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_stock_find(_self, _info, text, first=None, **_args):
        """
        Finds a stock given a case insensitive name.
        (see :py:meth:`stocks.models.Stock.find_stock`)

        :param text: The text the user want to search for.
        :type name: str.
        :param first: The maximum number of results to return
        :type name: int.
        :returns: :py:class:`django.db.models.query.QuerySet` of :py:class:`stocks.stocks.Stock`
        """
        if first:
            return Stock.find_stock(text, first)
        return Stock.find_stock(text)

    @staticmethod
    def resolve_invest_suggestions(_data, info, **_args):
        """
        Returns a list of buckets that the User can invest in.
        (see :py:meth:`stocks.models.InvestmentBucket.available_buckets`)

        :param info: Information about the user to check which recommendations
            are best for the user.
        :type info: Graphene Request Info.
        :returns: :py:class:`django.db.models.query.QuerySet` of
            :py:class:`stocks.models.InvestmentBucket`
        """
        return InvestmentBucket.accessible_buckets(info.context.user.profile)

    @staticmethod
    def resolve_selected_acc(data, _info, **_args):
        """
        Returns the current account the user has selected. Right now it just
        calls the default account of the profile.
        (see :py:meth:`authentication.models.Profile.default_acc`)

        :returns: :py:class:`django.db.models.query.QuerySet` of
            :py:class:`trading.models.TradingAccount`
        """
        return data.default_acc()


class GUserBank(DjangoObjectType):
    """
    GraphQL wrapper around the :py:class:`authentication.models.UserBank` model.
    This should *only* be accessible to the user.
    """
    balance = NonNull(Float)
    income = NonNull(Float)
    name = NonNull(String)
    outcome = NonNull(Float)
    history = NonNull(
        List(NonNull(GDataPoint)), args={'start': Argument(NonNull(String))})
    balance_date = NonNull(String)
    monthly_start = NonNull(String)
    monthly_end = NonNull(String)

    class Meta(object):
        """
        Meta Model for :py:class:`authentication.models.UserBank`. We want to expose the user's
        balance, income and expenditure (here named outcome)
        """
        model = UserBank
        only_fields = ('id', 'balance', 'income', 'outcome')
        interfaces = (relay.Node, )

    @staticmethod
    def resolve_history(data, _info, start, **_args):
        """
        This method returns the account history for a user. This is, how much
        value the bank account historically had.
        (see :py:meth:`authentication.models.UserBank.historical_data`)

        :param data: The bank we want to extract the history from.
        :type data: :py:class:`authentication.models.UserBank`
        :param start: The date with that the history should start. The query
            will return the history from start until today.
        :type start: str (YYYY-MM-dd).
        :returns: `stocks.graphql.DataPoint` representing the history.
        """
        return [
            DataPoint(date, value)
            for (date, value) in data.historical_data(start)
        ]

    @staticmethod
    def resolve_balance(data, _info, **_args):
        """
        Calls :py:meth:`authentication.models.UserBank.current_balance` on
        data.

        :param data: The Userbank we want to extract the balance from.
        :type data: :py:class:`authentication.models.UserBank`
        :returns: The current balance of that the user has.
        """
        return data.current_balance(False)

    @staticmethod
    def resolve_balance_date(_data, _info):
        """
        Date of the balance
        """
        return str(datetime.date.today())

    @staticmethod
    def resolve_monthly_start(_data, _info):
        """
        Start date for measuring the monthly income/expenditure
        """
        return str(datetime.date.today() - datetime.timedelta(days=30))

    @staticmethod
    def resolve_monthly_end(_data, _info):
        """
        End date for measuring the monthly income/expenditure
        """
        return str(datetime.date.today())

    @staticmethod
    def resolve_name(data, _info, **_args):
        """
        Calls :py:meth:`authentication.models.UserBank.account_name` on
        data.

        :param data: The Userbank we want to get the account name.
        :type data: :py:class:`authentication.models.UserBank`
        :returns: The account name of the bank.
        """
        return data.account_name(False)

    @staticmethod
    def resolve_income(data, _info, **_args):
        """
        Calls :py:meth:`authentication.models.UserBank.income` on
        data.

        :param data: The Userbank we want to extract the income from.
        :type data: :py:class:`authentication.models.UserBank`
        :returns: The monthly income of the account.
        """
        return data.income(False)

    @staticmethod
    def resolve_outcome(data, _info, **_args):
        """
        Calls :py:meth:`authentication.models.UserBank.expenditure` on
        data.

        :param data: The Userbank we want to extract the expenditures from.
        :type data: :py:class:`authentication.models.UserBank`
        :returns: The monthly expenditure of the account.
        """
        return data.expenditure(False)


# pylint: disable=no-init
class Query(object):
    """
    The root of the viewer query. This is the base of building the user object
    with all of its data.
    """
    viewer = Field(GUser, )

    @staticmethod
    def resolve_viewer(_self, info, **_args):
        """
        The viewer represents the data for the user making the request.

        :param info: information about the request with context
        :type data: Graphene Request Info.
        """
        if not info.context.user.is_authenticated():
            return None
        return info.context.user


# pylint: enable=no-init


class AddTradingAccount(Mutation):
    """
    AddTradingAccount creates a new :py:class:`trading.models.TradingAccount` for the user.
    """

    class Arguments(object):
        """
        Arguments to create a :py:class:`trading.models.TradingAccount`.
        Right now we only need the name.
        """
        name = String()

    account = Field(lambda: GTradingAccount)

    @staticmethod
    def mutate(_self, info, name, **_args):
        """
        Creates a new :py:class:`trading.models.TradingAccount` for the user and returns it.

        :param info: Information about the request / user.
        :type data: Graphene Request Info.
        :param name: Name of the new trading account.
        :type name: str

        """
        account = TradingAccount(
            profile=info.context.user.profile, account_name=name)
        account.save()
        return AddTradingAccount(account=account)


# pylint: enable=too-few-public-methods

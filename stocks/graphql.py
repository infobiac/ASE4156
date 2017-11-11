"""
GraphQL definitions for the Stocks App
"""
from collections import namedtuple
from graphene_django import DjangoObjectType
from graphene import Argument, Boolean, Field, Float, ID, \
    InputObjectType, List, Mutation, NonNull, String, relay
from graphql_relay.node.node import from_global_id
from .models import DailyStockQuote, InvestmentBucket, \
    InvestmentBucketDescription, InvestmentStockConfiguration, Stock


# pylint: disable=too-few-public-methods
class GInvestmentBucketConfigurationUpdate(InputObjectType):
    """
    Represents one choice of stock for a bucket
    """
    id_value = ID()
    quantity = Float()


class GDailyStockQuote(DjangoObjectType):
    """
    GraphQL representation of a DailyStockQuote
    """
    class Meta:
        """
        Meta Model for DailyStockQuote
        """
        model = DailyStockQuote
        interfaces = (relay.Node, )


class GInvestmentBucketAttribute(DjangoObjectType):
    """
    GraphQL representation of a InvestmentBucketDescription
    """
    class Meta:
        """
        Meta Model for InvestmentBucketDescription
        """
        model = InvestmentBucketDescription
        interfaces = (relay.Node, )


class GInvestmentBucket(DjangoObjectType):
    """
    GraphQL representation of a InvestmentBucket
    """
    is_owner = NonNull(Boolean)
    value = NonNull(Float)

    class Meta:
        """
        Meta Model for InvestmentBucket
        """
        model = InvestmentBucket
        interfaces = (relay.Node, )
        only_fields = ('id', 'name', 'public', 'description', 'stocks', 'available', 'value')

    @staticmethod
    def resolve_is_owner(data, info, **_args):
        """
        Returns whether the user ownes the investment bucket
        """
        return data.owner.id == info.context.user.profile.id

    @staticmethod
    def resolve_stocks(data, _info, **_args):
        """
        Returns the *current* stocks in the bucket
        """
        return data.get_stock_configs()

    @staticmethod
    def resolve_value(data, _info, **_args):
        """
        The current value of the investment bucket
        """
        return data.value_on()


class GInvestmentStockConfiguration(DjangoObjectType):
    """
    GraphQL representation of a InvestmentStockConfiguration
    """
    class Meta:
        """
        Meta Model for InvestmentStockConfiguration
        """
        model = InvestmentStockConfiguration
        interfaces = (relay.Node, )


class GStock(DjangoObjectType):
    """
    GraphQL representation of a Stock
    """
    quote_in_range = NonNull(List(GDailyStockQuote), args={'start': Argument(
        NonNull(String)), 'end': Argument(NonNull(String))})
    latest_quote = Field(GDailyStockQuote)

    class Meta(object):
        """
        Meta Model for Stock
        """
        model = Stock
        interfaces = (relay.Node, )
        only_fields = ('quote_in_range', 'latest_quote', 'name', 'ticker', 'trades')

    @staticmethod
    def resolve_latest_quote(data, _info, **_args):
        """
        Returns the most recent stock quote
        """
        return data.latest_quote()

    @staticmethod
    def resolve_quote_in_range(data, _info, start, end, **_args):
        """
        Finds the stock quotes for the stock within a time range
        """
        return data.quote_in_range(start, end)

    @staticmethod
    def resolve_trades(stock, info, **_args):
        """
        We need to apply permission checks to trades
        """
        return stock.trades_for_profile(info.context.user.profile)


class AddStock(Mutation):
    """
    AddStock creates a new Stock that is tracked
    """
    class Arguments(object):
        """
        Arguments to create a stock. We only need the ticker.
        """
        ticker = NonNull(String)
        name = NonNull(String)
    stock = Field(lambda: GStock)

    @staticmethod
    def mutate(_self, _info, ticker, name, **_args):
        """
        Creates a Stock and saves it to the DB
        """
        stock = Stock.create_new_stock(ticker, name)
        return AddStock(stock=stock)


class AddBucket(Mutation):
    """
    Creates a new InvestmentBucket and returns the new bucket
    """
    class Arguments(object):
        """
        We only need the name of the new bucket to create it
        """
        name = NonNull(String)
        investment = NonNull(Float)
        public = NonNull(Boolean)
    bucket = Field(lambda: GInvestmentBucket)

    @staticmethod
    def mutate(_self, info, name, investment, public, **_args):
        """
        Creates a new InvestmentBucket and saves it to the DB
        """
        bucket = InvestmentBucket.create_new_bucket(
            name=name,
            public=public,
            owner=info.context.user.profile,
            available=investment,
        )
        return AddBucket(bucket=bucket)


class AddAttributeToInvestment(Mutation):
    """
    Adds a description to an Investment Bucket and returns the bucket
    """
    class Arguments(object):
        """
        We need the description and the bucket as input
        """
        desc = NonNull(String)
        bucket_id = NonNull(ID)
        is_good = NonNull(Boolean)
    bucket_attr = Field(lambda: GInvestmentBucketAttribute)

    @staticmethod
    def mutate(_self, info, desc, bucket_id, is_good, **_args):
        """
        Executes the mutation to add the attribute
        """
        bucket = InvestmentBucket.objects.get(
            id=from_global_id(bucket_id)[1],
        )
        if not bucket or (not bucket.owner.id == info.context.user.profile.id):
            raise Exception("You don't own the bucket!")
        attribute = bucket.add_attribute(desc, is_good)
        return AddAttributeToInvestment(bucket_attr=attribute)


class EditAttribute(Mutation):
    """
    Allows to edit an attribute description
    """
    class Arguments(object):
        """
        Description and ID for the mutation
        """
        desc = NonNull(String)
        id_value = NonNull(ID)
    bucket_attr = Field(lambda: GInvestmentBucketAttribute)

    @staticmethod
    def mutate(_self, info, id_value, desc, **_args):
        """
        Executes the mutation to change the attribute
        """
        bucket_attr = InvestmentBucketDescription.objects.filter(
            id=from_global_id(id_value)[1],
            bucket__owner__id=info.context.user.profile.id,
        )
        if not bucket_attr:
            raise Exception("You don't own the bucket!")
        else:
            bucket_attr = bucket_attr.get()
        bucket_attr.change_description(desc)
        return EditAttribute(bucket_attr=bucket_attr)


class DeleteAttribute(Mutation):
    """
    Deletes an attribute from a bucket
    """
    class Arguments(object):
        """
        We just need the ID to delete it
        """
        id_value = NonNull(ID)
    is_ok = Field(lambda: Boolean)

    @staticmethod
    def mutate(_self, info, id_value, **_args):
        """
        Executes the mutation by deleting the attribute
        """
        bucket_attr = InvestmentBucketDescription.objects.filter(
            id=from_global_id(id_value)[1],
            bucket__owner__id=info.context.user.profile.id,
        )
        if not bucket_attr:
            raise Exception("You don't own the bucket!")
        else:
            bucket_attr = bucket_attr[0]
        bucket_attr.delete()
        return DeleteAttribute(is_ok=True)


class DeleteBucket(Mutation):
    """
    Deletes an attribute from a bucket
    """
    class Arguments(object):
        """
        We just need the ID to delete it
        """
        id_value = NonNull(ID)
    is_ok = Field(lambda: Boolean)

    @staticmethod
    def mutate(_self, info, id_value, **_args):
        """
        Executes the mutation by deleting the attribute
        """
        bucket = InvestmentBucket.objects.filter(
            id=from_global_id(id_value)[1],
            owner=info.context.user.profile,
        )
        if not bucket:
            raise Exception("You don't own the bucket!")
        else:
            bucket = bucket[0]
        bucket.delete()
        return DeleteAttribute(is_ok=True)


Config = namedtuple(
    "Config",
    ["id", "quantity"],
)


class EditConfiguration(Mutation):
    """
    Mutation to change the stock configuration of a bucket
    """
    class Arguments(object):
        """
        As input we take the new configuration and the bucket id
        """
        config = NonNull(List(GInvestmentBucketConfigurationUpdate))
        id_value = NonNull(ID)
    bucket = Field(lambda: GInvestmentBucket)

    @staticmethod
    def mutate(_self, info, id_value, config, **_args):
        """
        This performs the actual mutation by removing the old configuration and
        then writing the new one
        """
        bucket = InvestmentBucket.objects.get(
            id=from_global_id(id_value)[1],
            owner=info.context.user.profile,
        )
        if not bucket or (not bucket.owner.id == info.context.user.profile.id):
            raise Exception("You don't own the bucket!")
        new_config = [
            Config(
                id=from_global_id(c['id_value'])[1],
                quantity=c['quantity'],
            )
            for c
            in config
        ]
        bucket.change_config(new_config)
        return EditConfiguration(bucket=bucket)


# pylint: disable=no-init
class Query(object):
    """
    We don't want to have any root queries here
    """
    invest_bucket = Field(GInvestmentBucket, args={'id_value': Argument(NonNull(ID))})

    @staticmethod
    def resolve_invest_bucket(_self, info, id_value, **_args):
        """
        The viewer represents the current logged in user
        """
        if not info.context.user.is_authenticated():
            return None

        return InvestmentBucket.accessible_buckets(
            info.context.user.profile
        ).get(
            id=from_global_id(id_value)[1]
        )

# pylint: enable=too-few-public-methods
# pylint: enable=no-init

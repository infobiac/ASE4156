"""
Models keeps track of all the persistent data around stocks
"""
import datetime
from datetime import date as os_date
import math
from django.db.models import Q
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.db import transaction
from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, MinValueValidator
from authentication.models import Profile
from .stock_helper import validate_ticker


class Stock(models.Model):
    """
    Stock represents a single stock. For example GOOGL
    """
    name = models.CharField(
        max_length=255,
        validators=[
            MinLengthValidator(1, message="The name should not be empty.")
        ], )
    ticker = models.CharField(
        max_length=10,
        unique=True,
        validators=[
            MinLengthValidator(1, message="The ticker should not be empty."),
            validate_ticker
        ], )

    def latest_quote(self, date=None):
        """
        Returns the latest quote for the stock
        """
        quote_query = self.daily_quote
        if date is not None:
            if isinstance(date, str):
                date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            if isinstance(date, datetime.datetime):
                date = date.date()
            if date > datetime.datetime.now().date():
                raise Exception("Date is later than now!")
            quote_query = quote_query.filter(date__lte=date)
        quote_query = quote_query.order_by('-date')
        if quote_query:
            return quote_query[0]
        raise Exception("No quote found")

    @staticmethod
    def find_stock(text, first=None):
        """
        Finds the stocks that contain >text<
        """
        query = Stock.objects.filter(name__icontains=text)
        if first:
            query = query[:first]
        return query

    @staticmethod
    def create_new_stock(ticker, name):
        """
        Creates a new stock
        """
        if not validate_ticker(ticker):
            raise Exception("Invalid Ticker")
        stock = Stock(name=name, ticker=ticker)
        stock.save()
        return stock

    def quote_in_range(self, start=None, end=None):
        """
        Returns a list of daily stock quotes in the given timerange
        """
        query = self.daily_quote
        if start:
            query = query.filter(date__gte=start)
        if end:
            query = query.filter(date__lte=end)
        query = query.order_by('date')
        return query

    def trades_for_profile(self, profile):
        """
        Returns all trades the user made with this stock
        """
        return self.trades.filter(account__profile=profile)


class DailyStockQuote(models.Model):
    """
    DailyStockQuote is one day in the performance of a stock,
    for example 2nd July GOOGL value is 281.31$
    """
    value = models.FloatField(validators=[
        MinValueValidator(
            0.0, message="Daily stock quote can not be negative")
    ])
    date = models.DateField()
    stock = models.ForeignKey(Stock, related_name='daily_quote')

    class Meta(object):
        """
        We use this to define our uniqueness constraint
        """
        unique_together = (
            'stock',
            'date', )


class InvestmentBucket(models.Model):
    """
    An investment bucket represents a collection of stocks to invest in
    """
    name = models.CharField(
        max_length=255,
        validators=[
            MinLengthValidator(1, message="The name should not be empty.")
        ], )
    owner = models.ForeignKey(Profile, related_name='owned_bucket')
    public = models.BooleanField()
    available = models.FloatField(validators=[
        MinValueValidator(
            0.0, message="The available money can not be negative.")
    ])

    class Meta(object):
        unique_together = ('name', 'owner')

    @staticmethod
    def accessible_buckets(profile):
        """
        Finds all buckets that the user could view
        """
        return InvestmentBucket.objects.filter(
            Q(owner=profile) | Q(public=True))

    @staticmethod
    def create_new_bucket(name, public, owner, available=1000.0):
        """
        Creates a new InvestmentBucket
        """
        bucket = InvestmentBucket(
            name=name, public=public, owner=owner, available=available)
        bucket.save()
        return bucket

    def add_attribute(self, text, is_good=True):
        """
        Adds an attribute to an investment bucket
        """
        attribute = self.description.create(
            text=text,
            is_good=is_good, )
        return attribute

    def get_stock_configs(self, date=None):
        """
        Get all associated configs
        """
        if not date:
            return self.stocks.filter(end=None)
        return self.stocks.filter(
            start__lte=date).filter(Q(end__gte=date) | Q(end=None))

    def _sell_all(self):
        """
        Sells all stocks held in the investment bucket
        """
        with transaction.atomic():
            current_configs = self.get_stock_configs()
            balance_change = 0.0
            for conf in current_configs:
                balance_change += conf.value_on()
            self.available += balance_change
            current_configs.update(
                end=datetime.datetime.now() - datetime.timedelta(days=31))
            self.save()

    def change_config(self, new_config):
        """
        Changes the configuration of the investment bucket to new_config
        """
        with transaction.atomic():
            self._sell_all()
            for conf in new_config:
                stock = Stock.objects.get(id=conf.id)
                quote = stock.latest_quote()
                self.available -= quote.value * conf.quantity
                self.stocks.create(
                    stock=stock,
                    quantity=conf.quantity,
                    start=datetime.datetime.now() - datetime.timedelta(
                        days=31), )
            if self.available < 0:
                raise Exception("Not enough money available")
            self.save()

    def value_on(self, date=None):
        """
        The value of the bucket on a specific day
        """
        values = []
        for config in self.get_stock_configs(date):
            try:
                values.append(config.value_on(date))
            except Exception:  # pylint: disable=broad-except
                pass
        return sum(values) + self.available

    def historical(self, count=None, skip=None):
        """
        Fetches the historical value of the bucket.
        """
        res = []
        if count is None:
            count = 30
        if skip is None:
            skip = 0
        for i in range(skip, count + skip):
            date = datetime.datetime.now().date() - datetime.timedelta(days=i)
            res.append((date, self.value_on(date)))
        return res


class InvestmentBucketDescription(models.Model):
    """
    An investment bucket represents a collection of stocks to invest in
    """
    text = models.CharField(
        max_length=255,
        validators=[
            MinLengthValidator(
                3,
                message="The description should at least be 3 characters long."
            )
        ])
    bucket = models.ForeignKey(InvestmentBucket, related_name='description')
    is_good = models.BooleanField()

    class Meta(object):
        unique_together = ('text', 'bucket')

    def change_description(self, text):
        """
        Changes the description to the given text
        """
        self.text = text
        self.save()


class InvestmentStockConfiguration(models.Model):
    """
    Represents the configuration of how much of a stock to invest for a bucket
    """
    quantity = models.FloatField(validators=[
        MinValueValidator(0.0, message="The quantity can not be negative.")
    ])
    stock = models.ForeignKey(Stock, related_name='bucket')
    bucket = models.ForeignKey(InvestmentBucket, related_name='stocks')
    start = models.DateField(default=os_date.today, blank=True)
    end = models.DateField(null=True, blank=True)

    def value_on(self, date=None):
        """
        Returns the current value of the stock configuration
        """
        value = self.stock.latest_quote(date).value * self.quantity
        if math.isnan(value):
            raise Exception("Not able to calculate value")
        return value


@receiver(pre_save)
def pre_save_any(sender, instance, *_args, **_kwargs):
    """
    Ensures that all constrains are met
    """
    if sender.__name__ == 'Session':
        return
    try:
        instance.full_clean()
    except ValidationError as ex:
        raise Exception(ex.messages[0])

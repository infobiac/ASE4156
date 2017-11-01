"""
Models here represents any interaction between a user and stocks
"""
from authentication.models import Profile
from django.db import models
from django.core.validators import MinValueValidator
from stocks.models import DailyStockQuote, Stock, InvestmentBucket


class TradingAccount(models.Model):
    """
    A TradingAccount is owned by a user, we associate stock trades with it.
    """
    account_name = models.CharField(max_length=30)
    profile = models.ForeignKey(Profile, related_name='trading_accounts')

    class Meta(object):
        unique_together = ('profile', 'account_name')

    def __str__(self):
        return "{}, {}, {}".format(self.id, self.account_name, self.profile_id)


class TradeStock(models.Model):
    """
    A Trade represents a single exchange of a stock for money
    """
    timestamp = models.DateTimeField(auto_now_add=True)
    quantity = models.FloatField(
        validators=[MinValueValidator(
            0,
            message="Daily stock quote can not be negative"
        )]
    )
    account = models.ForeignKey(TradingAccount, related_name='trades')
    stock = models.ForeignKey(Stock, related_name='trades')

    def current_value(self):
        """
        Get value calculates the total value of the trade respecting the date
        """
        quote_value = (DailyStockQuote
                       .objects
                       .filter(stock_id=self.stock.id)
                       .filter(date__gt=self.timestamp)
                       .order_by('date')
                       .values_list('value', flat=True)
                       .all()[:1]
                       .get())
        return quote_value * self.quantity

    def stock_trade(self, stock, quantity):
        """
        Trades a stock for the account
        """
        return self.trades.create(
            quantity=quantity,
            stock=stock,
        )

    def __str__(self):
        return "{}, {}, {}, {}, {}".format(self.id,
                                           self.timestamp,
                                           self.quantity,
                                           self.account_id,
                                           self.stock_id)


class TradeBucket(models.Model):
    """
    Same as trade but for buckets
    """
    timestamp = models.DateTimeField(auto_now_add=True)
    account = models.ForeignKey(TradingAccount, related_name='buckettrades')
    stock = models.ForeignKey(InvestmentBucket, related_name='buckettrades')

"""
Models here represents any interaction between a user and stocks
"""
from authentication.models import Profile
from django.db import models
from stocks.models import Stock, InvestmentBucket


class TradingAccount(models.Model):
    """
    A TradingAccount is owned by a user, we associate stock trades with it.
    """
    account_name = models.CharField(max_length=30)
    profile = models.ForeignKey(Profile, related_name='trading_accounts')

    class Meta(object):
        unique_together = ('profile', 'account_name')

    def total_value(self):
        """
        Not yet implemented
        """
        pass

    def available_cash(self):
        """
        The available cash in that account
        """
        stock_val = sum([
            stock.current_value()
            for stock
            in self.trades.all()
        ])
        bucket_val = sum([
            bucket.current_value()
            for bucket
            in self.buckettrades.all()
        ])
        return stock_val + bucket_val

    def trade_bucket(self, bucket, quantity):
        """
        Creates a new trade for the bucket and this account
        """
        return self.buckettrades.create(
            stock=bucket,
            quantity=quantity,
        )

    def __str__(self):
        return "{}, {}, {}".format(self.id, self.account_name, self.profile_id)


class TradeStock(models.Model):
    """
    A Trade represents a single exchange of a stock for money
    """
    timestamp = models.DateTimeField(auto_now_add=True)
    quantity = models.FloatField()
    account = models.ForeignKey(TradingAccount, related_name='trades')
    stock = models.ForeignKey(Stock, related_name='trades')

    def current_value(self):
        """
        Get value calculates the total value of the trade respecting the date
        """
        quote_value = self.stock.latest_quote(self.timestamp).value
        return quote_value * (-1 * self.quantity)

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
    quantity = models.FloatField()

    def current_value(self):
        """
        The value of the trade on the specific date
        """
        val = self.stock.value_on(self.timestamp) * (-1 * self.quantity)
        return val

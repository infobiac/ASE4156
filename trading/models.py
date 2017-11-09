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

    def trading_balance(self):
        """
        The stock values from account
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

    @staticmethod
    def available_buckets(bkt):
        """
        Find the available buckets that have quantity > 0
        """
        bucket = TradeBucket.buckettrades.filter(bucket=bkt).annotate(
            sum_quantity=models.Sum('quantity'))
        if bucket:
            return bucket[0].sum_quantity
        return 0

    @staticmethod
    def available_stocks(stk):
        """
        Find available stock
        """
        stock = TradeStock.trades.filter(stock=stk).annotate(sum_quantity=models.Sum('quantity'))
        if stock:
            return stock[0].sum_quantity
        return 0

    def has_enough_cash(self, trade_value):
        """
        Check if you have enough cash to make a trade
        """
        if self.trading_balance() >= trade_value:
            return True
        return False

    def has_enough_bucket(self, bucket, quantity_bucket):
        """
        Check if you have enough bucket to make a trade
        """
        return self.available_buckets(bucket) > -1 * quantity_bucket

    def has_enough_stock(self, stock, quantity_stock):
        """
        Check if you have enough stock to trade
        """
        return self.available_stocks(stock) > -1 * quantity_stock

    def trade_bucket(self, bucket, quantity):
        """
        Creates a new trade for the bucket and this account
        """
        if self.has_enough_cash(bucket.value_on() * quantity) and (
                self.has_enough_bucket(bucket, quantity)):
            return self.buckettrades.create(
                stock=bucket,
                quantity=quantity,
            )
        raise Exception("You don't have the necessary resources!")

    def trade_stock(self, stock, quantity):
        """
        Trades a stock for the account
        """
        if self.has_enough_cash(stock.latest_quote() * quantity) and (
                self.has_enough_stock(stock, quantity)):
            return self.trades.create(
                quantity=quantity,
                stock=stock,
            )
        raise Exception("You don't have the necessary resources!")

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

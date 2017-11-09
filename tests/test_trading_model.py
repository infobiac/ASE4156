"""
Tests the models of the Trading app
"""
import random
import string
import pytest
from stocks.models import InvestmentBucket, Stock
from django.contrib.auth.models import User
from trading.models import TradingAccount, TradeStock
import test_stocks_model as stock_test


def setup_module(module):
    """
    Mock out any externals
    """
    stock_test.setup_module(module)


def teardown_module(module):
    """
    Restore externals
    """
    stock_test.teardown_module(module)


@pytest.mark.django_db(transaction=True)
def test_trading_available_buckets():
    """
    Testing TradingAccount.available_buckets()
    """
    user = User.objects.create(username='user1', password="a")
    bucket1 = InvestmentBucket(name='b1', public=False, available=1000, owner=user.profile)
    bucket2 = InvestmentBucket(name='b2', public=False, available=1000, owner=user.profile)
    bucket1.save()
    bucket2.save()
    acc = user.profile.trading_accounts.create(account_name="acc")
    assert acc.available_buckets(bucket1) == 0
    acc.buckettrades.create(quantity=2, stock=bucket1)
    assert acc.available_buckets(bucket1) == 2
    acc.buckettrades.create(quantity=4, stock=bucket1)
    assert acc.available_buckets(bucket2) == 0
    acc.buckettrades.create(quantity=3, stock=bucket2)
    assert acc.available_buckets(bucket1) == 6
    assert acc.available_buckets(bucket2) == 3


@pytest.mark.django_db(transaction=True)
def test_trading_trading_balance():
    """
    Testing available_cash for a Trading Account
    """
    pwd = ''.join(random.choices(string.ascii_uppercase + string.digits, k=9))
    user = User.objects.create(username='user', password=pwd)
    account = TradingAccount(profile=user.profile, account_name="testAccount")
    account.save()

    value_of_stock1 = 3
    stock1 = Stock.create_new_stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.daily_quote.create(
        value=value_of_stock1,
        date="2016-06-03"
    )

    value_of_stock2 = 4
    quantity2 = 3
    stock2 = Stock.create_new_stock(
        name="Name2X",
        ticker="TKF"
    )
    stock2.daily_quote.create(
        value=value_of_stock2,
        date="2016-06-03"
    )
    TradeStock(quantity=1, account=account, stock=stock1).save()

    value = account.trading_balance()
    assert value == -value_of_stock1

    TradeStock(quantity=quantity2, account=account, stock=stock2).save()
    value = account.trading_balance()
    assert value == -value_of_stock1 + -value_of_stock2 * quantity2

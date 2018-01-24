"""
Tests the models of the Trading app
"""
import random
import string
from unittest import mock
import pytest
from stocks.models import InvestmentBucket, Stock, InvestmentStockConfiguration
from stocks.models import InvestmentBucketDescription
from django.contrib.auth.models import User
from trading.models import TradingAccount, TradeStock, TradeBucket
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


@mock.patch.object(TradingAccount, 'available_cash', mock.MagicMock(return_value=5.0))
@pytest.mark.django_db(transaction=True)
def test_trading_acc_av_stk():
    """
    Test available stocks
    """
    user = user_helper()
    trading_account = user.profile.trading_accounts.create(
        account_name="spesh"
    )
    stock = Stock(name="sto", ticker="sto")
    stock.save()
    stock.daily_quote.create(
        value=4,
        date="2016-06-05"
    )
    assert trading_account.available_stocks(stock) == 0
    trading_account.trade_stock(stock, 1)
    assert trading_account.available_stocks(stock) == 1
    with pytest.raises(Exception):
        trading_account.trade_stock(stock, 2342342342342234)
    assert trading_account.available_stocks(stock) == 1
    with pytest.raises(Exception):
        trading_account.trade_stock(stock, -2342342342342234)
    assert trading_account.available_stocks(stock) == 1
    trading_account.trade_stock(stock, -1)
    assert trading_account.available_stocks(stock) == 0


@mock.patch.object(TradingAccount, 'available_cash', mock.MagicMock(return_value=5.0))
@pytest.mark.django_db(transaction=True)
def test_has_enough_bucket():
    """
    Test has enough bucket
    """
    user = user_helper()
    trading_account = user.profile.trading_accounts.create(
        account_name="spesh"
    )
    buff = InvestmentBucket(name="buffet", owner=user.profile, public=False, available=0.0)
    buff.save()
    assert trading_account.has_enough_bucket(buff, 1) is False
    trading_account.trade_bucket(buff, 1)
    assert trading_account.has_enough_bucket(buff, 1)
    assert trading_account.has_enough_bucket(buff, 2) is False
    trading_account.trade_bucket(buff, 1000)
    assert trading_account.has_enough_bucket(buff, 1001)
    assert trading_account.has_enough_bucket(buff, 1002) is False
    trading_account.trade_bucket(buff, -1000)
    assert trading_account.has_enough_bucket(buff, 1)
    assert trading_account.has_enough_bucket(buff, 2) is False
    trading_account.trade_bucket(buff, -1)
    assert trading_account.has_enough_bucket(buff, 1) is False


@pytest.mark.django_db(transaction=True)
def test_has_enough_stock():
    """
    Test has enough stock
    """
    user = user_helper()
    trading_account = user.profile.trading_accounts.create(
        account_name="spesh"
    )
    stock = Stock(name="sto", ticker="sto")
    stock.save()
    stock.daily_quote.create(
        value=0.0,
        date="2016-06-05"
    )
    assert trading_account.has_enough_stock(stock, 1) is False
    trading_account.trade_stock(stock, 1)
    assert trading_account.has_enough_stock(stock, 1)
    assert trading_account.has_enough_stock(stock, 2) is False
    trading_account.trade_stock(stock, 1000)
    assert trading_account.has_enough_stock(stock, 1001)
    assert trading_account.has_enough_stock(stock, 1002) is False
    trading_account.trade_stock(stock, -1000)
    assert trading_account.has_enough_stock(stock, 1)
    assert trading_account.has_enough_stock(stock, 2) is False
    trading_account.trade_stock(stock, -1)
    assert trading_account.has_enough_stock(stock, 1) is False


@mock.patch.object(TradingAccount, 'available_cash', mock.MagicMock(return_value=100.0))
@pytest.mark.django_db(transaction=True)
def test_trading_acc_trade_bucket():
    """
    Test trade bucket
    """
    user = user_helper()
    trading_account = user.profile.trading_accounts.create(
        account_name="spesh"
    )
    buffa = InvestmentBucket(name="buffeta", owner=user.profile, public=False, available=1.0)
    buffa.save()
    with pytest.raises(Exception):
        trading_account.trade_bucket(buffa, -2)
    trading_account.trade_bucket(buffa, 2)
    with pytest.raises(Exception):
        trading_account.trade_bucket(buffa, -3)
    assert trading_account.has_enough_bucket(buffa, 2)
    trading_account.trade_bucket(buffa, -2)
    assert trading_account.available_buckets(buffa) == 0


@mock.patch.object(TradingAccount, 'available_cash', mock.MagicMock(return_value=100.0))
@pytest.mark.django_db(transaction=True)
def test_trading_acc_trade_stock():
    """
    Test trade stock
    """
    user = user_helper()
    trading_account = user.profile.trading_accounts.create(
        account_name="spesh"
    )
    stock = Stock(name="sto", ticker='sto')
    stock.save()
    stock.daily_quote.create(
        value=4,
        date="2016-06-05"
    )
    with pytest.raises(Exception):
        trading_account.trade_stock(stock, -2)
    trading_account.trade_stock(stock, 2)
    with pytest.raises(Exception):
        trading_account.trade_stock(stock, -3)
    assert trading_account.has_enough_stock(stock, 2)
    trading_account.trade_stock(stock, -2)
    assert trading_account.available_stocks(stock) == 0


@pytest.mark.django_db(transaction=True)
def test_trading_available_buckets():
    """
    Testing TradingAccount.available_buckets()
    """
    user = user_helper()
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
    account = account_helper()

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


@pytest.mark.django_db(transaction=True)
def test_tradestock_current_value():
    """
    Tests TradeStock.current_value()
    """
    account = account_helper()

    value_of_stock1 = 3
    stock1 = Stock.create_new_stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.daily_quote.create(
        value=value_of_stock1,
        date="2016-06-03"
    )

    quantity = 3
    current_value = TradeStock(quantity=quantity, account=account, stock=stock1).current_value()
    assert current_value == -value_of_stock1 * quantity


@pytest.mark.django_db(transaction=True)
def test_tradebucket_current_value():
    """
    Tests TradeBucket.current_value()
    """
    account = account_helper()

    value_of_stock1 = 3
    stock1 = Stock.create_new_stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.daily_quote.create(
        value=value_of_stock1,
        date="2016-06-03"
    )

    invest_bucket = InvestmentBucket(
        name="Bucket Test",
        public=True,
        owner=account.profile,
        available=1
        )
    invest_bucket.save()
    InvestmentStockConfiguration(
        quantity=1,
        stock=stock1,
        bucket=invest_bucket,
        start="2016-07-11",
        end="2016-06-10",
    ).save()
    quantity = 4
    trade_bucket = TradeBucket(quantity=quantity, account=account, stock=invest_bucket)
    trade_bucket.save()
    assert trade_bucket.current_value() == -quantity


@pytest.mark.django_db(transaction=True)
def test_investmentbucket_value_on():
    """
    Tests InvestmentBucket.value_on()
    """
    user = user_helper()

    value_of_stock1 = 3
    stock = Stock.create_new_stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock.daily_quote.create(
        value=value_of_stock1,
        date="2016-06-03"
    )
    available = 3
    bucket = InvestmentBucket(
        name="Bucket Test",
        public=True,
        owner=user.profile,
        available=available
        )
    bucket.save()

    InvestmentStockConfiguration(
        quantity=1,
        stock=stock,
        bucket=bucket,
        start="2016-06-08",
        end="2016-06-10",
    ).save()

    assert bucket.value_on() == available
    assert bucket.value_on(date="2016-06-08") == available + value_of_stock1
    assert bucket.value_on(date="2016-07-19") == available


@pytest.mark.django_db(transaction=True)
def test_investmentbucket_descrip():
    """
    Tests InvestmentBucketDescription.change_description()
    """
    user = user_helper()

    value_of_stock1 = 3
    stock1 = Stock.create_new_stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.daily_quote.create(
        value=value_of_stock1,
        date="2016-06-03"
    )
    available = 3
    bucket = InvestmentBucket(
        name="Bucket Test",
        public=True,
        owner=user.profile,
        available=available
        )
    bucket.save()
    description = InvestmentBucketDescription(text="fladshjfdsa", is_good=True, bucket=bucket)
    description.save()
    description.change_description(text="changed")
    assert description.text == "changed"


@pytest.fixture
def user_helper():
    """
    Helper function for testing
    """
    pwd = ''.join(random.choices(string.ascii_uppercase + string.digits, k=9))
    user = User.objects.create(username='user', password=pwd)
    return user


@pytest.fixture
def account_helper():
    """
    Helper function for testing
    """
    pwd = ''.join(random.choices(string.ascii_uppercase + string.digits, k=9))
    user = User.objects.create(username='user', password=pwd)
    account = TradingAccount(profile=user.profile, account_name="testAccount")
    account.save()
    return account

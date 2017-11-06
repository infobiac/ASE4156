"""
Tests the models of the stock app
"""
from collections import namedtuple
import datetime
from unittest import mock, TestCase
import pytest
from stocks.historical import create_stock
from stocks.models import DailyStockQuote, InvestmentBucket, InvestmentStockConfiguration, Stock
from django.db.models.signals import post_save
from django.db.models import Sum
from django.contrib.auth.models import User
from yahoo_historical import Fetcher
from trading.models import TradeStock


def setup_module(module):
    """
    Mock out any externals
    """
    post_save.disconnect(receiver=create_stock, sender=Stock)
    module.original_init_method = Fetcher.__init__
    module.original_getHistorical_method = Fetcher.getHistorical
    Fetcher.__init__ = mock.Mock(return_value=None)
    Fetcher.getHistorical = mock.Mock(return_value=None)


def teardown_module(module):
    """
    Restore externals
    """
    Fetcher.__init__ = module.original_init_method
    Fetcher.getHistorical = module.original_getHistorical_method


@pytest.mark.django_db(transaction=True)
def test_stock_latest_quote():
    """
    Tests Stock.latest_quote()
    """
    stock = Stock(
        name="Name1",
        ticker="TKRC"
    )
    stock.save()
    correct_quote3 = stock.daily_quote.create(
        value=3,
        date="2016-06-03"
    )
    correct_quote1 = stock.daily_quote.create(
        value=4,
        date="2016-06-05"
    )
    correct_quote2 = stock.daily_quote.create(
        value=5,
        date="2016-06-06"
    )
    assert stock.latest_quote("2016-06-05") == correct_quote1
    assert stock.latest_quote() == correct_quote2
    assert stock.latest_quote("2016-06-04") == correct_quote3
    with pytest.raises(Exception):
        stock.latest_quote("2016-06-02")
    with pytest.raises(Exception):
        stock.latest_quote(datetime.datetime.now() + datetime.timedelta(days=3))


@pytest.mark.django_db(transaction=True)
def test_stock_find_stock():
    """
    Tests Stock.find_stock()
    """
    stock1 = Stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.save()
    stock2 = Stock(
        name="Name2Y",
        ticker="TKFF"
    )
    stock2.save()
    TestCase.assertCountEqual(None, [stock1, stock2], Stock.find_stock(""))
    TestCase.assertCountEqual(None, [stock1, stock2], Stock.find_stock("Name"))
    TestCase.assertCountEqual(None, [stock1], Stock.find_stock("Name1"))
    TestCase.assertCountEqual(None, [stock2], Stock.find_stock("e2"))


@pytest.mark.django_db(transaction=True)
def test_stock_create_new_stock():
    """
    Tests Stock.create_new_stock()
    """
    Stock.create_new_stock(ticker="ABC", name="DEF")
    with mock.patch.object(Fetcher, "__init__", side_effect=KeyError()):
        with pytest.raises(Exception):
            Stock.create_new_stock(ticker="ABC", name="DEF")


@pytest.mark.django_db(transaction=True)
def test_stock_quote_in_range():
    """
    Tests Stock.quote_in_range()
    """
    stock = Stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock.save()
    quote1 = stock.daily_quote.create(
        value=3,
        date="2016-06-03"
    )
    quote3 = stock.daily_quote.create(
        value=5,
        date="2016-06-06"
    )
    quote2 = stock.daily_quote.create(
        value=4,
        date="2016-06-05"
    )
    assert [quote1, quote2, quote3] == list(stock.quote_in_range())
    assert [
        quote1,
        quote2,
        quote3
    ] == list(stock.quote_in_range(start="2016-06-03", end="2016-06-06"))
    assert [] == list(stock.quote_in_range(start="2016-06-03", end="2016-06-02"))
    assert [quote1, quote2, quote3] == list(stock.quote_in_range(start="2016-06-03"))
    assert [quote2, quote3] == list(stock.quote_in_range(start="2016-06-04"))
    assert [quote1, quote2, quote3] == list(stock.quote_in_range(end="2016-06-06"))
    assert [quote1, quote2] == list(stock.quote_in_range(end="2016-06-05"))


@pytest.mark.django_db(transaction=True)
def test_stock_trades_for_profile():
    """
    Tests Stock.trades_for_profile()
    """
    user1 = User.objects.create(username='user1', password="a")
    user2 = User.objects.create(username='user2', password="a")
    t1_1 = user1.profile.trading_accounts.create(
        account_name="u1t1"
    )
    t1_2 = user1.profile.trading_accounts.create(
        account_name="u1t2"
    )
    t2_1 = user2.profile.trading_accounts.create(
        account_name="u2t"
    )
    stock = Stock.create_new_stock(
        name="Name1X",
        ticker="TKRC"
    )
    TradeStock(quantity=1, account=t1_1, stock=stock).save()
    TradeStock(quantity=1, account=t1_2, stock=stock).save()
    TradeStock(quantity=1, account=t2_1, stock=stock).save()
    assert stock.trades_for_profile(user1.profile).count() == 2
    assert stock.trades_for_profile(user2.profile).count() == 1


@pytest.mark.django_db(transaction=True)
def test_bucket_trades_for_profile():
    """
    Tests InvestmentBucket.trades_for_profile()
    """
    user1 = User.objects.create(username='user1', password="a")
    user2 = User.objects.create(username='user2', password="a")
    InvestmentBucket(name="B1", owner=user1.profile, public=False, available=1).save()
    InvestmentBucket(name="B2", owner=user1.profile, public=True, available=1).save()
    InvestmentBucket(name="B3", owner=user1.profile, public=False, available=1).save()
    InvestmentBucket(name="B4", owner=user2.profile, public=False, available=1).save()
    assert InvestmentBucket.accessible_buckets(user1.profile).count() == 3
    assert InvestmentBucket.accessible_buckets(user2.profile).count() == 2


@pytest.mark.django_db(transaction=True)
def test_bucket_create_new_bucket():
    """
    Tests InvestmentBucket.create_new_bucket()
    """
    user1 = User.objects.create(username='user1', password="a")
    user2 = User.objects.create(username='user2', password="a")
    assert user1.profile.owned_bucket.count() == 0
    InvestmentBucket.create_new_bucket(name="Bucket1", public=True, owner=user1.profile)
    InvestmentBucket.create_new_bucket(name="Bucket2", public=True, owner=user2.profile)
    assert user1.profile.owned_bucket.count() == 1


@pytest.mark.django_db(transaction=True)
def test_bucket_add_attribute():
    """
    Tests InvestmentBucket.add_attribute()
    """
    user1 = User.objects.create(username='user1', password="a")
    bucket = InvestmentBucket(name="Bucket1", public=True, owner=user1.profile, available=1)
    bucket.save()
    assert bucket.description.count() == 0
    bucket.add_attribute("Some text")
    assert bucket.description.count() == 1
    attr = bucket.description.get()
    assert attr.is_good
    assert attr.text == "Some text"
    bucket.add_attribute("Some more text", False)
    assert bucket.description.count() == 2
    assert bucket.description.filter(is_good=True).count() == 1
    assert bucket.description.filter(is_good=False).count() == 1


@pytest.mark.django_db(transaction=True)
def test_bucket_get_stock_configs():
    """
    Tests InvestmentBucket.get_stock_configs()
    """
    user1 = User.objects.create(username='user1', password="a")
    stock1 = Stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock2 = Stock(
        name="Name2X",
        ticker="TKRCF"
    )
    stock1.save()
    stock2.save()
    bucket = InvestmentBucket(name="Bucket1", public=True, owner=user1.profile, available=1)
    bucket.save()
    InvestmentStockConfiguration(
        quantity=1,
        stock=stock1,
        bucket=bucket,
        start="2016-06-06",
        end="2016-06-08",
    ).save()
    InvestmentStockConfiguration(quantity=1, stock=stock1, bucket=bucket, start="2016-06-08").save()
    InvestmentStockConfiguration(quantity=1, stock=stock2, bucket=bucket, start="2016-06-06").save()
    assert bucket.get_stock_configs().count() == 2
    assert bucket.get_stock_configs("2016-06-06").count() == 2
    assert bucket.get_stock_configs("2016-06-08").count() == 3


@pytest.mark.django_db(transaction=True)
def test_bucket_sell_all():
    """
    Tests InvestmentBucket._sell_all()
    """
    user1 = User.objects.create(username='user1', password="a")
    stock1 = Stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.save()
    DailyStockQuote(date="2016-06-10", value=100.0, stock=stock1).save()
    bucket = InvestmentBucket(name="Bucket1", public=True, owner=user1.profile, available=10)
    bucket.save()
    cfg1 = InvestmentStockConfiguration(
        quantity=1,
        stock=stock1,
        bucket=bucket,
        start="2016-06-06",
        end="2016-06-08",
    )
    cfg2 = InvestmentStockConfiguration(
        quantity=1,
        stock=stock1,
        bucket=bucket,
        start="2016-06-08",
    )
    cfg1.save()
    cfg2.save()
    # pylint: disable=protected-access
    bucket._sell_all()
    # pylint: enable=protected-access
    bucket.refresh_from_db()
    cfg1.refresh_from_db()
    cfg2.refresh_from_db()
    assert bucket.available == 110
    assert cfg1.end == datetime.date(2016, 6, 8)
    assert cfg2.end is not None


@pytest.mark.django_db(transaction=True)
def test_bucket_change_config():
    """
    Tests InvestmentBucket.change_config()
    """
    cfg_str = namedtuple("cfg_str", ["id", "quantity"])
    user1 = User.objects.create(username='user1', password="a")
    stock1 = Stock(
        name="Name1X",
        ticker="TKRC"
    )
    stock1.save()
    DailyStockQuote(date="2016-06-10", value=100.0, stock=stock1).save()
    bucket = InvestmentBucket(name="Bucket1", public=True, owner=user1.profile, available=10)
    bucket.save()
    cfg1 = InvestmentStockConfiguration(
        quantity=1,
        stock=stock1,
        bucket=bucket,
        start="2016-06-06",
        end="2016-06-08",
    )
    cfg2 = InvestmentStockConfiguration(
        quantity=1,
        stock=stock1,
        bucket=bucket,
        start="2016-06-08",
    )
    cfg1.save()
    cfg2.save()
    with pytest.raises(Exception):
        bucket.change_config([cfg_str(id=stock1.id, quantity=2)])
    bucket.available = 1000
    bucket.change_config([cfg_str(id=stock1.id, quantity=2)])
    bucket.refresh_from_db()
    assert bucket.available == 900
    assert bucket.stocks.filter(
        end=None
    ).values('stock_id').annotate(
        sum_q=Sum('quantity')
    ).get()['sum_q'] == 2

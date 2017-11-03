"""
Tests the models of the stock app
"""
import datetime
from unittest import mock, TestCase
import pytest
from stocks.historical import create_stock
from stocks.models import Stock
from django.db.models.signals import post_save
from yahoo_historical import Fetcher


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

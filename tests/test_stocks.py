"""This module is for testing stocks"""
from unittest import mock
from django.test import TestCase
from stocks.models import Stock, DailyStockQuote
import pandas as pd
from yahoo_historical import Fetcher
from authentication.plaid_middleware import PlaidMiddleware
import pytest


class StocksViewTests(TestCase):
    """
    Testing Stocks Model
    """
    @classmethod
    def setup_class(cls):
        """Setting up testing"""
        cls._original_init_method = Fetcher.__init__
        Fetcher.__init__ = mock.Mock(return_value=None)
        PlaidMiddleware.__call__ = lambda self, request: self.get_response(request)

    @classmethod
    def teardown_class(cls):
        """Teardown testing"""
        Fetcher.__init__ = cls._original_init_method

    @mock.patch.object(
        Fetcher,
        'getHistorical',
        mock.MagicMock(return_value=pd.DataFrame({
            'Close': [1.5, 2.5],
            'Date': ["2017-05-05", "2017-05-06"],
        }))
    )
    @pytest.mark.django_db(transaction=True)
    def test_api_for_real_stock(self):
        """
        Testing adding stock via endpoint, asserting stock is inserted
        """
        ticker = "googl"
        name = "Google"
        data = {'name': name, 'ticker': ticker}
        request = self.client.post('/stocks/addstock/', data, follow=True, secure=True)
        self.assertEqual(request.status_code, 200)
        data = Stock.objects.all()
        self.assertEqual(len(data), 1)

    @mock.patch.object(
        Fetcher,
        'getHistorical',
        mock.MagicMock(side_effect=KeyError('abc'))
    )
    def test_api_for_invalid_ticker(self):
        """
        Testing adding stock via endpoint, asserting stock is inserted but no
        data added to DailyStockQuote since ticker is invalid
        """
        ticker = "xxx"
        name = "Julian"
        data = {'name': name, 'ticker': ticker}
        # pylint: disable=broad-except
        req = self.client.post('/stocks/addstock/', data, follow=True, secure=True)
        # pylint: enable=broad-except
        self.assertEqual(req.status_code, 500)
        data = DailyStockQuote.objects.all()
        self.assertEqual(len(data), 0)

    def test_api_with_invalid_call(self):
        """
        Endpoint only works with POST
        """
        request = self.client.get('/stocks/addstock/', follow=True, secure=True)
        self.assertEqual(request.status_code, 405)

    @mock.patch.object(
        Fetcher,
        'getHistorical',
        mock.MagicMock(return_value=pd.DataFrame({
            'Close': [1.5, 2.5],
            'Date': ["2017-05-05", "2017-05-06"],
        }))
    )
    @pytest.mark.django_db(transaction=True)
    def test_fill_quote_history(self):
        """
        Filling data for Stock
        """
        ticker = "ibm"
        name = "IBM"
        data = {'name': name, 'ticker': ticker}
        request = self.client.post('/stocks/addstock/', data, follow=True, secure=True)
        stock_id = request.content
        data = DailyStockQuote.objects.filter(stock_id=stock_id)
        stock_data = Stock.objects.filter(id=stock_id)
        self.assertGreater(len(data), 0)
        self.assertEqual(len(stock_data), 1)

    def test_fill_invalid_call(self):
        """
        Endpoint only works with GET
        """
        request = self.client.post('/stocks/fill/', follow=True, secure=True)
        self.assertEqual(request.status_code, 405)

    @mock.patch.object(
        Fetcher,
        'getHistorical',
        mock.MagicMock(side_effect=[
            pd.DataFrame({
                'Close': [1.76, 2.51],
                'Date': ["2016-10-08", "2016-10-09"],
                }),
            pd.DataFrame({
                'Close': [2.51, 2.53],
                'Date': ["2016-10-09", "2016-10-10"],
                }),
            pd.DataFrame({
                'Close': [2.55, 2.58],
                'Date': ["2016-10-11", "2017-10-12"],
            })]))
    @pytest.mark.django_db(transaction=True)
    def test_fill_stock_data(self):
        """
        Filling data for stock
        """
        Stock(name="Facebook", ticker="FB").save()
        request = self.client.get('/stocks/fill/', follow=True, secure=True)
        self.assertEqual(request.status_code, 200)

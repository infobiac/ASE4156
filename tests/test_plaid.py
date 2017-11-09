'''
Tests Plaid
'''
import datetime
from unittest import mock
import pytest
import authentication.plaid_wrapper as PlaidMiddleware
import plaid
from plaid.api.accounts import Balance, Accounts
from plaid.api.transactions import Transactions
from django.test import TestCase


class PlaidTests(TestCase):
    '''
    Testing Paid Wrapper
    '''
    @classmethod
    def setup_class(cls):
        '''Setting up testing'''
        cls._original_init_method = plaid.__init__
        plaid.__init__ = mock.Mock(return_value=None)
        plaid.__call__ = lambda self, request: self.get_response(request)

    @classmethod
    def teardown_class(cls):
        '''Teardown testing'''
        plaid.__init__ = cls._original_init_method

    @mock.patch.object(
        Balance,
        'get',
        mock.MagicMock(return_value={
            'accounts': [
                {
                    'balances': {'available': 1},
                    'subtype': 'not credit card'
                    },
                {
                    'balances': {'available': 10},
                    'subtype': 'credit card'
                    }
                ]
            })
    )
    @pytest.mark.django_db(transaction=True)
    @staticmethod
    def test_current_balance():
        '''
        Testing PlaidMiddleware.PlaidAPI.current_balance()
        '''
        client = plaid.Client(client_id='', secret='', public_key='', environment='')
        user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
        balance = user.current_balance()
        assert balance == -9.0

    @mock.patch.object(
        Accounts,
        'get',
        mock.MagicMock(return_value={
            'accounts': [
                {
                    'name': 'Test Account',
                    },
                {
                    'name': 'Test Account 2',
                    }
                ]
            })
    )
    @pytest.mark.django_db(transaction=True)
    @staticmethod
    def test_account_name():
        '''
        Testing PlaidMiddleware.PlaidAPI.account_name()
        '''
        client = plaid.Client(client_id='', secret='', public_key='', environment='')
        user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
        account_name = user.account_name()
        assert account_name == 'Test Account'

    @mock.patch.object(
        Transactions,
        'get',
        mock.MagicMock(return_value={
            'transactions': [
                {
                    'date': datetime.datetime.now() - datetime.timedelta(days=10),
                    'amount': 100,
                    },
                {
                    'date': datetime.datetime.now() - datetime.timedelta(days=13),
                    'amount': 1000,
                    }
                ]
            })
    )
    @mock.patch.object(
        Balance,
        'get',
        mock.MagicMock(return_value={
            'accounts': [
                {
                    'balances': {'available': 1},
                    'subtype': 'not credit card'
                    },
                {
                    'balances': {'available': 10},
                    'subtype': 'credit card'
                    }
                ]
            })
    )
    @pytest.mark.django_db(transaction=True)
    @staticmethod
    def test_historical_data():
        '''
        Testing PlaidMiddleware.PlaidAPI.historical_data()
        '''
        client = plaid.Client(client_id='', secret='', public_key='', environment='')
        user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
        start_date = datetime.datetime.now() - datetime.timedelta(days=365)
        data = user.historical_data(start_date)

        end = datetime.datetime.now().strftime("%Y-%m-%d")
        mock_data = [
            (end, -9.0),
            (
                (datetime.datetime.now() - datetime.timedelta(days=10)).strftime("%Y-%m-%d"),
                -109.0
                ),
            (
                (datetime.datetime.now() - datetime.timedelta(days=13)).strftime("%Y-%m-%d"),
                -1109.0
                )
        ]

        assert len(data) == len(mock_data)
        assert data == mock_data

    @staticmethod
    def transactions_side(start_date, end_date):
        '''
        Helper function for mocking Transactions get
        '''
        start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.datetime.strptime(end_date, "%Y-%m-%d")
        data = [
            {
                'date': datetime.datetime.now() - datetime.timedelta(days=10),
                'amount': -150,
                },
            {
                'date': datetime.datetime.now() - datetime.timedelta(days=13),
                'amount': 1000,
                },
            {
                'date': datetime.datetime.now() - datetime.timedelta(days=13),
                'amount': 125,
                }
            ]

        data_filtered = list(
            filter(lambda x: x['date'] > start_date and x['date'] < end_date,
                   data))
        return {
            'transactions': data_filtered
            }

    @mock.patch.object(
        Transactions,
        'get',
        mock.MagicMock(side_effect=transactions_side)
    )
    @pytest.mark.django_db(transaction=True)
    @staticmethod
    def test_income():
        '''
        Testing PlaidMiddleware.PlaidAPI.income()
        '''
        client = plaid.Client(client_id='', secret='', public_key='', environment='')
        user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
        income = user.income()
        assert income == 1125.0
        income2 = user.income(days=13)
        assert income2 == 1125.0
        income3 = user.income(days=11)
        assert income3 == 0

    @mock.patch.object(
        Transactions,
        'get',
        mock.MagicMock(side_effect=transactions_side)
    )
    @pytest.mark.django_db(transaction=True)
    @staticmethod
    def test_expenditure():
        '''
        Testing PlaidMiddleware.PlaidAPI.expenditure()
        '''
        client = plaid.Client(client_id='', secret='', public_key='', environment='')
        user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
        income = user.expenditure()
        assert income == -150
        income2 = user.expenditure(days=5)
        assert income2 == 0.0

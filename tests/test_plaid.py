'''
Tests Plaid
'''
import datetime
from unittest import mock
import pytest
import authentication.plaid_wrapper as PlaidMiddleware
import plaid
from plaid.api.transactions import Transactions
from plaid_test_decorators import mock_plaid_balance, \
    mock_plaid_accounts, mock_plaid_transactions


def setup_module(cls):
    '''Setting up testing'''
    cls.original_init_method = plaid.__init__
    plaid.__init__ = mock.Mock(return_value=None)
    plaid.__call__ = lambda self, request: self.get_response(request)


def teardown_module(cls):
    '''Teardown testing'''
    plaid.__init__ = cls.original_init_method


@mock_plaid_balance
@pytest.mark.django_db(transaction=True)
def test_current_balance():
    '''
    Testing PlaidMiddleware.PlaidAPI.current_balance()
    '''
    client = plaid.Client(client_id='', secret='', public_key='', environment='')
    user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
    balance = user.current_balance()
    assert balance == -9.0
    user.balance = 10
    balance = user.current_balance()
    assert balance == 10


@mock_plaid_accounts
@pytest.mark.django_db(transaction=True)
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
                'date': (
                    datetime.datetime.now() - datetime.timedelta(days=10)
                ).strftime("%Y-%m-%d"),
                'amount': 100,
            },
            {
                'date': (
                    datetime.datetime.now() - datetime.timedelta(days=13)
                ).strftime("%Y-%m-%d"),
                'amount': 1000,
            }
        ]
    })
)
@mock_plaid_balance
@pytest.mark.django_db(transaction=True)
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
        ),
    ]

    assert len(data) == len(mock_data)
    assert data == mock_data


@mock_plaid_transactions
@pytest.mark.django_db(transaction=True)
def test_income():
    '''
    Testing PlaidMiddleware.PlaidAPI.income()
    '''
    client = plaid.Client(client_id='', secret='', public_key='', environment='')
    user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
    income = user.income()
    assert income == 1135.0
    income2 = user.income(days=13)
    assert income2 == 1125.0
    income3 = user.income(days=11)
    assert income3 == 0


@mock_plaid_transactions
@pytest.mark.django_db(transaction=True)
def test_expenditure():
    '''
    Testing PlaidMiddleware.PlaidAPI.expenditure()
    '''
    client = plaid.Client(client_id='', secret='', public_key='', environment='')
    user = PlaidMiddleware.PlaidAPI(access_token='', client=client)
    expenditure = user.expenditure()
    assert expenditure == -150
    expenditure2 = user.expenditure(days=5)
    assert expenditure2 == 0.0

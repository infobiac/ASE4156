"""
Decorators for tests involving plaid
"""
from unittest.mock import patch, MagicMock
import datetime
from plaid.api.accounts import Balance, Accounts
from plaid.api.transactions import Transactions


def mock_plaid_balance(func):
    """
    Decorator to mock plaid's balance retrieval
    """
    new_patch = patch.object(
        Balance,
        'get',
        MagicMock(return_value={
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
    return new_patch(func)


def mock_plaid_accounts(func):
    """
    Decorator to mock plaid's accounts retrieval
    """
    new_patch = patch.object(
        Accounts,
        'get',
        MagicMock(return_value={
            'accounts': [
                {
                    'name': 'Test Account',
                },
                {
                    'name': 'Test Account 2',
                },
            ]
        })
    )
    return new_patch(func)


def transactions_side(_, start_date, end_date):
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
        },
        {
            'date': datetime.datetime.now() - datetime.timedelta(days=20),
            'amount': 10,
        },
    ]

    data_filtered = list(
        filter(lambda x: x['date'] > start_date and x['date'] < end_date,
               data))
    return {
        'transactions': data_filtered
    }


def mock_plaid_transactions(func):
    """
    Decorator to mock plaid's transaction retrieval
    """
    new_patch = patch.object(
        Transactions,
        'get',
        MagicMock(side_effect=transactions_side)
    )
    return new_patch(func)

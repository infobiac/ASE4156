"""
Plaid API wrapper to provide convenience methods
"""
import datetime
import os
import plaid


class PlaidAPI(object):
    """
    Wrapper around the plaid API to establish convenience methods
    """
    PLAID_CLIENT_ID = os.environ.get('PLAID_CLIENT_ID')
    PLAID_SECRET = os.environ.get('PLAID_SECRET')
    PLAID_PUBLIC_KEY = os.environ.get('PLAID_PUBLIC_KEY')
    PLAID_ENV = (
        'sandbox'
        if os.environ.get('DEBUG') == "TRUE"
        or os.environ.get('TRAVIS_BRANCH') is not None
        else 'development')
    balance = None

    def __init__(self, access_token, client=None):
        if client is None:
            self.plaid = PlaidAPI.client()
        else:
            self.plaid = client
        self.access_token = access_token

    @staticmethod
    def client():
        """
        Creates a new plaid client
        """
        return plaid.Client(
            client_id=PlaidAPI.PLAID_CLIENT_ID,
            secret=PlaidAPI.PLAID_SECRET,
            public_key=PlaidAPI.PLAID_PUBLIC_KEY,
            environment=PlaidAPI.PLAID_ENV,
        )

    def current_balance(self):
        """
        Returns the current numerical balance of the user
        """
        if self.balance:
            return self.balance
        balances = self.plaid.Accounts.balance.get(self.access_token)['accounts']
        extracted_balances = [((b['balances']['available']
                                if b['balances']['available'] is not None else
                                b['balances']['current']) *
                               (1
                                if b['subtype'] != 'credit card' else -1))
                              for b in balances]
        balance = sum(extracted_balances)
        self.balance = float(balance)
        return self.balance

    def account_name(self):
        """
        The name of the account that the user hass
        """
        return self.plaid.Accounts.get(self.access_token)['accounts'][0]['name']

    def historical_data(self, start):
        """
        Returns a list of tuples that show the balance a user had at the given point in time
        """
        end = datetime.datetime.now().strftime("%Y-%m-%d")
        response = self.plaid.Transactions.get(
            self.access_token,
            start_date=start,
            end_date=end
        )
        transactions = response['transactions']
        value = self.current_balance()
        value_list = [(end, value)]
        for transaction in transactions:
            value = value - transaction['amount']
            if not value_list[-1][0] == transaction['date']:
                value_list.append((transaction['date'], value))
        return value_list

    def income(self, days=30):
        """
        Calculates the income a user has per month
        """
        start = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
        end = datetime.datetime.now().strftime("%Y-%m-%d")
        response = self.plaid.Transactions.get(
            self.access_token,
            start_date=start,
            end_date=end,
        )
        transactions = response['transactions']
        plus = sum(filter(lambda x: x > 0, [tx['amount'] for tx in transactions]))
        return float(plus)

    def expenditure(self, days=30):
        """
        Calculates the expenses a user has in a given timespan
        """
        start = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
        end = datetime.datetime.now().strftime("%Y-%m-%d")
        response = self.plaid.Transactions.get(
            self.access_token,
            start_date=start,
            end_date=end,
        )
        transactions = response['transactions']
        plus = sum(filter(lambda x: x < 0, [tx['amount'] for tx in transactions]))
        return float(plus)

"""
Plaid setup
"""
import datetime
import os
from django.utils.deprecation import MiddlewareMixin
import plaid

PLAID_CLIENT_ID = os.environ.get('PLAID_CLIENT_ID')
PLAID_SECRET = os.environ.get('PLAID_SECRET')
PLAID_PUBLIC_KEY = os.environ.get('PLAID_PUBLIC_KEY')
PLAID_ENV = (
    'sandbox'
    if os.environ.get('DEBUG') == "TRUE"
    or os.environ.get('TRAVIS_BRANCH') is not None
    else 'development')


class PlaidAPI(object):
    """
    Wrapper around the plaid API to establish convenience methods
    """
    def __init__(self, client, access_token):
        self.plaid = client
        self.access_token = access_token

    def current_balance(self):
        """
        Returns the current numerical balance of the user
        """
        balances = self.plaid.Accounts.balance.get(self.access_token)['accounts']
        extracted_balances = [((b['balances']['available']
                                if b['balances']['available'] is not None else
                                b['balances']['current']) *
                               (1
                                if b['subtype'] != 'credit card' else -1))
                              for b in balances]
        balance = sum(extracted_balances)
        return float(balance)

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


# pylint: disable=too-few-public-methods
class PlaidMiddleware(MiddlewareMixin):
    """
    Simple Middleware to inject plaid client into request object
    """
    def __init__(self, get_response):
        super(PlaidMiddleware, self).__init__(get_response)
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated():
            bnk = request.user.userbank.all()[:1]
            if bnk:
                request.plaid = PlaidAPI(
                    client=plaid.Client(
                        client_id=PLAID_CLIENT_ID,
                        secret=PLAID_SECRET,
                        public_key=PLAID_PUBLIC_KEY,
                        environment=PLAID_ENV
                    ),
                    access_token=bnk[0].access_token,
                )
        response = self.get_response(request)
        return response
# pylint: enable=too-few-public-methods

"""
All selenium tests
"""
import datetime
import pytest
from django.contrib.auth.models import User
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from BuyBitcoin.urls import EXECUTOR
from authentication.plaid_middleware import PlaidMiddleware


# pylint: disable=missing-docstring
# pylint: disable=no-self-use
# pylint: disable=too-few-public-methods
class TokenMock(object):
    def exchange(self, _token):
        return {
            'access_token': '123',
            'item_id': '3',
        }


class ItemMock(object):

    public_token = TokenMock()

    def get(self, _item):
        return {
            'item': {
                'institution_id': '7'
            }
        }


class PlaidMock(object):
    Item = ItemMock()

    def current_balance(self):
        return 100.0

    def account_name(self):
        return "Account"

    def historical_data(self, *_args, **_kwargs):
        return [
            (datetime.datetime.now() - datetime.timedelta(days=7), 200.0),
            (datetime.datetime.now(), 100.0),
        ]

    def income(self, *_args, **_kwargs):
        return 0.0

    def expenditure(self, *_args, **_kwargs):
        return 0.0


def plaid_mock(self, request):
    request.plaid = PlaidMock()
    response = self.get_response(request)
    return response


def setup_module(module):
    module.plaid = PlaidMiddleware.__call__
    PlaidMiddleware.__call__ = plaid_mock


def teardown_module(module):
    PlaidMiddleware.__call__ = module.plaid
# pylint: enable=missing-docstring
# pylint: enable=no-self-use
# pylint: enable=too-few-public-methods


@pytest.mark.django_db(transaction=True)
def test_signup(selenium, live_server, client):
    """
    Tests the signup flow
    """
    user = User.objects.create_user('temporary', 'temporary@gmail.com', 'temporary')
    user.save()
    client.login(username='temporary', password='temporary')
    cookie = client.cookies['sessionid']
    selenium.get('%s%s' % (live_server, '/login'))
    selenium.add_cookie({
        'name': 'sessionid',
        'value': cookie.value,
        'secure': False,
        'path': '/',
    })
    selenium.get('%s%s' % (live_server, '/home'))
    selenium.implicitly_wait(30)
    test = selenium.find_element_by_id('link-button')
    test.click()
    selenium.switch_to.frame(selenium.find_element_by_id("plaid-link-iframe-1"))
    chase = selenium.find_element_by_class_name("Logo--chase")
    chase.click()
    selenium.find_element_by_id("username").send_keys("user_good")
    selenium.find_element_by_id("password").send_keys("pass_good")
    selenium.find_element_by_id("password").submit()
    elem = selenium.find_element_by_xpath("//button[contains(.,'Continue')]")
    WebDriverWait(selenium, 30).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Continue')]"))
    )
    elem.click()
    selenium.switch_to.default_content()
    WebDriverWait(selenium, 120).until(
        EC.presence_of_element_located((By.ID, "logout"))
    )
    assert selenium.current_url == '%s%s' % (live_server, '/home')
    EXECUTOR.wait_until_finished()
    live_server.thread.terminate()
    live_server.thread.join()

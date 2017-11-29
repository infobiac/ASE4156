"""
All selenium tests
"""
from unittest import mock
import pytest
from django.contrib.auth.models import User
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from BuyBitcoin.urls import EXECUTOR
from authentication.plaid_wrapper import PlaidAPI


@mock.patch.object(PlaidAPI, 'current_balance', mock.MagicMock(return_value=0.0))
@mock.patch.object(PlaidAPI, 'account_name', mock.MagicMock(return_value="Acc Name"))
@mock.patch.object(PlaidAPI, 'income', mock.MagicMock(return_value=0.0))
@mock.patch.object(PlaidAPI, 'expenditure', mock.MagicMock(return_value=0.0))
@mock.patch.object(PlaidAPI, 'historical_data', mock.MagicMock(return_value=None))
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
    selenium.get('%s%s' % (live_server, '/'))
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
    selenium.find_element_by_id("menu-appbar-button").click()
    WebDriverWait(selenium, 120).until(
        EC.presence_of_element_located((By.ID, "logout"))
    )
    assert selenium.current_url == '%s%s' % (live_server, '/home')
    EXECUTOR.wait_until_finished()
    live_server.thread.terminate()
    live_server.thread.join()

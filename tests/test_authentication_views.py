"""
Tests for the authentication views
"""
import pytest
from django.test import Client
from django.contrib.auth.models import User
from authentication.models import UserBank


@pytest.mark.django_db(transaction=True)
def test_logout():
    """
    Test logout redirect
    """
    test_client = Client()
    logout_test = test_client.get("/logout")
    response_code = logout_test.status_code
    assert response_code == 302
    url = logout_test.url
    assert url == "/login"


@pytest.mark.django_db(transaction=True)
def test_setup_bank():
    """
    Test bank setup page
    """
    test_client = Client()
    user1 = User.objects.create(username='user', password="a")
    test_client.force_login(user1)
    not_set_up = test_client.get("/setup_bank")
    response_code_1 = not_set_up.status_code
    assert response_code_1 == 200
    userbank = UserBank(
        user=user1, item_id="hi",
        access_token="Bye", institution_name="bankofcool",
        current_balance_field=10, account_name_field="coolaccount",
        income_field=30, expenditure_field=5
    )
    userbank.save()
    set_up = test_client.get("/setup_bank")
    response_code_2 = set_up.status_code
    assert response_code_2 == 302
    url = set_up.url
    assert url == "/home"


@pytest.mark.django_db(transaction=True)
def test_access_token():
    """
    Test access token url
    """
    test_client = Client()
    user1 = User.objects.create(username='user', password="a")
    test_client.force_login(user1)
    false_get = test_client.get("/plaid/get_access_token/")
    response_code = false_get.status_code
    assert response_code == 403


@pytest.mark.django_db(transaction=True)
def test_get_reauth():
    """
    Test reauthentication procedure
    """
    test_client = Client()
    user1 = User.objects.create(username='user', password="a")
    test_client.force_login(user1)
    check_none = test_client.get("/plaid/get_reauth/")
    assert check_none.status_code == 302
    url = check_none.url
    assert url == "/setup_bank"
    userbank = UserBank(
        user=user1, item_id="hi",
        access_token="access-sandbox-188618e4-e6a6-45ea-a117-a97b2f717478",
        institution_name="bankofcool", current_balance_field=10,
        account_name_field="coolaccount",
        income_field=30, expenditure_field=5
    )
    userbank.save()
    check_success = test_client.get("/plaid/get_reauth/")
    assert check_success.status_code == 200


@pytest.mark.django_db(transaction=True)
def test_delete_account():
    """
    Test the JPMorgan demo account delete mechanism
    """
    test_client = Client()
    user1 = User.objects.create(username='user', password="a")
    test_client.force_login(user1)
    userbank = UserBank(
        user=user1, item_id="hi",
        access_token="Bye", institution_name="bankofcool",
        current_balance_field=10, account_name_field="coolaccount",
        income_field=30, expenditure_field=5
    )
    userbank.save()
    check_success = test_client.get("/delete/")
    assert check_success.status_code == 200

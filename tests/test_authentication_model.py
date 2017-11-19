"""
Tests for authentication models
"""
import pytest
from django.contrib.auth.models import User
from authentication.models import UserBank
from test_plaid import setup_module as setup_plaid, \
    teardown_module as teardown_plaid
from plaid_test_decorators import mock_plaid_balance, \
    mock_plaid_accounts, mock_plaid_transactions


def setup_module(cls):
    '''Setting up testing'''
    setup_plaid(cls)


def teardown_module(cls):
    '''Teardown testing'''
    teardown_plaid(cls)


@pytest.mark.django_db(transaction=True)
def test_profile_default_acc():
    """
    Test default account on profile
    """
    user1 = User.objects.create(username='user1', password="a")
    acct1 = user1.profile.default_acc()
    assert acct1.account_name == 'default'
    user2 = User.objects.create(username='user2', password="a")
    user2.profile.trading_accounts.create(
        account_name="account2"
    )
    acct2 = user2.profile.default_acc()
    assert acct2.account_name == "account2"


@mock_plaid_balance
@pytest.mark.django_db(transaction=True)
def test_user_bank_current_balance():
    """
    Test current balance updates
    """
    user1 = User.objects.create(username='user1', password="a")
    ub1 = UserBank(
        user=user1, item_id="hi", access_token="Bye",
        institution_name="bankofcool", current_balance_field=10,
        account_name_field="coolaccount", income_field=30,
        expenditure_field=5
    )
    ub1.save()
    assert ub1.current_balance(False) == 10
    assert ub1.current_balance() == -9.0


@mock_plaid_accounts
@pytest.mark.django_db(transaction=True)
def test_user_bank_account_name():
    """
    Test account name updates
    """
    user1 = User.objects.create(username='user1', password="a")
    ub1 = UserBank(
        user=user1, item_id="hi", access_token="Bye",
        institution_name="bankofcool", current_balance_field=10,
        account_name_field="coolaccount", income_field=30,
        expenditure_field=5
    )
    ub1.save()
    assert ub1.account_name(False) == "coolaccount"
    assert ub1.account_name() == "Test Account"


@mock_plaid_transactions
@pytest.mark.django_db(transaction=True)
def test_user_bank_income():
    """
    Test income updates
    """
    user1 = User.objects.create(username='user1', password="a")
    ub1 = UserBank(
        user=user1, item_id="hi", access_token="Bye",
        institution_name="bankofcool", current_balance_field=10,
        account_name_field="coolaccount", income_field=30,
        expenditure_field=5
    )
    ub1.save()
    assert ub1.income(update=False) == 30
    assert ub1.income(days=13) == 1125.0


@mock_plaid_transactions
@pytest.mark.django_db(transaction=True)
def test_expenditures():
    """
    Test expenditures updates
    """
    user1 = User.objects.create(username='user1', password="a")
    ub1 = UserBank(
        user=user1, item_id="hi", access_token="Bye",
        institution_name="bankofcool", current_balance_field=10,
        account_name_field="coolaccount", income_field=30,
        expenditure_field=-5
    )
    ub1.save()
    assert ub1.expenditure(update=False) == -5
    assert ub1.expenditure() == -150

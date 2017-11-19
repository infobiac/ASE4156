"""
Test the app configs for each app
"""
import pytest
from django.apps import apps
from stocks.apps import StocksConfig


@pytest.mark.django_db(transaction=True)
def test_stocks_apps_config():
    """
    Test config for stocks app
    """
    assert StocksConfig.name == 'stocks'
    assert apps.get_app_config('stocks').name == 'stocks'

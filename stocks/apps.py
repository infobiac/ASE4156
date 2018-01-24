"""
Definition of the app itself
Stocks is anything directly related to stocks, e.g. stock and its value
"""

from django.apps import AppConfig


class StocksConfig(AppConfig):
    """
    Standard config
    """
    name = 'stocks'

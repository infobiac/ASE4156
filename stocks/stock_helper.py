"""
A couple helper functions that help us get real data backing for stocks
"""
from yahoo_historical import Fetcher
import arrow


def get_date_array_for_fetcher(arrow_date):
    """Function that formats arrow date to Yahoo Fetcher format """
    return [arrow_date.year, arrow_date.month, arrow_date.day]


def validate_ticker(ticker):
    """Function that validates ticker from yahoo_historical api"""
    now = arrow.now()
    now = get_date_array_for_fetcher(now)
    try:
        fetcher = Fetcher(ticker, now, now)
        fetcher.getHistorical()
    except KeyError:
        return False
    return True

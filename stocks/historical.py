"""This module is for loading historical data for stocks"""
import threading
from yahoo_historical import Fetcher
import arrow
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Max
from django.http import HttpResponse
from .models import Stock, DailyStockQuote
from .stock_helper import get_date_array_for_fetcher


def fill_quote_history(stock):
    """
    Given a stock, it fills in the last 10 years of historical data
    """
    now = arrow.now()
    ten_back = now.replace(years=-10)
    now = get_date_array_for_fetcher(now)
    ten_back = get_date_array_for_fetcher(ten_back)
    fetcher = Fetcher(stock.ticker, ten_back, now)
    history = fetcher.getHistorical()
    save_stock_quote_from_fetcher(history, stock.id)


def data_ten_years_back_for_stock(request):
    """ Function that creates Stock object
        and loads data for it 10 years back
    """
    if request.method == "POST":
        body = request.POST
        name = body['name']
        ticker = body['ticker']
        # pylint: disable=broad-except
        try:
            stock = Stock.create_new_stock(ticker, name)
        except Exception:
            msg = "500 Internal Server Error, stock doesnt exist"
            return HttpResponse(msg, status=500)
        return HttpResponse(stock.id, status=200)
        # pylint: enable=broad-except
    return HttpResponse("405 Method Not Allowed", status=405)


@receiver(post_save, sender=Stock)
def create_stock(instance, created, **_):
    """
    Queries stock quotes when stock is created
    """
    if created:
        fill_quote_history(instance)


def fill_stocks(request):
    """Function that fills stock data for missing days via GET"""
    if request.method == "GET":
        thread = threading.Thread(target=fill)
        thread.start()
        return HttpResponse("Filling Data...", status=200)
    return HttpResponse("405 Method Not Allowed", status=405)


def fill():
    """Function that fills stock data for missing days"""
    stock_id_field = 'stock_id'
    stock_ticker = 'stock__ticker'
    date = 'date'
    now = arrow.now()
    data = DailyStockQuote.objects.values(stock_ticker, stock_id_field).annotate(date=Max(date))
    for stock in data:
        last_date = arrow.get(stock[date]).replace(days=+1)
        last_date = get_date_array_for_fetcher(last_date)
        now_fetcher = get_date_array_for_fetcher(now)
        ticker = stock[stock_ticker]
        stock_id = stock[stock_id_field]
        fetcher = Fetcher(ticker, last_date, now_fetcher)
        history = fetcher.getHistorical()
        save_stock_quote_from_fetcher(history, stock_id)


def save_stock_quote_from_fetcher(fetcher_history, stock_id):
    """Function that saves DailyStockQuote from yahoo_historical fetcher"""
    objects = []
    for row in fetcher_history.itertuples():
        value = getattr(row, "Close")
        date = getattr(row, "Date")
        objects.append(
            DailyStockQuote(value=value, date=date, stock_id=stock_id))
    DailyStockQuote.objects.bulk_create(objects, batch_size=500)

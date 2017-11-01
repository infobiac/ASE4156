"""
Views for trading
"""
from django.shortcuts import render
from stocks.models import InvestmentBucket


def test(request):
    """
    Dev method for buckets
    """
    investments = InvestmentBucket.objects.all()
    templist = []
    for investment in investments:
        templist.append(investment.get_stock_configs().all())
    return render(request, 'test.html', templist)

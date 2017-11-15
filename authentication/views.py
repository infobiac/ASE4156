"""
Views for authentication. Basically supports login/logout.
"""
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth import logout as log_out
from django.contrib.auth.decorators import login_required
from authentication.plaid_wrapper import PlaidAPI


def login(request):
    """
    Dummy function to render login page
    """
    return render(request, 'auth.html')


def logout(request):
    """
    Function to logout
    """

    log_out(request)
    return HttpResponseRedirect("/login")


@login_required
def setup_bank(request):
    """
    Function to serve bank setup page
    """
    if not request.user.userbank.exists():
        return render(request, "setup_bank.html", {})
    return HttpResponseRedirect('/home')


@login_required
def get_access_token(request):
    """
    Function to retrieve plaid access token
    """
    if request.method == "POST":
        client = PlaidAPI.client()
        public_token = request.POST.get('public_token')
        exchange_response = client.Item.public_token.exchange(public_token)
        plaidrequest = client.Item.get(exchange_response['access_token'])
        plaid = PlaidAPI(exchange_response['access_token'])
        request.user.userbank.create(
            item_id=exchange_response['item_id'],
            access_token=exchange_response['access_token'],
            institution_name=plaidrequest['item']['institution_id'],
            current_balance_field=plaid.current_balance(),
            account_name_field=plaid.account_name(),
            income_field=plaid.income(),
            expenditure_field=plaid.expenditure(),
        )
        return HttpResponse(status=201)
    return HttpResponse("Please don't sniff urls")

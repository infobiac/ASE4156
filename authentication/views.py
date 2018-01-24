"""
Views for authentication. Basically supports login/logout.
"""
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth import logout as log_out
from django.contrib.auth.decorators import login_required
from authentication.plaid_wrapper import PlaidAPI


def idx(_request):
    """
    Redirect / to home
    """
    return HttpResponseRedirect('/home')


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
    return HttpResponse(status=403)


@login_required
def get_reauth(request):
    """
    Reauthenticates user if plaid detects change in user bank account info
    """
    client = PlaidAPI.client()
    ubank = request.user.userbank.first()
    if ubank is None:
        return HttpResponseRedirect("/setup_bank")
    access_token = ubank.access_token
    get_pub = client.Item.public_token.create(access_token)
    public_token = get_pub["public_token"]
    cntxt = {"public_token": public_token}
    return render(request, "reauth.html", cntxt)


@login_required
def delete_account(request):
    """
    A method used during JPMorgan demo that allows us to delete/recreate accounts
    on the fly
    """
    ubanks = request.user.userbank.all()
    for ubank in ubanks:
        ubank.delete()
    user = request.user
    log_out(request)
    user.delete()
    return HttpResponse("Account succesfully deleted")

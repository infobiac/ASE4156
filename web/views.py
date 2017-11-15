"""
Serves web pages
"""
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect


@login_required
def home(request):
    """
    Serves the home page
    """
    if not request.user.userbank.exists():
        return HttpResponseRedirect('/setup_bank')
    return render(request, "home.html", {})

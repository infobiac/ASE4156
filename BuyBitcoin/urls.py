"""BuyBitcoin URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from graphql.execution.executors.thread import ThreadExecutor
import graphene_django.views
import authentication.views
import web.views
import stocks.historical

EXECUTOR = ThreadExecutor()
# pylint: disable=invalid-name
urlpatterns = [
    url(r'^/?$', authentication.views.idx),
    url(r'^login$', authentication.views.login),
    url(r'^logout$', authentication.views.logout),
    url(r'^admin/', admin.site.urls),
    url('', include('social_django.urls', namespace='social')),
    url(r'^home/?.*$', web.views.home),
    url(r'^graphql', graphene_django.views.GraphQLView.as_view(
        graphiql=True,
        executor=EXECUTOR,
    )),
    url(r'^stocks/addstock/', stocks.historical.data_ten_years_back_for_stock),
    url(r'^stocks/fill/', stocks.historical.fill_stocks),
    url(r'^setup_bank$', authentication.views.setup_bank),
    url(r'^plaid/get_access_token/$', authentication.views.get_access_token),
    url(r'^plaid/get_reauth/$', authentication.views.get_reauth),
]
# pylint: enable=invalid-name

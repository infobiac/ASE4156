"""
Models keeps track of all the persistent data around the user profile
"""
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from authentication.plaid_wrapper import PlaidAPI


class Profile(models.Model):
    """
    Profile is an extension of :py:class:`django.contrib.auth.models.User`, that
    allows us to store additional values per User.
    """
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile')

    def default_acc(self):
        """
        This method retrieves the default account for the profile. If none exists,
        a new one will be created with the name 'default'.

        :returns: The default :py:class:`trading.models.TradingAccount`.
        """
        acc = self.trading_accounts.all()[:1]
        if not acc:
            acc = self.trading_accounts.create(account_name='default')
        else:
            acc = acc[0]
        return acc


@receiver(post_save, sender=User)
def create_user_profile(instance, created, **_):
    """
    This method will be called every time a :py:class:`django.contrib.auth.models.User`
    is saved. It will create a :py:class:`authentication.models.Profile` to associate
    with the user.

    :param instance: The User instance that was saved.
    :type instance: :py:class:`django.contrib.auth.models.User`
    :param created: True if the instance was just created.
    :param type: bool
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(instance, **_):
    """
    This method ensures that the :py:class:`authentication.models.Profile` is kept
    in sync with the User (:py:class:`django.contrib.auth.models.User`)

    :param instance: The User instance that was saved.
    :type instance: :py:class:`django.contrib.auth.models.User`
    """
    instance.profile.save()


class UserBank(models.Model):
    """
    The UserBank wraps a connection to Plaid. It stores the access token for the User.
    At the same time it also caches past queries to reduce initial load time.
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='userbank')
    item_id = models.CharField(max_length=1000)
    access_token = models.CharField(max_length=1000)
    institution_name = models.CharField(max_length=1000)
    current_balance_field = models.FloatField()
    account_name_field = models.CharField(max_length=1000)
    income_field = models.FloatField()
    expenditure_field = models.FloatField()

    def plaid(self):
        """
        This method instanciates a new `authentication.plaid_wrapper.PlaidAPI` with
        the stored access token.

        :returns: `authentication.plaid_wrapper.PlaidAPI` for the User.
        """
        return PlaidAPI(self.access_token)

    def historical_data(self, *args, **kwargs):
        """
        Fetches the historical data
        (see :py:meth:`authentication.plaid_wrapper.PlaidAPI.historical_data`)

        :returns: list of tuples for the historical data.
        """
        return self.plaid().historical_data(*args, **kwargs)

    def current_balance(self, update=True):
        """
        Returns the latest balance for the bank account. If update is set, then
        the balance will be synced with the original bank account.

        :param update: Whether to sync with the remote bank account.
        :type update: bool
        :returns: float of the current balance for the account
        """
        if update:
            self.current_balance_field = self.plaid().current_balance()
            self.save()
        return self.current_balance_field

    def account_name(self, update=True):
        """
        Returns the account name
        """
        if update:
            self.account_name_field = self.plaid().account_name()
            self.save()
        return self.account_name_field

    def income(self, days=30, update=True):
        """
        Returns the income in the given timespan
        """
        inc = self.income_field
        if update or days != 30:
            inc = self.plaid().income(days=days)
            if days == 30:
                self.income_field = inc
                self.save()
        return inc

    def expenditure(self, days=30, update=True):
        """
        Returns the expenditures in the given timespan
        """
        exp = self.expenditure_field
        if update or days != 30:
            exp = self.plaid().expenditure(days=days)
            if days == 30:
                self.expenditure_field = exp
                self.save()
        return exp

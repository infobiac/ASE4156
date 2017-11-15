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
    Profile represents additional values for a user account
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    def default_acc(self):
        """
        Returns the default account for the profile
        """
        acc = self.trading_accounts.all()[:1]
        if not acc:
            acc = self.trading_accounts.create(
                account_name='default'
            )
        else:
            acc = acc[0]
        return acc


@receiver(post_save, sender=User)
def create_user_profile(instance, created, **_):
    """
    Creates a linked profile when a user account is created
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(instance, **_):
    """
    To be safe, whenever the user profile is saved, we also save the profile
    """
    instance.profile.save()


class UserBank(models.Model):
    """
    Contains all the user's bank access data (via plaid)
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='userbank'
    )
    item_id = models.CharField(max_length=1000)
    access_token = models.CharField(max_length=1000)
    institution_name = models.CharField(max_length=1000)
    current_balance_field = models.FloatField()
    account_name_field = models.CharField(max_length=1000)
    income_field = models.FloatField()
    expenditure_field = models.FloatField()

    def plaid(self):
        """
        Returns a new Plaid client
        """
        return PlaidAPI(self.access_token)

    def historical_data(self, *args, **kwargs):
        """
        Returns the historical data
        """
        return self.plaid().historical_data(*args, **kwargs)

    def current_balance(self, update=False):
        """
        Returns the current balance
        """
        if update:
            self.current_balance_field = self.plaid().current_balance()
            self.save()
        return self.current_balance_field

    def account_name(self, update=False):
        """
        Returns the account name
        """
        if update:
            self.account_name_field = self.plaid().account_name()
            self.save()
        return self.account_name_field

    def income(self, days=30, update=False):
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

    def expenditure(self, days=30, update=False):
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

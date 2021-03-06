# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-11-09 13:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0005_auto_20171011_1314'),
    ]

    operations = [
        migrations.AddField(
            model_name='userbank',
            name='account_name_field',
            field=models.CharField(default='Dummy account name', max_length=1000),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='userbank',
            name='current_balance_field',
            field=models.FloatField(default=0.0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='userbank',
            name='expenditure_field',
            field=models.FloatField(default=0.0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='userbank',
            name='income_field',
            field=models.FloatField(default=0.0),
            preserve_default=False,
        ),
    ]

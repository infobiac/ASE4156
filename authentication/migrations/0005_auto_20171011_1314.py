# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-11 13:14
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0004_userbank_institution_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userbank',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userbank', to=settings.AUTH_USER_MODEL),
        ),
    ]

#!/usr/bin/env python
"""
Use this to manage the Django application
"""
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "BuyBitcoin.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)

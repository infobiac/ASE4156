# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['test_big_gql 1'] = {
    'data': {
        'viewer': {
            'profile': {
                'investSuggestions': {
                    'edges': [
                        {
                            'node': {
                                'available': 100.0,
                                'description': {
                                    'edges': [
                                        {
                                            'node': {
                                                'isGood': True,
                                                'text': 'Blabla'
                                            }
                                        }
                                    ]
                                },
                                'history': [
                                    {
                                        'value': 110.0
                                    },
                                    {
                                        'value': 110.0
                                    },
                                    {
                                        'value': 110.0
                                    }
                                ],
                                'isOwner': True,
                                'name': 'i1',
                                'ownedAmount': 0.0,
                                'public': False,
                                'stocks': {
                                    'edges': [
                                        {
                                            'node': {
                                                'end': None,
                                                'quantity': 1.0,
                                                'start': '2017-05-09',
                                                'stock': {
                                                    'latestQuote': {
                                                        'value': 10.0
                                                    },
                                                    'name': 'Google'
                                                }
                                            }
                                        }
                                    ]
                                },
                                'value': 110.0
                            }
                        }
                    ]
                },
                'selectedAcc': {
                    'accountName': 'testAccount1'
                },
                'stockFind': [
                    {
                        'quoteInRange': [
                            {
                                'date': '2017-05-08',
                                'value': 9.0
                            },
                            {
                                'date': '2017-05-10',
                                'value': 10.0
                            }
                        ]
                    }
                ],
                'tradingAccounts': {
                    'edges': [
                        {
                            'node': {
                                'accountName': 'testAccount1',
                                'trades': {
                                    'edges': [
                                        {
                                            'node': {
                                                'quantity': 1.0,
                                                'stock': {
                                                    'name': 'Google',
                                                    'ticker': 'GOOGL',
                                                    'trades': {
                                                        'edges': [
                                                            {
                                                                'node': {
                                                                    'account': {
                                                                        'accountName': 'testAccount1'
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                'value': -10.0
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            'username': 'testuser1'
        }
    }
}

snapshots['test_mutation_add_trading_account 1'] = {
    'data': {
        'addTradingAccount': {
            'account': {
                'accountName': 'Test 1'
            }
        }
    }
}

snapshots['test_mutation_add_bucket 1'] = {
    'data': {
        'addBucket': {
            'bucket': {
                'available': 333.33,
                'isOwner': True,
                'name': 'Test 1',
                'public': True
            }
        }
    }
}

snapshots['test_mutation_add_attribute_to_investment 1'] = {
    'data': {
        'addAttributeToBucket': {
            'bucketAttr': {
                'isGood': True,
                'text': 'Test Desc'
            }
        }
    }
}

snapshots['test_mutation_edit_attribute 1'] = {
    'data': {
        'editAttribute': {
            'bucketAttr': {
                'isGood': True,
                'text': 'Test Desc'
            }
        }
    }
}

snapshots['test_mutation_delete_attribute 1'] = {
    'data': {
        'deleteAttribute': {
            'isOk': True
        }
    }
}

snapshots['test_mutation_edit_configuration 1'] = {
    'data': {
        'editConfiguration': {
            'bucket': {
                'available': 90.0,
                'name': 'i1'
            }
        }
    }
}

snapshots['test_mutation_attribute_permission 1'] = {
    'data': {
        'addAttributeToBucket': None
    },
    'errors': [
        {
            'locations': [
                {
                    'column': 11,
                    'line': 3
                }
            ],
            'message': "You don't own the bucket!"
        }
    ]
}

snapshots['test_mutation_attribute_permission 2'] = {
    'data': {
        'editAttribute': None
    },
    'errors': [
        {
            'locations': [
                {
                    'column': 15,
                    'line': 3
                }
            ],
            'message': "You don't own the bucket!"
        }
    ]
}

snapshots['test_mutation_attribute_permission 3'] = {
    'data': {
        'deleteAttribute': None
    },
    'errors': [
        {
            'locations': [
                {
                    'column': 11,
                    'line': 3
                }
            ],
            'message': "You don't own the bucket!"
        }
    ]
}

snapshots['test_mutation_add_trade 1'] = {
    'data': {
        'addTrade': {
            'trade': {
                'account': {
                    'accountName': 'Test 1'
                },
                'quantity': 2.0,
                'stock': {
                    'ticker': 'GOOGL'
                },
                'value': -18.0
            }
        }
    }
}

snapshots['test_mutation_add_bucket_trade 1'] = {
    'data': {
        'invest': {
            'tradingAccount': {
                'availableCash': -200.0
            }
        }
    }
}

snapshots['test_mutation_delete_bucket 1'] = {
    'data': {
        'deleteBucket': {
            'isOk': True
        }
    }
}

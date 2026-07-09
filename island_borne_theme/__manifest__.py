# -*- coding: utf-8 -*-
{
    'name': 'Island Borne Website Theme',
    'version': '19.0.1.0.0',
    'category': 'Website/Theme',
    'summary': 'Island Borne homepage design with interactive store finder',
    'description': 'Custom Odoo 19 website page matching the Island Borne PSD direction, with a live Google Map store finder area.',
    'author': 'SPXCORP / Sheveion Callender',
    'website': 'https://immortellett.com',
    'depends': ['website'],
    'data': [
        'views/island_borne_homepage.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'island_borne_theme/static/src/css/island_borne.css',
            'island_borne_theme/static/src/js/island_borne_store_finder.js',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}

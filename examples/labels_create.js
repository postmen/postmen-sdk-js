'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put your shipper account ID here
let shipper_account_id = 'SOME_ID';
let postmen = Postmen(Credentials.api_key, Credentials.region);

let payload = {
	'async': false,
	'return_shipment': false,
	'paper_size': 'a4',
	'ship_date': '2016-02-17',
	'service_type': 'sfb2c_au_airmail',
	'is_document': false,
	'customs': {
		'purpose': 'gift'
	},
	'invoice': {
		'date': '2016-02-24'
	},
	'references': [
		'Handle with care'
	],
	'shipper_account': {
		'id': shipper_account_id
	},
	'billing': {
		'paid_by': 'shipper',
		'method': {
			'type': 'account',
			'account_number': '1234567890'
		}
	},
	'shipment': {
		'ship_from': {
			'contact_name': 'Jameson McLaughlin',
			'company_name': 'Jameson Inc',
			'phone': '736-010-3577',
			'street1': '8918 Borer Ramp',
			'city': 'Los Angeles',
			'state': 'CA',
			'postal_code': '90001',
			'country': 'HKG',
			'type': 'business'
		},
		'ship_to': {
			'contact_name': 'Jon Poole',
			'street1': '212 South Street',
			'city': 'BRISBANE',
			'state': 'QLD',
			'postal_code': '4000',
			'country': 'AUS',
			'phone': '6034919890',
			'type': 'residential'
		},
		'parcels': [
			{
				'description': 'iMac & iCherry',
				'box_type': 'custom',
				'weight': {
					'value': 5.56,
					'unit': 'kg'
				},
				'dimension': {
					'width': 65,
					'height': 52,
					'depth': 21,
					'unit': 'cm'
				},
				'items': [
					{
						'description': 'iMac (Retina 5K, 24-inch, Late 2014)',
						'origin_country': 'USA',
						'quantity': 1,
						'price': {
							'amount': 1999,
							'currency': 'USD'
						},
						'weight': {
							'value': 5.54,
							'unit': 'kg'
						},
						'sku': 'imac2014',
						'hs_code': '1111111'
					}
				]
			}
		]
	}
};

let config = {
	body: payload
};

// create labels by using callback
postmen.create('/labels', config, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

// create labels by using promise
// postmen.create('/labels',config).then(function (result) {
//     console.log(result);
// }).catch(function (err) {
//     console.log(err);
// });

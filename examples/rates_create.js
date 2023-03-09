'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put your shipper account ID here
let shipper_account_id = 'YOUR_SHIPPER_ACCOUNT_ID';
let postmen = Postmen(Credentials.api_key, Credentials.region);

let payload = {
	'async': false,
	'shipper_accounts': [
		{
			'id': shipper_account_id
		}
	],
	'shipment': {
		'parcels': [
			{
				'box_type': 'custom',
				'weight': {
					'value': 0.5,
					'unit': 'kg'
				},
				'dimension': {
					'width': 20,
					'height': 10,
					'depth': 10,
					'unit': 'cm'
				},
				'items': [
					{
						'description': 'PS4',
						'origin_country': 'JPN',
						'quantity': 2,
						'price': {
							'amount': 50,
							'currency': 'JPY'
						},
						'weight': {
							'value': 0.6,
							'unit': 'kg'
						},
						'sku': 'PS4-2015'
					}
				]
			}
		],
		'ship_from': {
			'contact_name': 'Yin Ting Wong',
			'street1': 'Flat A, 30/F, Block 17 Laguna Verde',
			'city': 'Hung Hom',
			'state': 'Kowloon',
			'country': 'HKG',
			'phone': '96679797',
			'email': 'test@test.test',
			'type': 'residential'
		},
		'ship_to': {
			'contact_name': 'Mike Carunchia',
			'street1': '9504 W Smith ST',
			'city': 'Yorktown',
			'state': 'Indiana',
			'postal_code': '47396',
			'country': 'USA',
			'phone': '7657168649',
			'email': 'test@test.test',
			'type': 'residential'
		}
	},
	'is_document': false
};

let input = {
	body: payload
};

let config = {};

// create rates with input and config
postmen.create('/rates', input, config).then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

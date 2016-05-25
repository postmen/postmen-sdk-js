'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put your shipper account ID here
let shipper_account_id = 'YOUR_SHIPPER_ACCOUNT_ID';
let postmen = Postmen(Credentials.api_key, Credentials.region);

let payload = {
	'shipper_account': {
		'id': shipper_account_id
	},
	'async': false
};

let input = {
	body: payload
};

let config = {
};

postmen.create('/manifests', input, config).then(function (result) {
	console.log('ERROR:', result);
}).catch(function (err) {
	console.log('RESULT:', err);
});

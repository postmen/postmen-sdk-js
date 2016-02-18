'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put your shipper account ID here
let shipper_account_id = 'SOME-ID';
let postmen = Postmen(Credentials.api_key, Credentials.region);

let payload = {
	'shipper_account': {
		'id': shipper_account_id
	},
	'async': false
};

let config = {
	body: payload
};

postmen.create('/manifests', config, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

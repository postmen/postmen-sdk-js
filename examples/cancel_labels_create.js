'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);
let label_id = 'YOUR_LABEL_ID';

let payload = {
	'label': {
		'id': label_id
	}
};

let input = {
	body: payload
};

let config = {};

postmen.create('/cancel-labels', input, config).then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

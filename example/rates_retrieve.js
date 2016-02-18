'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put ID of a particular rate
let rate_id = 'RATE-ID';
let postmen = Postmen(Credentials.api_key, Credentials.region);

// get all cancel labels
postmen.get('/rates', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

// get a particular cancel labels
postmen.get('/rates', rate_id, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

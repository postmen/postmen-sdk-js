'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put ID of a particular rate
let label_id = 'LABEL-ID';
let postmen = Postmen(Credentials.api_key, Credentials.region);

// get all  labels
postmen.get('/labels', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

// get a particular  labels
postmen.get('/rates', label_id, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

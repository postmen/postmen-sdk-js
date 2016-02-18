'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);
let label_id = 'some_label_id';

// get all cancel labels
postmen.get('/cancel-labels', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

// get a particular cancel labels
postmen.get('/cancel-labels', label_id, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

let config = {raw: false};

// get all  labels
postmen.get('/labels', config, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(typeof result);
		console.log(result);
	}
});

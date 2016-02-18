'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO edit your proxy data here
let config = {
	'proxy': 'http://127.0.0.1:8888'
};

let postmen = Postmen(Credentials.api_key, Credentials.region, config);

// get a particular labels
postmen.get('/label/put-your-label-id-here', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

// get all labels
postmen.get('/label', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

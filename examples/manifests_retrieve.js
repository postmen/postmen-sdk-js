'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

// get all rate labels
postmen.get('/manifests', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});


// get a rate labels
postmen.get('/manifests/put-your-manifests-here', function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

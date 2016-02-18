'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

// TODO put your shipper account ID here
let manifest = 'SOME-ID';

let postmen = Postmen(Credentials.api_key, Credentials.region);

postmen.get('/manifests', manifest, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

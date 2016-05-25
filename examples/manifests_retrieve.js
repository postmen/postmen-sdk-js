'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

// get all labels
postmen.get('manifests').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// get a particular labels
postmen.get('manifests/YOUR_MANIFESTS_ID').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

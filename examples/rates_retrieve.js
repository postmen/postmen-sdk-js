'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

// get all labels
postmen.get('rates').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// get a particular labels
postmen.get('rates/YOUR_RATES_ID').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

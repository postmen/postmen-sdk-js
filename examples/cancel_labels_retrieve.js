'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

let input = {
	// query: {},
};

let config = {};

// get all cancel labels
postmen.get('/cancel-labels').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// get a particular cancel labels
postmen.get('/cancel-labels/YOUR-LABEL-ID-HERE').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// get a particular cancel labels with input and config
postmen.get('/cancel-labels/YOUR-LABEL-ID-HERE', input, config).then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

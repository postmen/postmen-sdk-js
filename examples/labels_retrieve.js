'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

let input = {
	// query: {status:'created'} or 'status=created'
};

let config = {};

// get all labels
postmen.get('labels').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// get all labels with input and config
postmen.get('labels', input, config).then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// get a particular labels
postmen.get('labels/YOUR_LABEL_ID').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

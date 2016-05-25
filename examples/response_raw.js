'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);

postmen.setRaw(true).get('labels').then(function (result) {
	console.log('RESULT:', typeof result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

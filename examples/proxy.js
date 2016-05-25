'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let proxy_str = 'http://USERNAME:PASSWORD@127.0.0.1:8888';
let config = {
	'proxy': proxy_str
};

// Method 1: set proxy when new the Postmen instance
let postmen = Postmen(Credentials.api_key, Credentials.region, config);
postmen.get('labels').then(function (result) {
	console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});

// Method 2: set proxy when make request
/*
let postmen = Postmen(Credentials.api_key, Credentials.region);
let input = {};
// get all labels
postmen.get('labels', input, config).then(function (result) {
    console.log('RESULT:', result);
}).catch(function (err) {
	console.log('ERROR:', err);
});
*/

// Method 3: set proxy using chainable function
/*
//let postmen = Postmen(Credentials.api_key, Credentials.region);
//// get all labels
//postmen.setProxy(proxy_str).get('labels').then(function (result) {
//    console.log('RESULT:', result);
//}).catch(function (err) {
//	console.log('ERROR:', err);
//});
*/

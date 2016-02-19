'use strict';

const Postmen = require('./../index');
const Credentials = require('./credentials');

let postmen = Postmen(Credentials.api_key, Credentials.region);
let label_id = 'some_label_id';

let payload = {
	'label': {
		'id': label_id
	}
};

let config = {
	body: payload
};

postmen.create('/cancel-labels', config, function (err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log(result);
	}
});

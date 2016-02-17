(function () {
	'use strict';
	var _ = require('lodash');
	var request = require('request');
	var RetriableRequestError = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'];
	var RetryLimit = 5;
	var TooManyRequestError = 429;
	var RetriableApiError = 500;

	/**
	 * Postmen constructor
	 *
	 * @param {object} config - the configuration of the consumer, {host, port, tube_name}, example see 'config.js'
	 * @param {string} mongo_uri - the uri of mongodb
	 * @param {bool} enable_log - Enable the log event, it will log detail of every handled payload
	 * @constructor
	 */
	function Postmen(api_key, region, config) {
		this.version = '1.0.0';
		this.api_key = api_key;
		this.config = {};
		this.config.endpoint = 'https://' + region + '-api.postmen.com';
		this.config.retry = true;
		this.config.rate = true;
		this.config.array = false;
		this.config.raw = false;
		this.config.safe = false;
		this.config.proxy = {};
		this.config = _.merge(_.cloneDeep(this.config), config || {});

		// this.retries = 0;
		// this.delay = 1000;
		this.error = null;
		this.request = request;
		this.rate_limit = {
			reset: null,
			limit: null,
			remaining: null
		};

		// console.log("#!@#!@#");
		// console.log(this.config);
	}

	Postmen.prototype.call = function (method, path, query, body, config, callback) {
		this.config = _.merge(_.cloneDeep(this.config), config || {});
		var payload = this.makePayload(method, path, query, body, this.config);
		console.log(payload);
		this.makeRequest(payload, callback);
	};

	Postmen.prototype.makePayload = function (method, path, query, body, options) {

		var request_object = {
			headers: {
				'postmen-api-key': this.api_key,
				'Content-Type': 'application/json',
				'x-postmen-agent': this.version,
				'Connection': 'keep-alive'
			},
			url: options.endpoint + path,
			method: method,
			body: JSON.stringify(body),
			qs: query,
			proxy: _.isEqual(options.proxy, {}) ? null : options.proxy,
			json: true
		};

		// Remove all null or undefined
		for (let key in request_object) {
			if (_.isNil(request_object[key]) || request_object[key] === 'null') {
				delete request_object[key];
			}
		}

		// Payload
		let payload = {
			request_object: request_object,
			retry: options.retry,
			delay: 1000,
			retries: 0,
			raw: options.raw
		};

		// console.log(request_object);
		return payload;
	};

	Postmen.prototype.makeRequest = function (payload, callback) {
		var _this = this;
		this.request(payload.request_object, function (err, req, body) {
			if (err) {
				// console.log(err);
				// console.log('###!@@');
				_this.handleError('no response - simulated network error', null, 'Failed to perform HTTP request', false, '', callback);
			} else {
				// console.log(_this.config);
				// console.log(req.headers);
				// console.log('&&&&&&&&&&&&&&&&&&&&&&');
				if (!_.isNil(req.headers['x-ratelimit-limit'])) {
					_this.rate_limit = {
						limit: parseInt(req.headers['x-ratelimit-limit']),
						remaining: parseInt(req.headers['x-ratelimit-remaining']),
						reset: parseInt(req.headers['x-ratelimit-reset'])
					};
				}

				if ((typeof body) === 'string') {
					_this.handleError('THIS IS NOT A VALID JSON OBJECT', 500, 'Something went wrong on Postmen\'s end', false, '', callback);
				} else if (_this.config.raw) {
					callback(null, JSON.stringify(body));
				} else if (body.meta.code === TooManyRequestError && _this.config.rate) {
					console.log('#2 TooManyRequestError');
					// Retry if err is TooManyRequestError
					_this._retryTooManyRequestError(payload, body, callback);
				} else if (body.meta.retryable && _this.config.retry) {
					console.log('#3 retryable');
					// Retry if err is RetriableApiError
					_this._retryApiError(payload, body, callback);
				} else if (body.meta.code !== 200) {
					// Return err if it is not OK response
					console.log('#4 API Error');
					callback(_this.getApiError(body));
				} else {
					callback(null, body);
				}
			}
		});
	};

	Postmen.prototype.GET = function (path, query, config, callback) {
		// for (var i = 0; i < arguments.length; i++) {
		// 	console.log(arguments[i]);
		// }
		this.call('GET', path, query, null, config, callback);
	};

	// Postmen.prototype.call = function (method, path, query, body, config, callback)
	Postmen.prototype.POST = function (path, body, config, callback) {
		for (var i = 0; i < arguments.length; i++) {
			console.log(arguments[i]);
		}
		this.call('POST', path, null, body, config, callback);
	};

	Postmen.prototype.get = function (resource, id, query, config, callback) {
		var args = [];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		if (typeof args[args.length - 1] === 'function') {
			callback = args.pop();
		}

		if (args.length === 1) {
			this.GET('/v3/' + resource, null, {}, callback);
		} else if (args.length === 2) {
			this.GET('/v3/' + resource + '/' + id, null, {}, callback);
		} else if (args.length === 3) {
			this.GET('/v3/' + resource + '/' + id, query, {}, callback);
		} else if (args.length === 4) {
			this.GET('/v3/' + resource + '/' + id, query, config, callback);
		}
	};

	Postmen.prototype.create = function (resource, payload, config, callback) {
		var args = [];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		if (typeof args[args.length - 1] === 'function') {
			callback = args.pop();
		}

		if (args.length === 1) {
			this.POST('/v3/' + resource, null, {}, callback);
		} else if (args.length === 2) {
			this.POST(resource, payload, {}, callback);
		} else if (args.length === 3) {
			this.POST('/v3/' + resource, payload, config, callback);
		}
	};

	Postmen.prototype._retryTooManyRequestError = function (payload, body, callback) {
		console.log("## _retryTooManyRequestError start##");
		var _this = this;
		// if aftership.rate is true
		if (this.config.rate) {
			var timeout = this.rate_limit.reset - Date.now();

			// Retry after 1s
			setTimeout(function () {
				_this.makeRequest(payload, callback);
			}, timeout);
		} else {
			// Return err
			callback(this.getApiError(body, this.retries));
		}
	};

	Postmen.prototype._retryApiError = function (payload, body, callback) {
		console.log("## _retryApiErro start##");
		var _this = this;
		var new_payload = _.cloneDeep(payload);
		new_payload.retries += 1;
		if (new_payload.retries < RetryLimit) {
			console.log(new_payload.delay);

			setTimeout(function () {
				_this.makeRequest(new_payload, callback);
			}, new_payload.delay);
			new_payload.delay = new_payload.delay * 2;
		} else {
			// Return err
			callback(this.getApiError(body, new_payload.retry_count));
		}
	};

	Postmen.prototype.handleError = function (response, code, message, retryable, details, callback) {
		var error = new Error();
		error.response = response;
		error.code = code;
		error.message = message;
		error.retryable = retryable;
		error.details = details;

		if (this.config.safe) {
			this.error = error;
			callback();
		} else {
			callback(error);
		}
	};

	Postmen.prototype.getApiError = function (response_body, retry_count) {
		var error = new Error();
		error.type = response_body.meta.type;
		error.message = response_body.meta.message;
		error.code = response_body.meta.code;
		error.data = response_body.data;
		error.response_body = JSON.stringify(response_body);

		if (retry_count) {
			error.retry_count = retry_count;
		}

		if (this.config.safe) {
			this.error = error;
		}
		return error;
	};

	Postmen.prototype.getError = function (response_body, retry_count) {
		return this.error;
	};

	module.exports = Postmen;
})();

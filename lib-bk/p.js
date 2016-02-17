'use strict';

// Declare imports
const _ = require('lodash');
const request = require('request');
const postmenError = require('./error/error');
const ErrorEnum = require('./error/error_enum');
// const Handler = require('./handler');
// const Payload = require('./payload');

// Global variable
const methods = ['GET', 'POST', 'DELETE', 'PUT'];
const RetryLimit = 5;
const TooManyRequestError = 429;
const RetriableApiError = 500;
const RetriableRequestError = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'];


// postmen class
class postmen {
	/**
     * postmen constructor
     *
     * @param api_key {string} - Your postmen API key
	 * @param options {object}
     * 	endpoint {string} - postmen endpoint, default 'https://api.postmen.com/v4'
     * 	proxy {string} - Proxy, default is null
     * 	retry {boolean} - Retry if fail, max. 5 times, default is true
	 *	rate {boolean} - Retry if Error 429 occur, wait until rate-limit reset, default is true
     * @constructor
     */
	// constructor(api_key, options) {
	constructor(api_key, region, config) {
		// this._errorHandling(api_key, options);

		// Setup
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
		this.config = _.merge(this.config, config);

		// set attributes concerning ratelimiting and auto-retry
		this.delay = 1;
		this.retries = 0;
		this.max_retries = 5;
		this.calls_left = null;

		this.rate_limit = {
			reset: null,
			limit: null,
			remaining: null
		};

		// // Create proxy methods
		// // 	postmen.GET(...)
		// // 	postmen.POST(...)
		// // 	postmen.PUT(...)
		// // 	postmen.DELETE(...)
		// for (let i = 0; i < methods.length; i++) {
		// 	let _this = this;
		// 	this[methods[i]] = function () {
		// 		let args = Array.prototype.slice.call(arguments);
		// 		args.unshift(methods[i]);
		// 		_this.call.apply(_this, args);
		// 	};
		// }
	}


	/**
     * Call (Context-less)
     *
     * @param method {string} - get, post, put or delete
     * @param path {string} - pathname for URL
	 * @param options {object}
     *	body {object} - POST body
     *	query {object} - query object
	 *	retry {boolean} - Retry if fail? override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	// call(method, path, options, callback) {
	call(method, path, query, body, config, callback) {
		_.merge(_.cloneDeep(this.config), config || {});
		// // retrieve arguments as array
		// let args = [];
		// for (let i = 0; i < arguments.length; i++) {
		// 	args.push(arguments[i]);
		// }

		// // if last element is a callback
		// // store it to callback
		// if (typeof args[args.length - 1] === 'function') {
		// 	callback = args.pop();
		// } else {
		// 	callback = null;
		// }

		// // Create payload with (postmen, method, path, options)
		let payload = this.make_playload(method, path, query, body);
		console.log(payload);
		// Handle the payload, with the callback
		// this.make_request(payload, callback);
		//
	}

	make_playload(method, path, query, body) {
		// Request object
		let request_object = {

			headers: {
				'postmen-api-key': this.api_key,
				'Content-Type': 'application/json',
				'x-postmen-agent': this.version,
				'Connection:': 'keep-alive'
			},
			url: this.config.endpoint + path,
			method: method,
			body: body,
			qs: query,
			proxy: this.config.proxy,
			json: true
		};

		// Remove all null or undefined
		for (let key in request_object) {
			if (request_object[key] === null || request_object[key] === undefined) {
				delete request_object[key];
			}
		}

		// Payload
		let payload = {
			request_object: request_object,
			retry: this.config.retry,
			raw: this.config.raw
		};

		// Add retry count if needed
		if (payload.retry) {
			payload.retry_count = 0;
		}

		return payload;
	}

	make_request(payload, callback) {
		request(payload.request_object, function (err, req, body) {
			if (err) {
				// // If request return err
				// if (RetriableRequestError.indexOf(err.code) !== -1) {
				// 	// Retry if err is retriable
				// 	this._retryRequestError(postmen, payload, err, callback);
				// } else {
				// 	// Return err if not retriable
				// 	callback(err);
				// }
				console.log(err);
			} else {
				console.log(body);
				// // If no err
				// // Set rate_limit
				// postmen.rate_limit = {
				// 	limit: Number(req.headers['x-ratelimit-limit']),
				// 	remaining: Number(req.headers['x-ratelimit-remaining']),
				// 	reset: Number(req.headers['x-ratelimit-reset'])
				// };

				// if (body.meta.code === TooManyRequestError) {
				// 	// Retry if err is TooManyRequestError
				// 	this._retryTooManyRequestError(postmen, payload, body, callback);
				// } else if (body.meta.code >= RetriableApiError) {
				// 	// Retry if err is RetriableApiError
				// 	this._retryApiError(postmen, payload, body, callback);
				// } else if (body.meta.code !== 200 && body.meta.code !== 201) {
				// 	// Return err if it is not OK response
				// 	callback(PostmenError.getApiError(body));
				// } else {
				// 	// Response OK
				// 	if (payload.raw) {
				// 		// If raw is true, response string
				// 		callback(null, JSON.stringify(body));
				// 	} else {
				// 		// Else response Object
				// 		callback(null, body);
				// 	}
				// }
			}
		});
	}

	// GET(path, query, config, callback) {
	// 	console.log(path);
	// 	console.log('##########');
	// 	console.log(query);
	// 	console.log('##########');
	// 	console.log(config);
	// 	console.log('##########');
	// 	console.log(callback);
	// 	this.call('GET', path, query, null, config, callback);
	// }

	// POST(path, body, config){

	// }

	// PUT(path, body, config){

	// }

	// DELETE(path, body, config){

	// }

	get(resource, id, query, config, callback) {
		let args = [];
		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		if (typeof args[args.length - 1] === 'function') {
			console.log('is function');
			callback = args.pop();
		}

		// 5  : resource, id, query, config, callback
		// 4  : resource, id, query, callback
		// 3  : resource, id, callback
		// 2  : resource, callback

		console.log(args);
		if (id && args.length > 1) {
			this.GET('/v3' + resource + '/' + id, query, config, callback);
		} else {
			this.GET('/v3' + resource, query, config, callback);
		}
	}

	create() {

	}

	/**
     * Error Handling function
	 * Throw error if the input param contain incorrect type
     *
     * @param api_key {string}
     * @param options {object}
     */
	_errorHandling(api_key, options) {
		if (!_.isString(api_key)) {
			// Verify api_key
			throw postmenError.getSdkError(ErrorEnum.ConstructorInvalidApiKey, api_key);
		} else if (!_.isNull(options) && !_.isUndefined(options) && !_.isPlainObject(options)) {
			// Verify options
			throw postmenError.getSdkError(ErrorEnum.ConstructorInvalidOptions, options);
		}

		// Verify options value
		if (options) {
			if (!_.isNull(options.endpoint) && !_.isUndefined(options.endpoint) && !_.isString(options.endpoint)) {
				// Verify endpoint
				throw postmenError.getSdkError(ErrorEnum.ConstructorInvalidEndpoint, options.endpoint);
			} else if (!_.isNull(options.proxy) && !_.isUndefined(options.proxy) && !_.isString(options.proxy)) {
				// Verify proxy
				throw postmenError.getSdkError(ErrorEnum.ConstructorInvalidProxy, options.proxy);
			} else if (!_.isNull(options.retry) && !_.isUndefined(options.retry) && !_.isBoolean(options.retry)) {
				// Verify retry
				throw postmenError.getSdkError(ErrorEnum.ConstructorInvalidRetry, options.retry);
			} else if (!_.isNull(options.rate) && !_.isUndefined(options.rate) && !_.isBoolean(options.rate)) {
				// Verify rate
				throw postmenError.getSdkError(ErrorEnum.ConstructorInvalidRate, options.rate);
			}
		}
	}
}

// Exports the constructor
module.exports = function (api_key, region, config) {
	return new postmen(api_key, region, config);
};

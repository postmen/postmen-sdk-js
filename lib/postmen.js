'use strict';

// Declare imports
const _ = require('lodash');
const request = require('request');
const PostmenError = require('./error/error');
const ErrorEnum = require('./error/error_enum');
const Handler = require('./handler');
const Payload = require('./payload');

// Global variable
// const DefaultEndpoint = 'https://api.postmen.com/v4';
const methods = ['GET', 'POST', 'DELETE', 'PUT'];

// Postmen class
class Postmen {
	/**
     * Postmen constructor
     *
     * @param api_key {string} - Your Postmen API key
	 * @param options {object}
     * 	endpoint {string} - Postmen endpoint, default 'https://api.postmen.com/v4'
     * 	proxy {string} - Proxy, default is null
     * 	retry {boolean} - Retry if fail, max. 5 times, default is true
	 *	rate {boolean} - Retry if Error 429 occur, wait until rate-limit reset, default is true
     * @constructor
     */
	constructor(api_key, region, config) {
		this._errorHandling(api_key, config);

		// Setup
		config = config || {};
		this.request = request;
		this.api_key = api_key;
		this.endpoint = config.endpoint || 'https://' + region + '-api.postmen.com';
		this.proxy = config.proxy || null;
		this.retry = _.isBoolean(config.retry) ? config.retry : true;
		this.rate = _.isBoolean(config.rate) ? config.rate : true;

		this.rate_limit = {};

		// Create proxy methods
		// 	postmen.GET(...)
		// 	postmen.POST(...)
		// 	postmen.PUT(...)
		// 	postmen.DELETE(...)
		for (let i = 0; i < methods.length; i++) {
			let _this = this;
			this[methods[i]] = function () {
				let args = Array.prototype.slice.call(arguments);
				args.unshift(methods[i]);
				_this.call.apply(_this, args);
			};
		}
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
	call(method, path, options, callback) {
		let _this = this;
		// retrieve arguments as array
		let args = [];
		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		// if last element is a callback
		// store it to callback
		if (typeof args[args.length - 1] === 'function') {
			callback = args.pop();
		} else {
			callback = null;
		}

		// Create payload with (postmen, method, path, options)
		let payload = Payload(_this, args[0], args[1], args[2]);

		if (callback) {
			// Handle the payload, with the callback
			Handler.handlePayload(_this, payload, callback);
		} else {
			// return Promise, is callback is not define
			return new Promise(function (resolve, reject) {
				Handler.handlePayload(_this, payload, function (err, result) {
					if (err) {
						reject(err);
					} else {
						resolve(result);
					}
				});
			});
		}
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
			throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidApiKey, api_key);
		} else if (!_.isNull(options) && !_.isUndefined(options) && !_.isPlainObject(options)) {
			// Verify options
			throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidOptions, options);
		}

		// Verify options value
		if (options) {
			if (!_.isNull(options.endpoint) && !_.isUndefined(options.endpoint) && !_.isString(options.endpoint)) {
				// Verify endpoint
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidEndpoint, options.endpoint);
			} else if (!_.isNull(options.proxy) && !_.isUndefined(options.proxy) && !_.isString(options.proxy)) {
				// Verify proxy
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidProxy, options.proxy);
			} else if (!_.isNull(options.retry) && !_.isUndefined(options.retry) && !_.isBoolean(options.retry)) {
				// Verify retry
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidRetry, options.retry);
			} else if (!_.isNull(options.rate) && !_.isUndefined(options.rate) && !_.isBoolean(options.rate)) {
				// Verify rate
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidRate, options.rate);
			}
		}
	}
}

// Exports the constructor
module.exports = function (api_key, region, config) {
	return new Postmen(api_key, region, config);
};

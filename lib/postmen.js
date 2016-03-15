'use strict';

// Declare imports
const _ = require('lodash');
const request = require('request');
const PostmenError = require('./error/error');
const ErrorEnum = require('./error/error_enum');
const Handler = require('./handler');
const Payload = require('./payload');

// Global variable
const methods = ['GET', 'POST', 'DELETE', 'PUT'];

// Postmen class
class Postmen {
	/**
     * Postmen constructor
     *
     * @param api_key {string} - Your Postmen API key
     * @param region  {string} - Your API region
	 * @param config {object}
     * 	endpoint {string} - Postmen endpoint
     * 	proxy {string} - Proxy, default is null
     * 	retry {boolean} - Retry if fail, max. 5 times, default is true
	 *	rate {boolean} - Retry if Error 429 occur, wait until rate-limit reset, default is true
     * @constructor
     */
	constructor(api_key, region, config) {
		this._errorHandling(api_key, region, config);

		// Setup
		config = config || {};
		this.request = request;
		this.api_key = api_key;
		this.endpoint = config.endpoint || 'https://' + region + '-api.postmen.com/v3';
		this.proxy = config.proxy || null;
		this.retry = _.isBoolean(config.retry) ? config.retry : true;
		this.rate = _.isBoolean(config.rate) ? config.rate : true;
		this.raw = _.isBoolean(config.raw) ? config.raw : false;

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
	 * @param config {object}
     *	body {object} - POST body
     *	query {object} - query object
	 *	retry {boolean} - Retry if fail? override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	call(method, path, config, callback) {
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

		// Create payload with (postmen, method, path, config)
		let payload = Payload(_this, args[0], args[1], args[2]);
		Handler.handlePayload(_this, payload, callback);
	}

	/**
     * get
     *
     * @param path {string} - pathname for URL
	 * @param config {object}
     *	query {object} - query object
	 *	retry {boolean} - Retry if fail? override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	get(path, config, callback) {
		let _this = this;
		let args = [];
		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		if (typeof args[args.length - 1] === 'function') {
			callback = args.pop();
		} else {
			callback = null;
		}

		let _config;
		if (args.length === 2) {
			_config = config;
		} else {
			_config = {};
		}

		if (callback) {
			_this.GET(path, _config, callback);
		} else {
			return new Promise(function (resolve, reject) {
				_this.GET(path, _config, function (err, result) {
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
     * create
     *
     * @param path {string} - pathname for URL
	 * @param config {object}
     *	body {object} - POST body, required
     *	query {object} - query object, optional
	 *	retry {boolean} - Retry if fail, override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	create(path, config, callback) {
		let _this = this;
		let args = [];
		for (let i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		if (typeof args[args.length - 1] === 'function') {
			callback = args.pop();
		} else {
			callback = null;
		}

		if (callback) {
			_this.POST(path, config, callback);
		} else {
			return new Promise(function (resolve, reject) {
				_this.POST(path, config, function (err, result) {
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
     * @param region {string}
     * @param config {object}
     */
	_errorHandling(api_key, region, config) {
		if (!_.isString(api_key)) {
			// Verify api_key
			throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidApiKey, api_key);
		} else if (!_.isString(region)) {
			// Verify region
			throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidRegion, region);
		} else if (!_.isNull(config) && !_.isUndefined(config) && !_.isPlainObject(config)) {
			// Verify config
			throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidConfig, config);
		}

		// Verify config value
		if (config) {
			if (!_.isNull(config.endpoint) && !_.isUndefined(config.endpoint) && !_.isString(config.endpoint)) {
				// Verify endpoint
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidEndpoint, config.endpoint);
			} else if (!_.isNull(config.proxy) && !_.isUndefined(config.proxy) && !_.isString(config.proxy)) {
				// Verify proxy
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidProxy, config.proxy);
			} else if (!_.isNull(config.retry) && !_.isUndefined(config.retry) && !_.isBoolean(config.retry)) {
				// Verify retry
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidRetry, config.retry);
			} else if (!_.isNull(config.rate) && !_.isUndefined(config.rate) && !_.isBoolean(config.rate)) {
				// Verify rate
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidRate, config.rate);
			} else if (!_.isNull(config.raw) && !_.isUndefined(config.raw) && !_.isBoolean(config.raw)) {
				// Verify rate
				throw PostmenError.getSdkError(ErrorEnum.ConstructorInvalidRaw, config.raw);
			}
		}
	}
}

// Exports the constructor
module.exports = function (api_key, region, config) {
	return new Postmen(api_key, region, config);
};

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
		this._sanitizeConstructor(api_key, region, config);

		// Setup
		config = config || {};
		this.request = request;
		this.tmp_api_key = null;
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
				return _this.call.apply(_this, args);
			};
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
	_sanitizeConstructor(api_key, region, config) {
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
	/**
     * getRateLimit
	 *
     * @param rateLimit {object}
     */
	getRateLimit() {
		return _.get(this, 'rate_limit');
	}
	/**
     * useApiKey - chainable function
	 * temporarily use an api_key to make request
     *
     * @param api_key {string}
     * @param postmen {object}
     */
	useApiKey(api_key) {
		this.tmp_api_key = api_key;
		return this;
	}
	/**
     * setProxy - chainable function
	 * set proxy
     *
     * @param proxy {string}
     */
	setProxy(proxy) {
		this.proxy = proxy;
		return this;
	}
	/**
     * setRetry - chainable function
	 * set Retry
     *
     * @param isRetry {boolean}
     */
	setRetry(isRetry) {
		this.retry = isRetry;
		return this;
	}
	/**
     * setRaw - chainable function
	 * set Raw
     *
     * @param isRaw {boolean}
     */
	setRaw(isRaw) {
		this.raw = isRaw;
		return this;
	}
	/**
     * Call (Context-less)
     *
     * @param method {string} - get, post, put or delete
     * @param resource {string} - pathname for URL
     * @param input {object}
     *	body {object} - POST body
     *	query {object} - query object
	 * @param config {object}
	 *	retry {boolean} - Retry if fail? override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	call(method, resource, input, config, callback) {
		let _this = this;
		// retrieve arguments as array
		let args = Array.prototype.slice.call(arguments);
		this._paramHelper(arguments);
		// Create payload with (postmen, method, resource, input, config)
		let payload = Payload(_this, args[0], args[1], args[2], args[3]);
		// TODO: put `return` to return possible Promise
		if (callback) {
			Handler.handlePayload(_this, payload, callback);
		} else {
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
     * get
     *
     * @param resource {string} - pathname for URL
     * @param input {object}
     *	query {object} - query object or string
	 * @param config {object}
	 *	retry {boolean} - Retry if fail? override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	get(resource, input, config, callback) {
		let args = Array.prototype.slice.call(arguments);
		callback = this._paramHelper(args);
		if (args.length === 2) {
			input = {};
		}
		return this.GET(resource, input, config, callback);
	}
	/**
     * create
     *
     * @param resource {string} - pathname for URL
     * @param input {object}
     *	body {object} - POST body, required
     *	query {object} - query object or string, optional
	 * @param config {object}
	 *	retry {boolean} - Retry if fail, override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @param callback {function}
     */
	create(resource, input, config, callback) {
		callback = this._paramHelper(arguments);
		return this.POST(resource, input, config, callback);
	}
	/**
     * _paramHelper
     *
     * @param args {Object}
     */
	_paramHelper(args) {
		let _args = Array.prototype.slice.call(args);
		let callback;
		if (typeof _args[_args.length - 1] === 'function') {
			callback = _args.pop();
		} else {
			callback = null;
		}
		return callback;
	}
}

// Exports the constructor
module.exports = function (api_key, region, config) {
	return new Postmen(api_key, region, config);
};

'use strict';

// Declare imports
const _ = require('lodash');
const querystring = require('querystring');
const PostmenError = require('./error/error');
const ErrorEnum = require('./error/error_enum');
// Global variable
const methods = ['GET', 'POST', 'DELETE', 'PUT'];
const version = '1.0.0';
// Payload class
class Payload {
	/**
	 * Function to create the request_object and other information
	 *
	 * @param postmen {Postmen} - the postmen object
	 * @param method {string} - get, post, put or delete
	 * @param resource {string} - pathname for URL
	 * @param input
	 *    body {object} - POST body
	 *    query {object} - query object or string
	 * @param config {object}
	 *     api_key {string} - Your Postmen API key
	 *     retry {boolean} - Retry if fail override this.retry if set
	 *     raw {boolean} - if true, return string, else return object, default false
	 * @return the payload object with properities below
	 * {
	 *    request_object {object} - object to create request
	 *    retry {boolean} - retry flag
	 *    raw {boolean} - response with string or not
	 * }
	 */
	constructor(postmen, method, resource, input, config) {
		// console.log(input);
		// (postmen, method, resource, input, config)
		this._errorHandling(method, resource, input, config);

		config = config || {};
		input = input || {};
		let qs = input.query;
		// parse qs if string
		if (_.isString(qs)) {
			qs = querystring.parse(qs);
		}
		// Request object
		let request_object = {
			headers: {
				'postmen-api-key': config.api_key || postmen.tmp_api_key || postmen.api_key,
				'Content-Type': 'application/json',
				'Connection': 'keep-alive',
				'x-postmen-agent': version
			},
			url: this._urlBuilder(postmen.endpoint, resource),
			method: method,
			body: input.body,
			qs: qs,
			proxy: config.proxy || postmen.proxy,
			json: true
		};

		// Remove all null or undefined
		for (let key in request_object) {
			if (request_object[key] === null || request_object[key] === undefined) {
				delete request_object[key];
			}
		}

		// reset the tmp_api_key, if set the api_key by chainable function
		if (postmen.tmp_api_key) {
			postmen.tmp_api_key = null;
		}

		if (config.csv) {
			request_object.source = 'csv';
		}

		// Payload
		let payload = {
			request_object: request_object,
			retry: _.isBoolean(config.retry) ? config.retry : postmen.retry,
			raw: _.isBoolean(config.raw) ? config.raw : postmen.raw,
			delay: 1000
		};

		// Add retry count if needed
		if (payload.retry) {
			payload.retry_count = 1;
		}

		// console.log(payload);
		return payload; // Q: weird to return here
	}
	/**
	 * format the URL
	 *
	 * @param path {string}
	 * @param resource {string}
	 */
	_urlBuilder(path, resource) {
		let url;
		url = [path, resource].join('/');
		return url.replace(/([^:]\/)\/+/g, '$1');
	}
	/**
	 * Error Handling function
	 * Throw error if the input param contain incorrect type
	 *
	 * @param method {string}
	 * @param resource {resource}
	 * @param config {object}
	 */
	_errorHandling(method, resource, input, config) {
		// body, query, retry, raw
		if (!_.isString(method)) {
			// Verify method
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidMethod, method);
		} else if (methods.indexOf(method.toUpperCase()) === -1) {
			// Verify method
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidMethod, method);
		} else if (!_.isString(resource)) {
			// Verify resource
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidResource, resource);
		} else if (!_.isNull(input) && !_.isUndefined(input) && !_.isPlainObject(input)) {
			// Verify input
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidInputs, input);
		} else if (!_.isNull(config) && !_.isUndefined(config) && !_.isPlainObject(config)) {
			// Verify config
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidConfig, config);
		}

		// Verify input value
		if (input) {
			if (!_.isNull(input.body) && !_.isUndefined(input.body) && !_.isPlainObject(input.body)) {
				// Verify body
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidBody, input.body);
			} else if (!_.isNull(input.query) && !_.isUndefined(input.query) && !_.isPlainObject(input.query) && !_.isString(input.query)) {
				// Verify query
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidQuery, input.query);
			}
		}

		// Verify config value
		if (config) {
			if (!_.isNull(config.retry) && !_.isUndefined(config.retry) && !_.isBoolean(config.retry)) {
				// Verify retry
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidRetry, config.retry);
			} else if (!_.isNull(config.raw) && !_.isUndefined(config.raw) && !_.isBoolean(config.raw)) {
				// Verify raw
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidRaw, config.raw);
			} else if (!_.isNull(config.api_key) && !_.isUndefined(config.api_key) && !_.isString(config.api_key)) {
				// Verify api_key
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidApiKey, config.api_key);
			}
		}
	}
}

// Exports the constructor
module.exports = function (postmen, method, resource, input, config) {
	return new Payload(postmen, method, resource, input, config);
};

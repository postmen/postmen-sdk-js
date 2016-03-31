'use strict';

// Declare imports
const _ = require('lodash');
const PostmenError = require('./error/error');

// Global variable
const RetryLimit = 5;
const TooManyRequestError = 429;
const RetriableApiError = [500, 502, 503, 504];
const RetriableRequestError = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'];

// Handler class
class Handler {
	/**
	 * Function to check the rate_limit and create the request
	 *
	 * @param postmen {Postmen} - the postmen object
	 * @param payload {object} - The payload object to create the request
	 * @param callback {function}
	 */
	static handlePayload(postmen, payload, callback) {
		let ratelimit = _.get(postmen.rate_limit, _.get(payload.request_object.headers, 'postmen-api-key'));
		if (ratelimit && ratelimit.remaining <= 0) {
			Handler._retryTooManyRequestError(postmen, payload, null, callback);
		} else {
			Handler._makeRequest(postmen, payload, callback);
		}
	}
	/**
	 * Function to create the request
	 *
	 * @param postmen {Postmen} - the postmen object
	 * @param payload {object} - The payload object to create the request
	 * @param callback {function}
	 */
	static _makeRequest(postmen, payload, callback) {
		// console.log(payload);
		// use existing postmen.rate_limit[payload.request_object.headers['postmen-api-key']]
		postmen.request(payload.request_object, function (err, req, body) {
			if (err) {
				// If request return err
				if (_.isObject(err) && RetriableRequestError.indexOf(err.code) !== -1) {
					// Retry if err is retriable
					Handler._retryRequestError(postmen, payload, err, callback);
				} else {
					// Return err if not retriable
					callback(err);
				}
				return;
			}
			// If no err, set rate_limit
			postmen.rate_limit[_.get(payload.request_object.headers, 'postmen-api-key')] = {
				limit: Number(_.get(req.headers, 'x-ratelimit-limit')),
				remaining: Number(_.get(req.headers, 'x-ratelimit-remaining')),
				reset: Number(_.get(req.headers, 'x-ratelimit-reset'))
			};

			if (!_.isObject(body)) {
				// handle if response body is not parsable
				callback(PostmenError.getServerSideError());
			} else if (body.meta.code === TooManyRequestError) {
				// Retry if err is TooManyRequestError
				Handler._retryTooManyRequestError(postmen, payload, body, callback);
			} else if (RetriableApiError.indexOf(body.meta.code) !== -1) {
				// Retry if err is RetriableApiError
				Handler._retryApiError(postmen, payload, body, callback);
			} else if (body.meta.code !== 200 && body.meta.code !== 201) {
				// Return err if it is not OK response
				callback(PostmenError.getApiError(body));
			} else {
				// Response OK
				if (payload.raw) {
					// If raw is true, response string
					callback(null, JSON.stringify(body));
				} else {
					// Else response Object
					callback(null, body);
				}
			}
		});
	}
	/**
	 * Function to retry request error
	 *
	 * @param postmen {postmen}
	 * @param payload {object} - The payload object to create the request
	 * @param err {error} - the error object request return
	 * @param callback {function}
	 */
	static _retryRequestError(postmen, payload, err, callback) {
		// If retry is true && retry_count < 5
		if (payload.retry && payload.retry_count < RetryLimit) {
			// Increase retry_count
			payload.retry_count++;
			setTimeout(function () {
				Handler._makeRequest(postmen, payload, callback);
			}, payload.delay);
			payload.delay = payload.delay * 2;
		} else {
			// Return err
			callback(PostmenError.getRequestError(err, payload.request_object));
		}
	}
	/**
	 * Function to retry 429 too many request error
	 *
	 * @param postmen {postmen}
	 * @param payload {object} - The payload object to create the request
	 * @param body {object} - If it is an RetriableError, body is the response body, else is the request error object
	 * @param callback {function}
	 */
	static _retryTooManyRequestError(postmen, payload, body, callback) {
		if (postmen.rate) {
			let timeout = postmen.rate_limit[payload.request_object.headers['postmen-api-key']].reset - Date.now();
			// Retry after timeout
			setTimeout(function () {
				Handler._makeRequest(postmen, payload, callback);
			}, timeout);
		} else {
			// Return err
			callback(PostmenError.getApiError(body, payload.retry_count));
		}
	}

	/**
	 * Function to retry API error (code >= 500)
	 *
	 * @param postmen {postmen}
	 * @param payload {object} - The payload object to create the request
	 * @param body {object} - If it is an RetriableError, body is the response body, else is the request error object
	 * @param callback {function}
	 */
	static _retryApiError(postmen, payload, body, callback) {
		// If retry is true && retry_count < 5
		if (payload.retry && payload.retry_count < RetryLimit) {
			// Increase retry_count
			payload.retry_count++;
			// Retry after 1s
			setTimeout(function () {
				Handler.handlePayload(postmen, payload, callback);
			}, payload.delay);
			payload.delay = payload.delay * 2;
		} else {
			// Return err
			callback(PostmenError.getApiError(body, payload.retry_count));
		}
	}
}

module.exports = Handler;

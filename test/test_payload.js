'use strict';

const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const Payload = require('./../lib/payload');
const Postmen = require('./../index');

const api_key = 'FAKE_API_KEY';
const region = 'FAKE_REGION';

describe('Test Payload constructor', function () {
	describe('Test error handling', function () {
		it('should throw HandlerInvalidMethod, if method is not `GET`, `POST`, `DELETE`, `PUT`', function () {
			let expected_error = 'HandlerError: Invalid Method value';
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, '');
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Payload(postmen, null);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Payload(postmen, 999);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Payload(postmen, true);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Payload(postmen, {});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should throw HandlerInvalidResource, if resource is invalid', function () {
			let expected_error = Error('HandlerError: Invalid resource value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', null);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', 999);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', true);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', {});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidInputs, if options is invalid', function () {
			let expected_error = Error('HandlerError: Invalid Inputs value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', '');
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', 999);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', true);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', false);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidConfig, if options is invalid', function () {
			let expected_error = Error('HandlerError: Invalid Config value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', {}, {});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, 999);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, true);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, false);
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidBody, if body is invalid', function () {
			let expected_error = Error('HandlerError: Invalid Body value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', {
					body: ''
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {
					body: 999
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {
					body: true
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {
					body: false
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidQuery, if query is invalid', function () {
			let expected_error = Error('HandlerError: Invalid Query value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', {
					query: ''
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {
					query: 999
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {
					query: true
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {
					query: false
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidRetry, if retry is invalid', function () {
			let expected_error = Error('HandlerError: Invalid Retry value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', {}, {
					retry: ''
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					retry: 999
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					retry: {}
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidRaw, if retry is invalid', function () {
			let expected_error = Error('HandlerError: Invalid Raw value');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', {}, {
					raw: ''
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					raw: 999
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					raw: {}
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});

		it('should throw HandlerInvalidApiKey, if api_key is invalid', function () {
			let expected_error = Error('HandlerError: Invalid API key');
			let postmen = Postmen(api_key, region);
			try {
				Payload(postmen, 'GET', '', {}, {
					api_key: ''
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					api_key: 999
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					api_key: null
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
			try {
				Payload(postmen, 'GET', '', {}, {
					api_key: true
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error.message);
			}
		});
	});

	describe('Test Correct cases', function () {
		describe('Test Optional argument', function () {
			it('should construct with default raw = false', function () {
				let postmen = Postmen(api_key, region);
				let payload = Payload(postmen, 'GET', '');
				expect(payload.raw).to.equal(false);
			});
			it('should override correct with raw = true', function () {
				let postmen = Postmen(api_key, region);
				let payload = Payload(postmen, 'GET', '', {}, {raw: true});
				expect(payload.raw).to.equal(true);
			});
		});

		describe('Test Request Object', function () {
			it('should set correct headers', function () {
				let postmen = Postmen(api_key, region);
				let result = Payload(postmen, 'GET', '');
				let headers = {
					'Connection': 'keep-alive',
					'as-api-key': api_key,
					'Content-Type': 'application/json',
					'x-postmen-agent': '1.0.0'
				};
				expect(result.request_object.headers).to.deep.equal(headers);
			});

			it('should set correct url', function () {
				let postmen = Postmen(api_key, region);
				let result1 = Payload(postmen, 'GET', '/aaa/bbb');
				expect(result1.request_object.url).to.equal(postmen.endpoint + '/aaa/bbb');

				postmen.endpoint = 'http://example.com';
				let result2 = Payload(postmen, 'GET', '/ccc/ddd');
				expect(result2.request_object.url).to.equal(postmen.endpoint + '/ccc/ddd');
			});

			it('should set correct query object', function () {
				let expect_qs = {
					a: '123'
				};
				let postmen = Postmen(api_key, region);
				let result1 = Payload(postmen, 'GET', '/aaa/bbb', {query: expect_qs});
				expect(result1.request_object.qs).to.deep.equal(expect_qs);
			});

			it('should set correct query string', function () {
				let expect_qs_string = 'aa=123&bb=456';
				let expect_qs_obj = {
					aa: '123',
					bb: '456'
				};
				let postmen = Postmen(api_key, region);
				let result1 = Payload(postmen, 'GET', '/aaa/bbb', {query: expect_qs_string});
				expect(result1.request_object.qs).to.deep.equal(expect_qs_obj);
			});

			it('should set correct retry value', function () {
				// Default to true
				let postmen = Postmen(api_key, region, {
					retry: true
				});

				// Equal to default retry
				let result1 = Payload(postmen, 'GET', '');
				expect(result1.retry).to.equal(true);

				// Overwrite default retry
				let result2 = Payload(postmen, 'GET', '', {}, {
					retry: false
				});
				expect(result2.retry).to.equal(false);

				// Default to false
				postmen = Postmen(api_key, region, {
					retry: false
				});

				// Equal to default retry
				let result3 = Payload(postmen, 'GET', '');
				expect(result3.retry).to.equal(false);

				// Overwrite default retry
				let result4 = Payload(postmen, 'GET', '', {}, {
					retry: true
				});
				expect(result4.retry).to.equal(true);
			});

			it('should set correct raw value', function () {
				// Default is false
				let postmen = Postmen(api_key, region);

				// Equal to default, false
				let result1 = Payload(postmen, 'GET', '');
				expect(result1.raw).to.equal(false);

				// Overwrite default raw, to true
				let result2 = Payload(postmen, 'GET', '', {}, {
					raw: true
				});
				expect(result2.raw).to.equal(true);

				// Overwrite default raw, still false
				let result3 = Payload(postmen, 'GET', '', {}, {
					raw: false
				});
				expect(result3.raw).to.equal(false);
			});

			it('should have retry count, if retry = true', function () {
				// Default to true
				let postmen = Postmen(api_key, region, {
					retry: true
				});

				// Retry count = 0
				let result1 = Payload(postmen, 'GET', '');
				expect(result1.retry_count).to.equal(1);

				// Default to false
				postmen = Postmen(api_key, region, {
					retry: false
				});

				// Retry count is undefined
				let result2 = Payload(postmen, 'GET', '');
				expect(result2.retry_count).to.equal(undefined);
			});

			it('should override default api_key, if api_key is defined', function () {
				// Default to true
				let postmen = Postmen(api_key, region);

				let other_api_key = 'FAKE_API_KEY';
				let result = Payload(postmen, 'GET', '', {
					api_key: other_api_key
				});
				expect(result.request_object.headers['as-api-key']).to.equal(other_api_key);
			});
		});

		describe('Test Chainable Function', function () {
			let postmen;
			let expected_result = {
				meta: {
					code: 200
				},
				data: {}
			};

			before(function () {
				// Construct with valid api_key
				postmen = Postmen(api_key, region);

				// Stub request to throw
				sinon.stub(postmen, 'request', function (options, callback) {
					callback(null, {}, expected_result);
				});
			});

			beforeEach(function () {
				postmen.request.reset();
			});


			it('should set correct api_key', function (done) {
				postmen.useApiKey('OTHER_FAKE_API_KEY').get('labels', function (err, result) {
					expect(postmen.request.args[0][0].headers['as-api-key']).equal('OTHER_FAKE_API_KEY');
					done();
				});
			});

			it('should set correct setProxy', function (done) {
				postmen.setProxy('PROXY_STRING').get('labels', function (err, result) {
					expect(postmen.request.args[0][0].proxy).equal('PROXY_STRING');
					done();
				});
			});

			it('should set correct setRetry', function (done) {
				postmen.setRetry(false).get('labels', function (err, result) {
					expect(postmen.retry).equal(false);
					done();
				});
			});

			it('should set correct setRaw', function (done) {
				postmen.setRaw(true).get('labels', function (err, result) {
					expect(postmen.raw).equal(true);
					done();
				});
			});
		});
	});
});

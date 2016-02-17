
var nock = require('nock');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// const http = require('http');
// const request = require('request');
var Postmen = require('./../index');

var api_key = 'HEHE_API_KEY';
var region = 'testing';
var nock_endpoint = 'https://testing-api.postmen.com';

describe('Unit tests', function () {
	this.timeout(20000);

	var scope;
	var sandbox;
	var header_response = {
		'x-ratelimit-limit': 999,
		'x-ratelimit-remaining': 999,
		'x-ratelimit-reset': 999
	};
	before(function () {
		sandbox = sinon.sandbox.create();
	});

	beforeEach(function () {
		sandbox.reset();
		sandbox.restore();
	});

	describe('Exceptions tests', function () {

		describe('testNoException', function () {
			var mock_result = {
				'meta': {
					'code': 200,
					'message': 'OK',
					'details': []
				},
				'data': {
					'id': '54ffc9d0-1234-1111-2222-ffedd94c241d',
					'status': 'created',
					'created_at': '2016-02-15T08: 35: 52+00: 00',
					'updated_at': '2016-02-15T08: 35: 59+00: 00'
				}
			};

			before(function () {
				scope = nock(nock_endpoint)
					.get('/labels/mock-label-id-123566')
					.reply(200, mock_result);
			});

			it('ensure response meta code 200 is not causing exception', function (done) {
				var postmen = new Postmen(api_key, region);
				postmen.get('labels', 'mock-label-id-123566', function (err, body) {
					expect(body).to.deep.equal(mock_result);
					done();
				});
			});
		});

		it('testNonParsable - ensure non parsable string will raise an exception', function (done) {
			var mock_result = '<html>NOT A VALID JSON STRING</html>';
			scope = nock(nock_endpoint)
				.get('/labels/mock-label-id-123566')
				.reply(200, mock_result);
			var postmen = new Postmen(api_key, region);
			postmen.get('labels', 'mock-label-id-123566', function (err, body) {
				expect(err.code).to.equal(500);
				done();
			});
		});


		it('testExceptionAttributes - ensure if retryable attribute is set it will override default value', function () {
			var config  = {retry:false};
			var postmen1 = new Postmen(api_key, region, config);
			var postmen2 = new Postmen(api_key, region);
			expect(postmen1.config.retry).to.false;
			expect(postmen2.config.retry).to.true;
		});


		it('testNetworkError - will throw error if HTTP request failure', function (done) {
			var network_error = new Error();
			network_error.code = 'ECONNRESET';
			var postmen = new Postmen(api_key, region);
			sandbox.stub(postmen, 'request', function (request_object, callback) {
				callback(network_error);
			});
			postmen.get('labels', 'mock-label-id-123566', function (err, body) {
				expect(err.message).to.equal('Failed to perform HTTP request');
				done();
			});
		});
	});

	describe('Optional arguments tests', function () {
		it('testArgumentsSafeMode - safe = true will stop exception from being raised', function (done) {
			var mock_result = '<html>NOT A VALID JSON STRING</html>';
			scope = nock(nock_endpoint)
					.get('/labels/1234')
					.reply(200, mock_result, header_response);
			var config = {safe:true};
			var postmen = new Postmen(api_key, region, config);
			postmen.get('labels', '1234', function (err, body) {
				expect(err).to.not.exist;
				expect(postmen.getError().code).to.equal(500);
				done();
			});
		});

		// it('testArgumentsRetryDelay - ensure delay time increases by factor of 2 after each retry', function (done) {
		// 	var mock_result = {
		// 		'meta': {
		// 			'code': 4155,
		// 			'message': 'Access to shipper_account locked during manifest/cancel-label operation.',
		// 			'details': [],
		// 			'retryable': true
		// 		},
		// 		'data': {}
		// 	};
		// 	scope = nock(nock_endpoint)
		// 		.get('/labels/12345').reply(200, mock_result).get('/labels/12345').reply(200, mock_result).get('/labels/12345').reply(200, mock_result).get('/labels/12345').reply(200, mock_result).get('/labels/12345').reply(200, mock_result);

		// 	var postmen = new Postmen(api_key, region);
		// 	var spy = sinon.spy(postmen, '_retryApiError');
		// 	postmen.get('labels', '12345', function (err, body) {
		// 		var is_right_factor = true;
		// 		for (var i = 1; i < spy.callCount; i++) {
		// 			var lead = spy.args[i - 1][0].delay;
		// 			var tail = spy.args[i][0].delay;
		// 			if (tail/lead !== 2) {
		// 				is_right_factor = false;
		// 			}
		// 		}
		// 		expect(is_right_factor).to.true;
		// 		expect(err).to.exist;
		// 		done();
		// 	});
		// });

		// // not finished
		// it('testArgumentsRetryExceeded - ensure SDK will not retry after 5 failed requests', function (done) {
		// 	var payload = {
		// 		request_object: {},
		// 		retry: true,
		// 		delay: 1000,
		// 		retries : 5,
		// 		raw: false
		// 	};
		// 	var mock_result = {
		// 		'meta': {
		// 			'code': 415511111,
		// 			'message': 'retryable error msg.',
		// 			'details': [],
		// 			'retryable': true
		// 		},
		// 		'data': {}
		// 	};
		// 	var postmen = new Postmen(api_key, region);
		// 	sandbox.stub(postmen, 'request', function (request_object, callback) {
		// 		callback(null, header_response, mock_result);
		// 	});
		// 	var spy = sinon.spy(postmen, 'makeRequest');
		// 	spy.withArgs(payload, mock_result, function(err, result){
		// 		console.log(err);
		// 		console.log(result);
		// 		done();
		// 	});
		// });

		it('testArgumentsRetryDisabled - ensure SDK will not retry if this option is disabled', function (done) {
			var mock_result = {
				'meta': {
					'code': 4155,
					'message': 'Access to shipper_account locked during manifest/cancel-label operation.',
					'details': [],
					'retryable': true
				},
				'data': {}
			};

			scope = nock(nock_endpoint).get('/labels/12345').reply(200, mock_result);
			var config = {retry: false};
			var postmen = new Postmen(api_key, region, config);
			postmen.get('labels', '12345', function (err, body) {
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});

		it('testArgumentsNonRetryable - ensure SDK will not retry if non-retryable error occurs', function (done) {
			var mock_result = {
				'meta': {
					'code': 4153,
					'message': 'Item does not exist.',
					'details': [],
					'retryable': false
				},
				'data': {}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(200, mock_result);

			var postmen = new Postmen(api_key, region);
			postmen.get('labels', '12345', function (err, body) {
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});

		it('testArgumentsNonRetryable - ensure SDK will not retry if non-retryable error occurs', function (done) {
			var mock_result = {
				'meta': {
					'code': 4153,
					'message': 'Item does not exist.',
					'details': [],
					'retryable': false
				},
				'data': {}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(200, mock_result);

			var postmen = new Postmen(api_key, region);
			postmen.get('labels', '12345', function (err, body) {
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});

		it('testArgumentsNonRetryable - ensure SDK will not retry if non-retryable error occurs', function (done) {
			var mock_result = {
				'meta': {
					'code': 4153,
					'message': 'Item does not exist.',
					'details': [],
					'retryable': false
				},
				'data': {}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(200, mock_result);

			var postmen = new Postmen(api_key, region);
			postmen.get('labels', '12345', function (err, body) {
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});

		it('raise an exception if rate limit is exceeded and rate is disabled', function (done) {
			var mock_result = {
				'meta': {
					'code': 429,
					'message': '',
					'details': [],
					'retryable': true
				},
				'data': {}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(429, mock_result);
			var config = {rate: false, retry: false};
			var postmen = new Postmen(api_key, region, config);
			postmen.get('labels', '12345', function (err, body) {
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});

		it('test if data will be processed if response headers are incorrect', function (done) {
			var mock_result = {
				'meta': {
					'code': 200,
					'message': '',
					'details': [],
					'retryable': false
				},
				'data': {'msg': 'Anythings is ok.'}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(429, mock_result);
			var config = {rate: false, retry: false};
			var postmen = new Postmen(api_key, region, config);
			postmen.get('labels', '12345', function (err, body) {
				expect(err).to.not.exist;
				expect(body.meta.code).to.equal(mock_result.meta.code);
				done();
			});
		});

		it('test if raw is enabled a JSON string is returned as response', function (done) {
			var mock_result = {
				'meta': {
					'code': 200,
					'message': '',
					'details': [],
					'retryable': false
				},
				'data': {'msg': 'Anythings is ok.'}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(429, mock_result);
			var config = {raw: true};
			var postmen = new Postmen(api_key, region, config);
			postmen.get('labels', '12345', function (err, body) {
				expect(err).to.not.exist;
				expect(body).to.deep.equal(JSON.stringify(mock_result));
				done();
			});
		});

		it('ensure if raw is enabled exceptions returned from API are ignored', function (done) {
			var mock_result = {
				'meta': {
					'code': 8888,
					'message': 'unknown error.',
					'details': [],
					'retryable': false
				},
				'data': {'msg': 'Anythings is wrong.'}
			};
			scope = nock(nock_endpoint).get('/labels/12345').reply(200, mock_result);
			var config = {raw: true};
			var postmen = new Postmen(api_key, region, config);
			postmen.get('labels', '12345', function (err, body) {
				expect(err).to.not.exist;
				expect(body).to.deep.equal(JSON.stringify(mock_result));
				done();
			});
		});
	});

	describe('Context functions tests', function () {
		it.only('test get function make a correct URL', function (done) {
			var mock_result = {
				'meta': {
					'code': 200,
					'message': 'okay.',
					'details': [],
					'retryable': false
				},
				'data': {'msg': 'Anythings is ok.'}
			};
			var scope = nock(nock_endpoint).get('/resource/123').reply(200, mock_result);
			var postmen = new Postmen(api_key, region);
			var spy = sinon.spy(postmen, 'makePayload');
			postmen.get('resource', '123', function (err, result) {
				console.log(spy.args[0][1]);
				expect(err).to.not.exist;
				// expect(spy.args[0][1]).to.equal('/v3/resource');
				done();
			});
		});

		// it('test get function make a correct URL', function (done) {
		// 	var mock_result = {
		// 		'meta': {
		// 			'code': 200,
		// 			'message': 'okay.',
		// 			'details': [],
		// 			'retryable': false
		// 		},
		// 		'data': {'msg': 'Anythings is ok.'}
		// 	};
		// 	var scope = nock(nock_endpoint).get('/resource/123').reply(200, mock_result);
		// 	var postmen = new Postmen(api_key, region);
		// 	var spy = sinon.spy(postmen, 'makePayload');
		// 	postmen.get('resource', '123', function (err, result) {
		// 		console.log(spy.args[0][1]);
		// 		expect(err).to.not.exist;
		// 		// expect(spy.args[0][1]).to.equal('/v3/resource');
		// 		done();
		// 	});
		// });

	});
});

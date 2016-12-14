'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const http = require('http');
const http_proxy = require('http-proxy');
const Postmen = require('./../index');
const Handler = require('./../lib/handler');


const api_key = 'FAKE_API_KEY';
const region = 'FAKE_REGION';
const default_endpoint = 'https://FAKE_REGION-api.postmen.com/v3';

describe('Test postmen.call()', function () {
	this.timeout(600000);

	let sandbox;

	before(function () {
		sandbox = sinon.sandbox.create();
	});

	beforeEach(function () {
		sandbox.reset();
		sandbox.restore();
	});

	// Body
	let body = {
		'async': false,
		'return_shipment': false,
		'paper_size': 'a4',
		'ship_date': '2016-02-17',
		'service_type': 'sfb2c_au_airmail',
		'is_document': false,
		'customs': {
			'purpose': 'gift'
		},
		'invoice': {
			'date': '2016-02-24'
		},
		'references': [
			'Handle with care'
		],
		'shipper_account': {
			'id': '5368fc00-466c-4de7-9980-d3e06f4a460d'
		},
		'billing': {
			'paid_by': 'shipper',
			'method': {
				'type': 'account',
				'account_number': '1234567890'
			}
		},
		'shipment': {
			'ship_from': {
				'contact_name': 'Jameson McLaughlin',
				'company_name': 'Jameson Inc',
				'phone': '736-010-3577',
				'street1': '8918 Borer Ramp',
				'city': 'Los Angeles',
				'state': 'CA',
				'postal_code': '90001',
				'country': 'HKG',
				'type': 'business'
			},
			'ship_to': {
				'contact_name': 'Jon Poole',
				'street1': '212 South Street',
				'city': 'BRISBANE',
				'state': 'QLD',
				'postal_code': '4000',
				'country': 'AUS',
				'phone': '6034919890',
				'type': 'residential'
			},
			'parcels': [
				{
					'description': 'iMac & iCherry',
					'box_type': 'custom',
					'weight': {
						'value': 5.56,
						'unit': 'kg'
					},
					'dimension': {
						'width': 65,
						'height': 52,
						'depth': 21,
						'unit': 'cm'
					},
					'items': [
						{
							'description': 'iMac (Retina 5K, 24-inch, Late 2014)',
							'origin_country': 'USA',
							'quantity': 1,
							'price': {
								'amount': 1999,
								'currency': 'USD'
							},
							'weight': {
								'value': 5.54,
								'unit': 'kg'
							},
							'sku': 'imac2014',
							'hs_code': '1111111'
						}
					]
				}
			]
		}
	};

	describe('Test using proxy', function () {
		let proxy;
		let server;
		let expected_result = {
			meta: {
				code: 200
			},
			message: 'proxied!'
		};

		before(function () {
			proxy = http_proxy.createProxyServer({
				target: 'http://localhost:9000'
			}).listen(8000);

			server = http.createServer(function (req, res) {
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				res.write(JSON.stringify(expected_result));
				res.end();
			}).listen(9000);
		});

		after(function () {
			proxy.close();
			server.close();
		});

		it('should return proxied result', function (done) {
			// Construct with valid api_key
			let postmen = Postmen(api_key, region, {
				endpoint: 'http://google.com',
				proxy: 'http://localhost:8000'
			});
			postmen.get('/labels', function (err, result) {
				expect(err).to.equal(null);
				expect(result).to.deep.equal(expected_result);
				done();
			});
		});
	});

	describe('Test correct cases', function () {
		let postmen;
		let expected_result = {
			meta: {
				code: 200
			},
			data: {}
		};
		let mock_req = {
			headers: {
				'x-ratelimit-limit': 999,
				'x-ratelimit-remaining': 999,
				'x-ratelimit-reset': 999
			}
		};

		before(function () {
			// Construct with valid api_key
			postmen = Postmen(api_key, region);

			// Stub request to throw
			sinon.stub(postmen, 'request', function (options, callback) {
				callback(null, mock_req, expected_result);
			});
		});

		beforeEach(function () {
			postmen.request.reset();
		});

		it('should work with Postmen getRateLimit', function (done) {
			let request_object = {
				FAKE_API_KEY: {
					'limit': 999,
					'remaining': 999,
					'reset': 999
				}
			};
			postmen.get('labels', function (err, result) {
				expect(postmen.getRateLimit()).to.deep.equal(request_object);
				done();
			});
		});

		it('should work with get(path) with callback', function (done) {
			postmen.get('labels', function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					method: 'GET',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				expect(result).to.deep.equal(expected_result);
				done();
			});
		});

		it('should work with get(path) with promise', function (done) {
			postmen.get('labels').then(function (result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					method: 'GET',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				expect(result).to.deep.equal(expected_result);
				done();
			});
		});

		it('should work with create(path, {body}) with callback', function (done) {
			postmen.create('labels', {
				body: body
			}, {}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					body: body,
					method: 'POST',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				expect(result).to.deep.equal(expected_result);
				done();
			});
		});

		it('should work with `platform` header', function (done) {
			postmen.create('labels', {
				body: body,
				headers: {
					platform: 'csv'
				}
			}, {}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0',
						'platform': 'csv'
					},
					url: default_endpoint + '/labels',
					body: body,
					method: 'POST',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				expect(result).to.deep.equal(expected_result);
				done();
			});
		});

		it('should work with create(path, {body}) with promise', function (done) {
			postmen.create('labels', {
				body: body
			}, {}).then(function (result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					body: body,
					method: 'POST',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				expect(result).to.deep.equal(expected_result);
				done();
			});
		});

		it('should work with get(path, {body, query}) by callback', function (done) {
			let query = {
				fields: 'slug,name'
			};
			postmen.get('labels', {
				query: query
			}, {}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					qs: query,
					method: 'GET',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				done();
			});
		});

		it('should work with get(path, {body, query}) by promise', function (done) {
			let query = {
				fields: 'slug,name'
			};
			postmen.get('labels', {
				query: query
			}, {}).then(function (result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					qs: query,
					method: 'GET',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				done();
			});
		});

		it('should work with get(path, {raw = true})', function (done) {
			postmen.get('labels', {}, {
				raw: true
			}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					method: 'GET',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				expect(_.isString(result)).to.equal(true);
				done();
			});
		});
	});

	describe('Test Proxy method: GET, POST, PUT, DELETE', function () {
		let postmen;
		let expected_result = {
			meta: {
				code: 200
			},
			data: {}
		};
		let mock_req = {
			headers: {
				'x-ratelimit-limit': 999,
				'x-ratelimit-remaining': 999,
				'x-ratelimit-reset': 999
			}
		};

		before(function () {
			// Construct with valid api_key
			postmen = Postmen(api_key, region);

			// Stub request to throw
			sinon.stub(postmen, 'request', function (options, callback) {
				callback(null, mock_req, expected_result);
			});
		});

		beforeEach(function () {
			postmen.request.reset();
		});

		it('should work with handler.GET(...)', function (done) {
			postmen.GET('/labels', {}, {}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					method: 'GET',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				done();
			});
		});

		it('should work with handler.POST(...)', function (done) {
			// Body
			postmen.POST('/labels', {body: body}, {}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					method: 'POST',
					body: body,
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				done();
			});
		});

		it('should work with handler.PUT(...)', function (done) {
			postmen.PUT('/labels', {body: body}, {}, function (err, result) {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels',
					method: 'PUT',
					body: body,
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				done();
			});
		});

		it('should work with handler.DELETE(...)', function (done) {
			postmen.DELETE('/labels/0000000000', {}, {}, function () {
				let request_object = {
					headers: {
						'Connection': 'keep-alive',
						'postmen-api-key': api_key,
						'Content-Type': 'application/json',
						'x-postmen-agent': '1.0.0'
					},
					url: default_endpoint + '/labels/0000000000',
					method: 'DELETE',
					json: true
				};
				expect(postmen.request.args[0][0]).to.deep.equal(request_object);
				done();
			});
		});
	});

	describe('Test error handling', function () {
		it('should promise with response error by using get, if request throw error', function (done) {
			let expected_error = new Error('Some error');
			let postmen = Postmen(api_key, region);
			// Stub request to throw
			sandbox.stub(postmen, 'request', function (request_object, callback) {
				callback(expected_error);
			});
			postmen.get('/labels').catch(function (err) {
				expect(err.message).to.equal(expected_error.message);
				done();
			});
		});

		it('should promise with response error by using create, if request throw error', function (done) {
			let expected_error = new Error('Some error');
			let postmen = Postmen(api_key, region);
			let payload = {};
			// Stub request to throw
			sandbox.stub(postmen, 'request', function (request_object, callback) {
				callback(expected_error);
			});
			postmen.create('/labels', {body: payload}).catch(function (err) {
				expect(err.message).to.equal(expected_error.message);
				done();
			});
		});

		it('should callback with response error, if response code != 200', function (done) {
			let expected_message = 'Invalid API key.';
			let mock_req = {
				headers: {
					'x-ratelimit-limit': 999,
					'x-ratelimit-remaining': 999,
					'x-ratelimit-reset': 999
				}
			};
			let result = {
				meta: {
					code: 401,
					message: 'Invalid API key.',
					type: 'Unauthorized'
				},
				data: {}
			};
			// Construct with invalid api_key
			let postmen = Postmen('', region);
			sandbox.stub(postmen, 'request', function (request_object, callback) {
				callback(null, mock_req, result);
			});
			postmen.call('GET', '/labels', {}, {}, function (err) {
				expect(err.message).to.equal(expected_message);
				done();
			});
		});

		it('should callback with response error, if response body is not a object', function (done) {
			let mock_req = {
				headers: {}
			};
			let mock_html_req = '<html>THIS IS NOT A VALID JSON OBJECT</html>';
			let expected_error_msg = 'Something went wrong on server side';
			let postmen = Postmen(api_key, region);
			// Stub request to throw
			sandbox.stub(postmen, 'request', function (request_object, callback) {
				callback(null, mock_req, mock_html_req);
			});
			postmen.call('GET', '/labels', {}, {}, function (err) {
				expect(err.message).to.equal(expected_error_msg);
				done();
			});
		});

		it('should callback with response error, if request throw error', function (done) {
			let expected_error = new Error('Some error');
			let postmen = Postmen(api_key, region);
			// Stub request to throw
			sandbox.stub(postmen, 'request', function (request_object, callback) {
				callback(expected_error);
			});
			postmen.call('GET', '/labels', {}, {}, function (err) {
				expect(err.message).to.equal(expected_error.message);
				done();
			});
		});

		it('should callback with response error, if method is invalid', function () {
			let method = 'invalid';
			let expected_error = 'HandlerError: Invalid Method value';
			let postmen = Postmen(api_key, region);
			try {
				postmen.call(method, '/labels', null);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should callback with response error, if path is invalid', function () {
			let expected_error = 'HandlerError: Invalid resource value';
			let postmen = Postmen(api_key, region);
			try {
				postmen.call('GET', null);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should callback with response error, if body is invalid', function () {
			let expected_error = 'HandlerError: Invalid Body value';
			let postmen = Postmen(api_key, region);
			try {
				postmen.call('GET', '/labels', {
					body: 'body'
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should callback with response error, if query is invalid', function () {
			let expected_error = 'HandlerError: Invalid Query value';
			let postmen = Postmen(api_key, region);
			try {
				postmen.call('GET', '/labels', {
					query: 'query'
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should callback with response error, if retry is invalid', function () {
			let expected_error = 'HandlerError: Invalid Retry value';
			let postmen = Postmen(api_key, region);
			try {
				postmen.call('GET', '/labels', {
					retry: 'retry'
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should callback with response error, if raw is invalid', function () {
			let expected_error = 'HandlerError: Invalid Raw value';
			let postmen = Postmen(api_key, region);
			try {
				postmen.call('GET', '/labels', {
					raw: 'raw'
				});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});
	});

	describe('Test RateLimit', function () {
		it('should request again until reset timestamp, if return 429 and rate is true', function (done) {
			let now = Date.now();
			let mock_req = {
				headers: {
					'x-ratelimit-limit': 600,
					'x-ratelimit-remaining': 0,
					'x-ratelimit-reset': now + 5
				}
			};
			let mock_result1 = {
				meta: {
					code: 429
				},
				data: {}
			};
			let mock_result2 = {
				meta: {
					code: 200
				},
				data: {}
			};
			// Construct with valid api_key
			let postmen = Postmen(api_key, region);
			// Stub request to throw
			let request = sandbox.stub(postmen, 'request');
			request.onCall(0).callsArgWith(1, null, mock_req, mock_result1);
			request.onCall(1).callsArgWith(1, null, mock_req, mock_result2);

			postmen.call('GET', 'labels', {}, {}, function (first_err, first_result) {
				let diff = Date.now() - now;
				expect(diff).to.be.gte(5);
				done();
			});
		});

		it('should not request again, if return 429 and rate is false', function (done) {
			let now = Math.ceil(Date.now() / 1000);
			let mock_req = {
				headers: {
					'x-ratelimit-limit': 600,
					'x-ratelimit-remaining': 0,
					'x-ratelimit-reset': now + 5
				}
			};
			let mock_result = {
				meta: {
					code: 429
				},
				data: {}
			};
			// Construct with valid api_key
			let postmen = Postmen(api_key, region, {
				rate: false
			});
			// Stub request to throw
			let request = sandbox.stub(postmen, 'request');
			request.onCall(0).callsArgWith(1, null, mock_req, mock_result);

			postmen.call('GET', '/labels', {}, {}, function (err, result) {
				let diff = Math.ceil(Date.now() / 1000) - now;
				expect(diff).to.be.lte(1);
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});
	});

	describe('Test retry flag', function () {
		describe('Test handlePayload', function () {
			it('should called _retryTooManyRequestError if ratelimit.remaining < 0 ', function (done) {
				let payload = {
					request_object: {
						headers: {
							'postmen-api-key': 'FAKE_API_KEY'
						}
					}
				};

				let postmen = Postmen(api_key, region);
				postmen.rate_limit.FAKE_API_KEY = {
					remaining: 0
				};
				let spy = sandbox.spy(Handler, '_retryTooManyRequestError');
				Handler.handlePayload(postmen, payload, function (err, result) {
					expect(spy.called).to.deep.equal(true);
					done();
				});
			});
		});

		describe('Test retry function _retryRequestError', function () {
			let payload = {
				request_object: {
					headers: {
						'postmen-api-key': 'FAKE_API_KEY',
						'Content-Type': 'application/json',
						Connection: 'keep-alive',
						'x-postmen-agent': '1.0.0'
					},
					url: 'https://FAKE_REGION-api.postmen.com/v3/labels',
					method: 'GET',
					json: true
				},
				retry: true,
				raw: false,
				delay: 1000,
				retry_count: 5
			};

			it('should call _retryRequestError if ETIMEDOUT error', function (done) {
				let postmen = Postmen(api_key, region);
				let error = new Error();
				error.code = 'ETIMEDOUT';
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(error);
				});
				let spy = sandbox.spy(Handler, '_retryRequestError');
				Handler._makeRequest(postmen, payload, function (err, result) {
					expect(spy.called).to.deep.equal(true);
					done();
				});
			});

			it('should call _retryRequestError if ECONNRESET error', function (done) {
				let postmen = Postmen(api_key, region);
				let error = new Error();
				error.code = 'ECONNRESET';
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(error);
				});
				let spy = sandbox.spy(Handler, '_retryRequestError');
				Handler._makeRequest(postmen, payload, function (err, result) {
					expect(spy.called).to.deep.equal(true);
					done();
				});
			});

			it('should call _retryRequestError if ECONNREFUSED error', function (done) {
				let postmen = Postmen(api_key, region);
				let error = new Error();
				error.code = 'ECONNREFUSED';
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(error);
				});
				let spy = sandbox.spy(Handler, '_retryRequestError');
				Handler._makeRequest(postmen, payload, function (err, result) {
					expect(spy.called).to.deep.equal(true);
					done();
				});
			});

			it('should not call _retryRequestError after retry 5 times', function (done) {
				let postmen = Postmen(api_key, region);
				let error = new Error();
				error.code = 'ETIMEDOUT';
				let clock = sinon.useFakeTimers(Date.now());
				payload.retry_count = 4;
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(error);
				});
				Handler._retryRequestError(postmen, payload, error, function (err, result) {
					expect(err.code).to.equal(error.code);
					done();
				});
				clock.tick(1000);
				clock.restore();
			});

			it('should retry _retryRequestError with delay time increases by factor of 2', function (done) {
				payload = {
					request_object: {
						headers: {
							'postmen-api-key': 'FAKE_API_KEY',
							'Content-Type': 'application/json',
							Connection: 'keep-alive',
							'x-postmen-agent': '1.0.0'
						},
						url: 'https://FAKE_REGION-api.postmen.com/v3/labels',
						method: 'GET',
						json: true
					},
					retry: true,
					raw: false,
					delay: 1000,
					retry_count: 1
				};
				let error = new Error();
				let postmen = Postmen(api_key, region);
				let delay = 1000;
				for (let i = 0; i < 4; i++) {
					Handler._retryRequestError(postmen, payload, error, function (err, result) {
					});
					expect(payload.delay / delay).to.equal(2);
					delay = payload.delay;
				}
				done();
			});

			it('should throw error when call _retryRequestError with config retry = false', function (done) {
				let error = new Error();
				let config = {
					retry: false
				};
				let postmen = Postmen(api_key, region, config);
				Handler._retryRequestError(postmen, payload, error, function (err, result) {
					expect(err.data).to.deep.equal(payload.request_object);
					expect(result).to.equal(undefined);
					done();
				});
			});
		});

		describe('Test retry function _retryApiError', function () {
			let payload = {
				request_object: {
					headers: {
						'postmen-api-key': 'FAKE_API_KEY',
						'Content-Type': 'application/json',
						Connection: 'keep-alive',
						'x-postmen-agent': '1.0.0'
					},
					url: 'https://FAKE_REGION-api.postmen.com/v3/labels',
					method: 'GET',
					json: true
				},
				retry: true,
				raw: false,
				delay: 1000,
				retry_count: 1
			};

			let mock_result1 = {
				meta: {
					code: 500,
					message: '',
					type: ''
				},
				data: {}
			};

			let mock_req = {
				headers: {}
			};

			it('should call _retryApiError when get a RetriableApiError error', function (done) {
				payload.retry = false;
				let postmen = Postmen(api_key, region);
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(null, mock_req, mock_result1);
				});
				let spy = sandbox.spy(Handler, '_retryApiError');
				Handler._makeRequest(postmen, payload, function (err, result) {
					expect(spy.called).to.equal(true);
					done();
				});
			});

			it('should throw err when call _retryApiError with retry = false', function (done) {
				payload.retry = false;
				let postmen = Postmen(api_key, region);
				Handler._retryApiError(postmen, payload, mock_result1, function (err, result) {
					expect(err).to.exist;
					expect(result).to.equal(undefined);
					done();
				});
			});

			it('should not retry _retryApiError after retry 5 times', function (done) {
				let clock = sinon.useFakeTimers(Date.now());
				let postmen = Postmen(api_key, region);
				payload.retry = true;
				payload.retry_count = 4;
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(null, mock_req, mock_result1);
				});
				Handler._retryApiError(postmen, payload, mock_result1, function (err, result) {
					expect(err.code).to.equal(500);
					done();
				});
				clock.tick(1000);
				clock.restore();
				sandbox.reset();
				sandbox.restore();
			});
		});
	});
});

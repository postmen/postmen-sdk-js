'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const http = require('http');
const http_proxy = require('http-proxy');
const Postmen = require('./../index');

const api_key = 'SOME_API_KEY'; // please use your Postmen api key
const region = 'SOME_REGION';
const default_endpoint = 'https://SOME_REGION-api.postmen.com/v3';

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
			postmen.call('GET', '/labels', function (err, result) {
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

		it('should work with get(path) with callback', function (done) {
			postmen.get('/labels', function (err, result) {
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
			postmen.get('/labels').then(function (result) {
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
			postmen.create('/labels', {
				body: body
			}, function (err, result) {
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

		it('should work with create(path, {body}) with promise', function (done) {
			postmen.create('/labels', {
				body: body
			}).then(function (result) {
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
			postmen.get('/labels', {
				query: query
			}, function (err, result) {
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
			postmen.get('/labels', {
				query: query
			}).then(function (result) {
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
			postmen.get('/labels', {
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
			postmen.GET('/labels', function (err, result) {
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
			postmen.POST('/labels', {
				body: body
			}, function (err, result) {
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
			postmen.PUT('/labels', {
				body: body
			}, function (err, result) {
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
			postmen.DELETE('/labels/0000000000', function () {
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
			postmen.call('GET', '/labels', function (err) {
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
			postmen.call('GET', '/labels', function (err) {
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
			postmen.call('GET', '/labels', function (err) {
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
			let expected_error = 'HandlerError: Invalid Path value';
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
			let now = Math.ceil(Date.now() / 1000);
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

			postmen.call('GET', '/labels', function (first_err, first_result) {
				let diff = Math.ceil(Date.now() / 1000) - now;
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

			postmen.call('GET', '/labels', function (err, result) {
				let diff = Math.ceil(Date.now() / 1000) - now;
				expect(diff).to.be.lte(1);
				expect(err.code).to.equal(mock_result.meta.code);
				done();
			});
		});
	});

	describe('Test retry flag', function () {
		describe('Test retry with Request Error', function () {
			it('should retry with get() with default retry = true, if request return ETIMEDOUT', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region);
				let expected_error = new Error();
				expected_error.code = 'ETIMEDOUT';
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(expected_error);
				});
				postmen.get('/labels', function (err, result) {
					expect(err.type).to.equal('ETIMEDOUT');
					expect(err.retry_count).to.equal(5);
					done();
				});
			});

			it('should retry with get() with default retry = true, if request return ECONNRESET', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region);
				let expected_error = new Error();
				expected_error.code = 'ECONNRESET';
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(expected_error);
				});
				postmen.get('/labels', function (err, result) {
					expect(err.type).to.equal('ECONNRESET');
					expect(err.retry_count).to.equal(5);
					done();
				});
			});

			it('should retry with get() with default retry = true, if request return ECONNREFUSED', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region);
				let expected_error = new Error();
				expected_error.code = 'ECONNREFUSED';
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(expected_error);
				});
				postmen.get('/labels', function (err, result) {
					expect(err.type).to.equal('ECONNREFUSED');
					expect(err.retry_count).to.equal(5);
					done();
				});
			});

			it('should not retry with get() with retry = false, if request return ECONNREFUSED', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region, {
					retry: false
				});
				let expected_error = new Error();
				expected_error.code = 'ECONNREFUSED';
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(expected_error);
				});
				postmen.get('/labels', function (err, result) {
					expect(err.type).to.equal('ECONNREFUSED');
					expect(err.retry_count).to.equal(undefined);
					done();
				});
			});
		});

		describe('Test retry with Api Error', function () {
			let mock_req;
			let expected_error;

			before(function () {
				mock_req = {
					headers: {}
				};
				expected_error = {
					meta: {
						code: 500,
						message: 'Something went wrong on Postmen\'s end.',
						type: 'InternalError'
					},
					data: {}
				};
			});

			it('should retry with get() with default retry = true, if Postmen return InternalError 500', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region);
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(null, mock_req, expected_error);
				});
				postmen.get('/labels', function (err, result) {
					expect(err.type).to.equal(expected_error.meta.type);
					expect(err.retry_count).to.equal(5);
					done();
				});
			});

			it('should retry with get(..., {retry = true}), if Postmen return InternalError 500', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region, {
					retry: false
				});
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(null, mock_req, expected_error);
				});
				postmen.get('/labels', {
					retry: true
				}, function (err, result) {
					expect(err.type).to.equal(expected_error.meta.type);
					expect(err.retry_count).to.equal(5);
					done();
				});
			});

			it('should not retry with get() with default retry = false, if Postmen return InternalError 500', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region, {
					retry: false
				});
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(null, mock_req, expected_error);
				});
				postmen.get('/labels', function (err, result) {
					expect(err.type).to.equal(expected_error.meta.type);
					expect(err.retry_count).to.equal(undefined);
					done();
				});
			});

			it('should not retry with get(..., {retry = false}), if Postmen return InternalError 500', function (done) {
				// Construct with valid api_key
				let postmen = Postmen(api_key, region);
				// Stub request to throw
				sandbox.stub(postmen, 'request', function (request_object, callback) {
					callback(null, mock_req, expected_error);
				});
				postmen.get('/labels', {
					retry: false
				}, function (err, result) {
					expect(err.type).to.equal(expected_error.meta.type);
					expect(err.retry_count).to.equal(undefined);
					done();
				});
			});
		});
	});
});

'use strict';

const chai = require('chai');
const expect = chai.expect;
// const http = require('http');
// const request = require('request');
const Postmen = require('./../index');

let api_key = 'SOME_API_KEY';
let region = 'SOME_REGION';
let default_endpoint = 'https://SOME_REGION-api.postmen.com/v3';
let default_proxy = null;
let default_retry = true;

describe('Test constructor', function () {
	describe('Test construct correct cases', function () {
		it('should construct with api_key correctly', function () {
			let postmen = Postmen(api_key, region);
			expect(postmen.api_key).to.equal(api_key);
			expect(postmen.endpoint).to.equal(default_endpoint);
			expect(postmen.proxy).to.equal(default_proxy);
			expect(postmen.retry).to.equal(default_retry);

			postmen = Postmen(api_key, region, null);
			expect(postmen.api_key).to.equal(api_key);
			expect(postmen.endpoint).to.equal(default_endpoint);
			expect(postmen.proxy).to.equal(default_proxy);
			expect(postmen.retry).to.equal(default_retry);
		});

		it('should construct with api_key and region correctly', function () {
			let endpoint = 'https://awesome-api.postmen.com/v3';
			let postmen = Postmen(api_key, 'awesome');
			expect(postmen.api_key).to.equal(api_key);
			expect(postmen.endpoint).to.equal(endpoint);
			expect(postmen.proxy).to.equal(default_proxy);
			expect(postmen.retry).to.equal(default_retry);
		});

		it('should construct with api_key and endpoint correctly', function () {
			let endpoint = 'https://awesome-api.postmen.com/v3';;
			let postmen = Postmen(api_key, region, {
				endpoint: endpoint
			});
			expect(postmen.api_key).to.equal(api_key);
			expect(postmen.endpoint).to.equal(endpoint);
			expect(postmen.proxy).to.equal(default_proxy);
			expect(postmen.retry).to.equal(default_retry);
		});

		it('should construct with api_key and proxy correctly', function () {
			let proxy = '127.0.0.1';
			let postmen = Postmen(api_key, region, {
				proxy: proxy
			});
			expect(postmen.api_key).to.equal(api_key);
			expect(postmen.endpoint).to.equal(default_endpoint);
			expect(postmen.proxy).to.equal(proxy);
			expect(postmen.retry).to.equal(default_retry);
		});

		it('should construct with api_key and retry correctly', function () {
			let postmen = Postmen(api_key, region, {
				retry: false
			});
			expect(postmen.api_key).to.equal(api_key);
			expect(postmen.endpoint).to.equal(default_endpoint);
			expect(postmen.proxy).to.equal(default_proxy);
			expect(postmen.retry).to.equal(false);
		});
	});

	describe('Test constructor error', function () {
		it('should return error, if api_key is null/undefined/not string', function () {
			let expected_error = 'ConstructorError: Invalid API key';
			try {
				Postmen();
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(null);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(999);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(true);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(false);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen({});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should return error, if region is null/undefined/not string', function () {
			let expected_error = 'ConstructorError: Invalid Region';
			try {
				Postmen(api_key);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, null);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, 999);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, true);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, false);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, {});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should return error, if config is not null/undefined/object', function () {
			let expected_error = 'ConstructorError: Invalid config value';
			try {
				Postmen(api_key, region, 999);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, true);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, false);
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, 'config');
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should return error, if endpoint is defined but not string', function () {
			let expected_error = 'ConstructorError: Invalid Endpoint value';
			try {
				Postmen(api_key, region, {endpoint: 999});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {endpoint: true});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {endpoint: false});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {endpoint: {}});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should return error, if proxy is defined but not string', function () {
			let expected_error = 'ConstructorError: Invalid Proxy value';
			try {
				Postmen(api_key, region, {proxy: 999});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {proxy: true});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {proxy: false});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {proxy: {}});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should return error, if retry is defined but not boolean', function () {
			let expected_error = 'ConstructorError: Invalid Retry value';
			try {
				Postmen(api_key, region, {retry: 999});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {retry: 0});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {retry: 1});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {retry: {}});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {retry: ''});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});

		it('should return error, if rate is defined but not boolean', function () {
			let expected_error = 'ConstructorError: Invalid Rate value';
			try {
				Postmen(api_key, region, {rate: 999});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {rate: 0});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {rate: 1});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {rate: {}});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
			try {
				Postmen(api_key, region, {rate: ''});
			} catch (e) {
				expect(e.message).to.equal(expected_error);
			}
		});
	});
});

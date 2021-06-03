"use strict";

const Postmen = require("./../index");
const Credentials = require("./credentials");

const postmen = Postmen(Credentials.api_key, Credentials.region);

const payload = {
	address: {
		contact_name: "testing",
		street1: "4901 N New Hope Rd Apt C1",
		city: "Raleigh",
		state: "NC",
		postal_code: "27604",
		country: "USA",
		type: "business",
		phone: "18888976058",
		email: "testing@test.com",
	},
};

const input = {
	body: payload,
};

const config = {};

postmen
	.create("/address-validations", input, config)
	.then(function (result) {
		console.log("Result:", JSON.stringify(result));
	})
	.catch(function (error) {
		console.log("Error:", JSON.stringify(error));
	});

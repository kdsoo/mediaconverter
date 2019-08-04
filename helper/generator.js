var os = require('os');
var crypto = require('crypto');
var uuid = require('uuid-1345');

function randB64 (len) {
	return crypto.randomBytes(Math.ceil(len * 3 / 4))
		.toString('base64')
		.slice(0, len)
		.replace(/\+/g, '0')
		.replace(/\//g, '0');
}
module.exports.randB64 = randB64;

function getRequestID() {
	return "request-" + new Date().getTime();
}
module.exports.getRequestID = getRequestID;

function getHostUUID() {
	return uuid.v5({ namespace: uuid.namespace.oid, name: os.hostname() });
}
module.exports.getHostUUID = getHostUUID;

var config = require('config');
var os = require('os');
var request = require('request');
var PushBullet = require('pushbullet');
var apiKey = config.get("messaging.pushbullet.apikey");
var isPushbulletEnabled = config.get("messaging.pushbullet.enabled");
var pusher = new PushBullet(apiKey);
var allDevices = '';

// init pushbullet
getPushDevices(function(e,r) {
	if(e) {
		console.error(e);
	} else {
		console.log(r);
		console.log("Pushbullet initialized");
	}
});

function getPushDevices(cb) {
	pusher.devices(function(error, response) {
		if (error) {
			cb(error, null);
		} else {
			response.devices.forEach(function(d, i) {
				console.log("pushbullet registered devices: " + d.nickname);
			});
			allDevices = response.devices;
			cb(null, response);
		}
	});
}
module.exports.getPushDevices = getPushDevices;

function sendPushbullet(dev, title, message, cb) {
	pusher.note(allDevices, title, message, function(error, response) {
		cb(error, response);
	});
}
module.exports.sendPushbullet = sendPushbullet;

pusher.devices(function(error, response) {
	// response is the JSON response from the API
	//console.log(response);
});
pusher.me(function(err, response) {console.log(response);});

function pushToAll(title, msg) {
	// pushbullet
	sendPushbullet(allDevices, title, msg, function(error, response) {
		if (error) {
			console.error('error: ' + error);
		} else {
			console.log('res: ' + JSON.stringify(response));
		}
	});
}
module.exports.pushToAll = pushToAll;

serviceEvent.on('pushbullet', function(msg) {
	try {
		if (typeof(msg) == "string") msg = JSON.parse(msg);

		if (!msg.res && msg.cmd) {
			switch (msg.cmd) {
				case "PUSH":
					// msg.payload.target, msg.payload.title, msg.payload.msg
					if (isPushbulletEnabled) {
					sendPushbullet("", msg.payload.title, msg.payload.msg, function(e,r) {});
				}
				break;
				default:
					break;
			}
		}
	} catch(e) {
		console.error(e);
	}
});


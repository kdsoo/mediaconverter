var config = require('config');
var fs = require('fs');
var os = require('os');
var request = require('request');
var telegram_endpoint = "https://api.telegram.org/bot";
var telegramCred = config.get("messaging.telegram");
var telegram_apikey = config.get("messaging.telegram.apikey");
var telegram_admin = config.get("messaging.telegram.admin");
var telegram_enabled = config.get("messaging.telegram.enabled");

var defaultTTL = 0;

// Telegram HTTP bot API
// - send image
// : curl -s -X POST https://api.telegram.org/botXXXXXXX:IIIIIIIIIIIIIIIIIII/sendPhoto -F chat_id=118147814 -F photo="@/home/kdsoo/Pictures/test.png"
// : returns {"ok":true,"result":{"message_id":8121,"from":{"id":167166816,"is_bot":true,"first_name":"SeaHaven sysadmin","username":"SeaHavenBot"},"chat":{"id":118147814,"first_name":"Nathaniel","last_name":"Kim","username":"seahaven","type":"private"},"date":1530764918,"photo":[{"file_id":"AgADBQAD7KcxG0Zq8VXIAtSnEDol8PU91jIABC3ndDFCxdr_lrMBAAEC","file_size":1336,"file_path":"photos/file_18.jpg","width":90,"height":69},{"file_id":"AgADBQAD7KcxG0Zq8VXIAtSnEDol8PU91jIABCN-gUuDnDsMl7MBAAEC","file_size":13747,"width":320,"height":247},{"file_id":"AgADBQAD7KcxG0Zq8VXIAtSnEDol8PU91jIABGMOZ5xxDNqNmLMBAAEC","file_size":40198,"width":684,"height":527}]}}
//
// - delete message
// : curl -s -X POST https://api.telegram.org/botXXXXXXX:IIIIIIIIIIIIIIIIIII/deleteMessage -F chat_id=118147814 -F message_id=8120


function sendTelegram(msg, cb) {
	var telegram_push = telegram_endpoint + telegram_apikey + "/sendMessage?chat_id=" + telegram_admin + "&text=";
	var message = telegram_push + msg;
	console.log("telegram send:", msg, message);
	request({url: message, rejectUnauthorized: false}, function(err, res, body) {
		if (err) {
			console.error("telegram send error:", err);
		} else {
			console.log(res);
			console.log(body);
		}
	});
}
module.exports.sendTelegram = sendTelegram;

function sendTelegramPOST(msg, disablenoti, callback) {
	var NoNoti = "false";
	if (disablenoti === "true") NoNoti = "true";
	var formData = {
		chat_id: telegram_admin,
		disable_notification: NoNoti,
		text: msg
	};
	request.post({url:telegram_endpoint + telegram_apikey + "/sendMessage", formData: formData}, function(err, httpResponse, body){
		if (err) {
			console.error(err);
			callback(err, null);
		} else {
			console.log(body);
			body = JSON.parse(body);
			if (body.ok == true) {
				// do something
			}
			callback(null, body);
		}
	});
}
module.exports.sendTelegramPOST = sendTelegramPOST;

function sendTelegramImage(img, cam, text, type, disablenoti, callback) {
	var NoNoti = "false";
	if (disablenoti === "true") NoNoti = "true";
	var formData = {
		chat_id: telegram_admin,
		disable_notification: NoNoti,
		caption: text,
		photo: {
			value: fs.createReadStream(img),
			options: {
				filename: img
			}
		}
	};
	request.post({url:telegram_endpoint + telegram_apikey + "/sendPhoto", formData: formData}, function(err, httpResponse, body){
		if (err) {
			console.error(err);
			callback(err, null);
		} else {
			console.log(body);
			body = JSON.parse(body);
			if (body.ok == true) {
				// TODO: do something...
			}
			callback(null, body);
		}
	});
}
module.exports.sendTelegramImage = sendTelegramImage;

function sendTelegramVideo(vid, cam, text, type, disablenoti, callback) {
	var NoNoti = "false";
	if (disablenoti === "true") NoNoti = "true";
	var formData = {
		chat_id: telegram_admin,
		disable_notification: NoNoti,
		caption: text,
		video: {
			value: fs.createReadStream(vid),
			options: {
				filename: vid
			}
		}
	};
	request.post({url:telegram_endpoint + telegram_apikey + "/sendVideo", formData: formData}, function(err, httpResponse, body){
		if (err) {
			console.error(err);
			callback(err, null);
		} else {
			console.log(body);
			body = JSON.parse(body);
			if (body.ok == true) {
				// TODO: do something...
			}
			callback(null, body);
		}
	});
}
module.exports.sendTelegramVideo = sendTelegramVideo;


function pushToAll(title, msg) {
	// Telegram
	sendTelegram(title, function(err, res, body) {
	});
}
module.exports.pushToAll = pushToAll;

// var msg = {cmd:"PUSH", payload: {title: title, msg: message, disablenoti: true, type: "temporal"}};
// var imgmsg = {cmd:"PUSH", payload: {title: title, msg: message, img: path, disablenoti: true, type: "temporal"}};
// var vidmsg = {cmd:"PUSH", payload: {title: title, msg: message, video: path, disablenoti: true, type: "temporal"}};
// emitServiceEvent("messaging", msg, false, function(ret) {});

serviceEvent.on('telegram', function(msg) {
	try {
		if (typeof(msg) == "string") msg = JSON.parse(msg);

		if (!msg.res && msg.cmd) {
			switch (msg.cmd) {
				case "MESSAGE":
					if (telegram_enabled) {
						console.log("send telegram message");
						sendTelegramPOST(msg.payload.msg, msg.payload.disablenoti, function(e,r,b) {
						});
					}
					break;
				case "IMAGE":
					if (telegram_enabled) {
						sendTelegramImage(msg.payload.image, msg.payload.title,
							msg.payload.msg, msg.payload.type, msg.payload.disablenoti, function(e,r,b) {
						});
					}
					break;
				case "VIDEO":
					if (telegram_enabled) {
						sendTelegramVideo(msg.payload.video, msg.payload.title,
							msg.payload.msg, msg.payload.type, msg.payload.disablenoti, function(e,r,b) {
						});
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

console.log("Telegram module loaded");

var gen = require('../helper/generator');
var util = require('util');

// Event notifier
var EventEmitter = require('events').EventEmitter;

global.serviceEvent = new EventEmitter();
//serviceEvent.setmaxListeners(0);

function serviceEventAck(ch, msg, ack) {
	serviceEvent.emit(ch + "-" + msg.requestID, ack);
}
global.serviceEventAck = serviceEventAck;

function serviceEventListener(channel, cb) {
	serviceEvent.once(channel, function(err, ret) {
		if (err) {
			cb(err);
		} else {
			// ret.res is return messages
			cb(null, ret);
		}
	});
	setTimeout(function() {
		if (serviceEvent.listeners(channel).length > 0) {
			serviceEvent.removeAllListeners(channel);
			cb("timeout");
		}
	}, 15000);
}

function emitServiceEvent(event, msg, cb) {
	var requestID = gen.getRequestID();
	msg.requestID = requestID;
	var channel = event + "-" + requestID;
	if (typeof(cb) === "function") {
		serviceEventListener(channel, function(err, ret) {
			if (err) {
				cb(err);
			} else {
				cb(null, ret);
			}
		});
	}
	serviceEvent.emit(event, msg);
}
global.emitServiceEvent = emitServiceEvent;

global.globalNotify = true;


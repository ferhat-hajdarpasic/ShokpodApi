var request = require('request');
var mongoose = require('mongoose'),
    Record = mongoose.model("Record"),
    ObjectId = mongoose.Types.ObjectId

var interval = 60; //Seconds
var remoteApiAddress = "http://shokpod.australiaeast.cloudapp.azure.com:8080/records";

var pushToServer = function () {
    var RECORD_COUNT = 1000;
    Record.aggregate(
        [{ $project: { DeviceAddress: 1, AssignedName: 1, Recording: { $slice: ["$Recording", 0, RECORD_COUNT] }, RecordingLength: { $size: "$Recording" } }}],
        function (err, recordsToSend) {
        if (err) {
            next(err);
            setTimeout(pushToServer, interval * 1000);
        } else {
            recordsToSend.forEach(function (recordToSend, index, theArray) {
                request({
                    url: remoteApiAddress,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    json: recordToSend
                }, function (error, response, body) {
                    if (index == theArray.length - 1) {
                        setTimeout(pushToServer, interval * 1000);
                    }
                    if (error) {
                        console.log(error);
                    } else {
                        var logMessage = 'HTTP: ' + response.statusCode + ', message:' + body + ', device:' + recordToSend.DeviceAddress + ', from: ';
                        if (recordToSend.Recording.length > 0) {
                            //logMessage += recordToSend.Recording[0].Time.toISOString() + ' until: ' + recordToSend.Recording[recordToSend.Recording.length - 1].Time.toISOString();
                        }
                        console.log(logMessage);

                        var recordsToKeep = recordToSend.RecordingLength - RECORD_COUNT;
                        if (recordsToKeep < 0) {
                            recordsToKeep = 0;
                        }
                        Record.update(
                            { _id: recordToSend._id },
                            {
                                $push: {
                                    Recording: {
                                        $each: [],
                                        $slice: -recordsToKeep
                                    }
                                }
                            },
                            function (error, record) {
                            if (error) {
                                next(err);
                            } else {
                                console.log("Removed it: " + recordToSend._id + ", records now: " + recordToSend.RecordingLength);
                            }
                        });
                    }
                });
            });
        }
    });
}

exports.setInterval = function (value) { interval = value; }
exports.setRemoteApiAddress = function(address) {remoteApiAddress = address;}
exports.start = function () {
    console.log("Start sending data to remote address:" + remoteApiAddress);
    console.log("Sending period:" + interval);
    setTimeout(pushToServer, interval * 1000);
}

//var kuku = db.haba.aggregate([{ $project: { q: $const(44), fff: { $slice: ["$a", 0, 10] } } }])
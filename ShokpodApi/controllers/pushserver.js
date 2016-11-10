var request = require('request');
var mongoose = require('mongoose'),
    Record = mongoose.model("Record"),
    ObjectId = mongoose.Types.ObjectId

var interval = 60; //Seconds
var remoteApiAddress = "http://shokpod.australiaeast.cloudapp.azure.com:8080/records";

var pushToServer = function () {
    Record.aggregate(
        [{$project: { DeviceAddress: 1, AssignedName: 1, Recording: { $slice: ["$Recording", 0, 100] } }}],
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
                    setTimeout(pushToServer, interval * 1000);
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('HTTP: ' + response.statusCode + ', message:' + body + ', device:' + recordToSend.DeviceAddress + ', from: ' + recordToSend.Recording[0].Time.toISOString() + ' until: ' + recordToSend.Recording[recordToSend.Recording.length - 1].Time.toISOString());
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
var mongoose = require("mongoose");
var express = require('express');
var bodyParser = require("body-parser");

var Schema = mongoose.Schema;

var RecordSchema = new Schema({
    DeviceAddress: String,
    AssignedName: String,
    Recording: [{
            _id: false,
            Time: Date,
            Value: {
                X: Number,
                Y: Number,
                Z: Number
            }
        }]
});

mongoose.model('Record', RecordSchema);

mongoose.connect('mongodb://localhost/test');

var controllers = {}
controllers.record = require('./controllers/record.js')
var pushserver = require("./controllers/pushserver.js");

pushserver.setInterval(5);
pushserver.setRemoteApiAddress("http://shokpod.australiaeast.cloudapp.azure.com:8080/records");

var app = express();

app.use(bodyParser.json());

/*
app.use(function (req, res, next) {
    var nodeSSPI = require('node-sspi');
    var nodeSSPIObj = new nodeSSPI({
        retrieveGroups: true
    });
    nodeSSPIObj.authenticate(req, res, function (err) {
        res.finished || next();
    });
});
*/

var config = require("./config.json");
var port = config.port || 8080;

if (config.push) {
    pushserver.start();
}


app.listen(port, function (err) {
    if (err)
        console.error(err);
    else
        console.log('Application is ready at : ' + port);
});

app.post("/records", controllers.record.createRecord)
app.put("/records/:id", controllers.record.viewRecord)
app.delete("/records/:id", controllers.record.deleteRecord)
app.get("/records/:id", controllers.record.viewRecord)
app.get("/records/:seconds/seconds", controllers.record.lastNSeconds)
app.get("/records/timeseries/:id", controllers.record.timeseries)

app.use(express.static(__dirname + '/ui/build/bundled'));

if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
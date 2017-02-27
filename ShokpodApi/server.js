var winston = require('winston');
winston.add(winston.transports.File, { filename: 'shokpodapi.log' });
console.error = winston.error;
console.log = winston.info;
console.info = winston.info;
console.debug = winston.debug;
console.warn = winston.warn;
module.exports = console;

var config = require("./config.json");
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
controllers.sqlserver = require('./controllers/sqlserver.js').connection(config.mssql);
var pushserver = require("./controllers/pushserver.js");

var app = express();

app.use(bodyParser.json());

var port = config.port || 8080;

if (config.push) {
    pushserver.setRemoteApiAddress(config.pushServer);
    pushserver.setInterval(config.pushInterval);
    pushserver.start();
}

if (config.secure) {
    app.use(function (req, res, next) {
        var originalUrl = req.originalUrl;
        var nodeSSPI = require('node-sspi');
        var nodeSSPIObj = new nodeSSPI({
            retrieveGroups: true,
            authoritative: true
        });
        if (originalUrl.startsWith("/records")) {
            res.finished || next();
        } else {
            nodeSSPIObj.authenticate(req, res, function (err) {
                var url2 = req.originalUrl;
                if (err) {
                    console.log(err);
                } else {
                    res.finished || next();
                }
            });
        }
    });
}

app.listen(port, function (err) {
    if (err)
        console.error(err);
    else
        console.log('Application is ready at : ' + port);
});

app.post("/records", controllers.record.createRecord);
app.post("/records", controllers.sqlserver.write);

app.put("/records/:id", controllers.record.viewRecord)
app.delete("/records/:id", controllers.record.deleteRecord)
app.get("/records/:id", controllers.record.viewRecord)
app.get("/records/:seconds/seconds", controllers.record.lastNSeconds)
app.get("/records/timeseries/:id", controllers.record.timeseries)
app.get("/records/csv/:id", controllers.record.csv)

if (config.development) {
    app.get("/sqlserver/read/:id", controllers.sqlserver.read);
    app.get("/sqlserver/write", controllers.sqlserver.write);
}

var base_folder = '/ui/build/bundled';
if (config.development) {
    base_folder = '/ui';
}
app.use(express.static(__dirname + base_folder));

if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
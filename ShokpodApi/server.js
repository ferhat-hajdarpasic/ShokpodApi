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

if ((process.argv.length >= 2) && ('push' == process.argv[2])) {
    //pushserver.start();
}

var app = express();

app.use(bodyParser.json());

var port = process.env.PORT || 8080;

app.listen(process.env.PORT, function (err) {
    if (err)
        console.error(err);
    else
        console.log('Static content is ready at : ' + port);
});

app.post("/records", controllers.record.createRecord)
app.put("/records/:id", controllers.record.viewRecord)
app.delete("/records/:id", controllers.record.deleteRecord)
app.get("/records/:id", controllers.record.viewRecord)
app.get("/records/:seconds/seconds", controllers.record.lastNSeconds)

app.use(express.static(__dirname + '/static'));


if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
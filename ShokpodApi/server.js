var restify = require('restify')
var mongoose = require("mongoose");
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

//pushserver.start();

var server = restify.createServer();
server
    .use(restify.fullResponse())
    .use(restify.bodyParser())

server.post("/records", controllers.record.createRecord)
server.put("/records/:id", controllers.record.viewRecord)
server.del("/records/:id", controllers.record.deleteRecord)
server.get("/records/:id", controllers.record.viewRecord)

server.get("/records/:seconds/seconds", controllers.record.lastNSeconds)

var port = process.env.PORT || 3000;
server.listen(port, function (err) {
    if (err)
        console.error(err)
    else
        console.log('App is ready at : ' + port)
})

if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
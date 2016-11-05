var restify = require('restify')

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: String,
    slug: String,
    content: String,
    author: {
        type: String,
        ref: "User"
    }
});
mongoose.model('Article', ArticleSchema);

var CommentSchema = new Schema({
    text: String,
    article: {
        type: String,
        ref: "Article"
    },
    author: {
        type: String,
        ref: "User"
    }
});
mongoose.model('Comment', CommentSchema);

var RecordSchema = new Schema({
    DeviceAddress: String,
    AssignedName: String,
    Time: Date,
    Value: {
        X: Number,
        Y: Number,
        Z: Number
    }
});
mongoose.model('Record', RecordSchema);

mongoose.connect('mongodb://localhost/test');

var controllers = {}

controllers.article = require('./controllers/article.js')
controllers.comment = require('./controllers/comment.js')
controllers.record = require('./controllers/record.js')

var server = restify.createServer();

server
    .use(restify.fullResponse())
    .use(restify.bodyParser())

// Article Start
server.post("/articles", controllers.article.createArticle)
server.put("/articles/:id", controllers.article.updateArticle)
server.del("/articles/:id", controllers.article.deleteArticle)
server.get({ path: "/articles/:id", version: "1.0.0" }, controllers.article.viewArticle)
server.get({ path: "/articles/:id", version: "2.0.0" }, controllers.article.viewArticle_v2)
// Article End

// Comment Start
server.post("/comments", controllers.comment.createComment)
server.put("/comments/:id", controllers.comment.viewComment)
server.del("/comments/:id", controllers.comment.deleteComment)
server.get("/comments/:id", controllers.comment.viewComment)
// Comment End

// Comment Start
server.post("/records", controllers.record.createRecord)
server.put("/records/:id", controllers.record.viewRecord)
server.del("/records/:id", controllers.record.deleteRecord)
server.get("/records/:id", controllers.record.viewRecord)
// Comment End

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
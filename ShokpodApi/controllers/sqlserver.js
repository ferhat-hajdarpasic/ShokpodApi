var sql = require("mssql");
var mongoose = require('mongoose'),
    Record = mongoose.model("Record"),
    ObjectId = mongoose.Types.ObjectId;
    exports.connection = function (config) {
    var connection = {};
    connection.read = function () {
        sql.connect(config).then(function () {
            new sql.Request().query('select * from MAC_ACC_MONITORING_SHOKPOD_EVENTS').then(function (recordset) {
                console.dir(recordset);
            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
    };
    connection.write = function (req, res, next) {
        var inputRecord = Record(req.body);
        var x = inputRecord.Recording[0].Value.X;
        var y = inputRecord.Recording[0].Value.Y;
        var z = inputRecord.Recording[0].Value.Z;
        var acc_total = Math.sqrt(x*x + y*y + z*z).toFixed(2);
        var dbConn = new sql.Connection(config);
        dbConn.connect().then(function () {
            var time = inputRecord.Recording[0].Time.toISOString();
            var transaction = new sql.Transaction(dbConn);
            transaction.begin().then(function () {
            var request = new sql.Request(transaction);
            var query = "Insert into MAC_ACC_MONITORING_SHOKPOD_EVENTS " +
                "(Id, event_time, operator, device_id, acc_x, acc_y, acc_z, acc_total, alert_level, application, prodmon_state) " +
                `values (NEWID(),'${time}', '${inputRecord.AssignedName}', '${inputRecord.DeviceAddress}', ${x}, ${y}, ${z}, ${acc_total}, 4, 5, 1)`;
            request.query(query)
                    .then(function () {
                        transaction.commit().then(function (recordSet) {
                            dbConn.close();
                        }).catch(function (err) {
                            console.log("Error in Transaction Commit " + err);
                            console.log("inputRecord=" + JSON.stringify(inputRecord));
                            console.log("query=" + query);
                            dbConn.close();
                        });
                        
                    }).catch(function (err) {
                        console.log("Error in Transaction Begin " + err);
                        console.log("inputRecord=" + JSON.stringify(inputRecord));
                        console.log("query=" + query);
                        dbConn.close();
                    });

            }).catch(function (err) {
                console.log(err);
                console.log("inputRecord=" + JSON.stringify(inputRecord));
                console.log("query=" + query);
                dbConn.close();
            });
        }).catch(function (err) {
            console.log(err);
            console.log("inputRecord=" + JSON.stringify(inputRecord));
        });
    };
    return connection;
}
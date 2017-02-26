var sql = require("mssql");
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
    connection.write = function () {
    };
    return connection;
}
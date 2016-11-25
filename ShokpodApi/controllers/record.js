var fn = require('fn.js');
var mongoose = require('mongoose'),
    Record = mongoose.model("Record"),
    ObjectId = mongoose.Types.ObjectId

exports.createRecord = function (req, res, next) {
    var incomingRecord = Record(req.body);
    Record.find({ "DeviceAddress": incomingRecord.DeviceAddress }, { Recording: false}, function (err, record) {
        if (err) {
            res.status(500);
            res.json({
                type: false,
                data: "Error occured: " + err
            })
        } else {
            if (record) {
                if (record.length == 0) {
                    incomingRecord.save(function (err, record) {
                        if (err) {
                            res.status(500);
                            res.json({
                                type: false,
                                data: "Error occured: " + err
                            })
                        } else {
                            res.json({
                                type: true,
                                data: record
                            })
                        }
                    })
                } else {
                    var recordToUpdate = record[0];
                    recordToUpdate.update({
                        $push: { Recording: { $each: incomingRecord.Recording } },
                        AssignedName: incomingRecord.AssignedName
                    }, function (err, record) {
                        if (err) {
                            res.status(500);
                            res.json({
                                type: false,
                                data: "Error occured: " + err
                            })
                        } else {
                            res.json({
                                type: true,
                                data: "Updated id " + recordToUpdate._id + ", written " + incomingRecord.Recording.length + " records."
                            })
                        }
                    }
                    );
                }
            } else {
                res.json({
                    type: false,
                    data: "Record: " + req.params.id + " not found"
                })
            }
        }
    })
}

exports.viewRecord = function (req, res, next) {
    Record.find(new ObjectId(req.params.id), function (err, record) {
        if (err) {
            res.status(500);
            res.json({
                type: false,
                data: "Error occured: " + err
            })
        } else {
            if (record) {
                res.json({
                    type: true,
                    data: record
                })
            } else {
                res.json({
                    type: false,
                    data: "Record: " + req.params.id + " not found"
                })
            }
        }
    })
}

exports.timeseries = function (req, res, next) {
    Record.find(new ObjectId(req.params.id), function (err, records) {
        if (err) {
            res.status(500);
            res.json({
                type: false,
                data: "Error occured: " + err
            })
        } else {
            if (records && records.length > 0) {
                record = records[0];
                res.json(record.Recording)
            } else {
                res.json({
                    type: false,
                    data: "Record: " + req.params.id + " not found"
                })
            }
        }
    })
}

exports.updateRecord = function (req, res, next) {
    var updatedRecordModel = new Record(req.body);
    Record.findByIdAndUpdate(new ObjectId(req.params.id), updatedRecordModel, function (err, record) {
        if (err) {
            res.status(500);
            res.json({
                type: false,
                data: "Error occured: " + err
            })
        } else {
            if (record) {
                res.json({
                    type: true,
                    data: record
                })
            } else {
                res.json({
                    type: false,
                    data: "Record: " + req.params.id + " not found"
                })
            }
        }
    })
}

exports.lastNSeconds = function (req, res, next) {
    Record.aggregate([{
        $project: { DeviceAddress: 1, AssignedName: 1, lastSample: { $slice: ["$Recording", -1] } }
        }], function (err, results) {
        if (err) {
            next(err);
        } else {
            var periodStartAsString = (new Date((new Date()).getTime() - 1000 * req.params.seconds)).toISOString();
            var o = eval('[{ \
            $project: { \
                DeviceAddress: 1, AssignedName: 1, \
                    h: { \
                    $filter: { \
                        input: "$Recording", \
                            as: "item", \
                                cond: { $gte: ["$$item.Time", new Date("' + periodStartAsString + '")] } \
                    } \
                } \
            } \
        }]');

            Record.aggregate(o, function (err, results) {
                if (err) {
                    next(err);
                } else {
                    res.json(results);
                }
            })
        }
    });
}

exports.deleteRecord = function (req, res, next) {
    Record.findByIdAndRemove(new Object(req.params.id), function (err, record) {
        if (err) {
            res.status(500);
            res.json({
                type: false,
                data: "Error occured: " + err
            })
        } else {
            res.json({
                type: true,
                data: "Record: " + req.params.id + " deleted successfully"
            })
        }
    })
}
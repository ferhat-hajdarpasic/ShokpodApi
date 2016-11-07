var mongoose = require('mongoose'),
    Record = mongoose.model("Record"),
    ObjectId = mongoose.Types.ObjectId

exports.createRecord = function (req, res, next) {
    var incomingRecord = new Record(req.body);
    Record.find({ "DeviceAddress": incomingRecord.DeviceAddress }, function (err, record) {
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
                    recordToUpdate.update( {
                            $push: { Recording: { $each: incomingRecord.Recording } } 
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
                                data: recordToUpdate
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
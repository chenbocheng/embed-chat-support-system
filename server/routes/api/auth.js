var express = require('express');
var router = express.Router();
var async = require('async');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var UserModel = require('../../model/user');
var RoomModel = require('../../model/room');

router
    .get('/me', function (req, res, next) {
        if (req.cookies.token) {
            var decoded = jwt.decode(req.cookies.token);
            res.send(decoded);
        } else
            res.sendStatus(401);
    })
    .post('/register', function (req, res, next) {
        async.waterfall([
            function (callback) {
                var newUser = req.body;
                newUser.level = config.userLevel.customer;

                UserModel.createCustomer(newUser, function (err, result) {
                    if (err)
                        return callback(err, null);
                    else
                        callback(null, result)
                });
            },
            function (user, callback) {
                RoomModel.createOne({
                    displayName: '',
                    users: [user._id],
                    site: user.site
                }, function (err, result) {
                    if (err)
                        return callback(err, null);
                    else
                        callback(null, result)
                });
            }
        ], function (err, result) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(result)
        });
    })
    .post('/login', function (req, res, next) {
        UserModel.authenticateCustomer(req.body, function (err, user) {
            if (user) {
                req.session.user = user;
                var token = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    site: user.site
                }, config.jwt.secret);
                res.send({
                    'token': token,
                    id: user._id,
                    email: user.email,
                    displayName: user.displayName,
                    site: user.site
                });
            } else {
                res.send({
                    error: 'InvalidCredential'
                });
            }
        });
    });

module.exports = router;
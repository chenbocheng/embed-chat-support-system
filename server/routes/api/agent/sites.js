var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var SiteModel = require('../../../model/site');

router
    .get('/', middleware.isTokenValid, function (req, res, next) {
        var data = req.query;
        data.reqUser = req.user;
        SiteModel.getList(data, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    })
    .get('/assigned', middleware.isTokenValid, function (req, res, next) {
        var data = req.query;
        data.reqUser = req.user;
        data.getAssignedSites = true;
        SiteModel.getList(data, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    })
    .get('/:siteId', middleware.isTokenValid, function (req, res, next) {
        var data = {
            reqUser: req.user,
            siteId: req.params.siteId
        };
        SiteModel.getOne(data, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    })
    .put('/:siteId/users/assign', middleware.isTokenValid, function (req, res, next) {
        var data = {
            reqUser: req.user,
            siteId: req.params.siteId,
            agentId: req.body._id
        };
        SiteModel.assignAgent(data, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    })
    .put('/:siteId/users/unassign', middleware.isTokenValid, function (req, res, next) {
        var data = {
            reqUser: req.user,
            siteId: req.params.siteId,
            agentId: req.body._id
        };
        SiteModel.unassignAgent(data, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    })
    .put('/:siteId/users/self-unassign', middleware.isTokenValid, function (req, res, next) {
        var data = {
            reqUser: req.user,
            siteId: req.params.siteId
        };
        SiteModel.selfUnassignAgent(data, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    })
    .post('/', middleware.isTokenValid, function (req, res, next) {
        var newSite = req.body;
        newSite.owner = req.user._id;
        SiteModel.addOne(newSite, function (err, r) {
            if (err)
                res.send({
                    error: err
                });
            else
                res.send(r);
        });
    });

module.exports = router;

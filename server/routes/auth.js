var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');

var middleware = require('./middleware');
var UserModel = require('../model/user');

// just create a default account
UserModel.createAgent({
    email: 'giathinh910@gmail.com',
    password: '131313',
    displayName: 'Super Admin',
    level: 1
});

var pageData = {
    register: {
        pageTitle: 'Sign Up',
        pageId: 'register'
    },
    login: {
        pageTitle: 'Sign In',
        pageId: 'login'
    }
};

router
    .get('/register', middleware.checkUserNotLoggedIn, function (req, res, next) {
        res.render('auth/register', pageData.register);
    })
    .post('/register', middleware.checkUserNotLoggedIn, function (req, res, next) {
        var registerPageData = {
            pageTitle: pageData.register.pageTitle,
            pageId: pageData.register.pageId
        };

        var newUser = req.body;
        newUser.level = config.userLevel.agent;

        UserModel.createAgent(newUser, function (err, result) {
            if (err) {
                switch (err) {
                    case 'ValidationError':
                        registerPageData.alerts = [{
                            type: 'warning',
                            content: 'Please fill up all required information and make sure they are valid'
                        }];
                        break;
                    case 'EmailExisted':
                        registerPageData.alerts = [{
                            type: 'info',
                            content: 'User with this email already existed'
                        }];
                        break;
                }
                res.render('auth/register', registerPageData);
            } else
                res.redirect('/login?register=success');
        });
    })
    .get('/login', middleware.checkUserNotLoggedIn, function (req, res, next) {
        var loginPageData = {
            pageTitle: pageData.login.pageTitle,
            pageId: pageData.login.pageId
        };
        if (req.query.register) {
            loginPageData.alerts = [{
                type: 'success',
                content: 'You can now sign in with just-created account'
            }];
        }
        res.render('auth/login', loginPageData);
    })
    .post('/login', middleware.checkUserNotLoggedIn, function (req, res, next) {
        var loginPageData = {
            pageTitle: pageData.login.pageTitle,
            pageId: pageData.login.pageId
        };

        UserModel.authenticateAgent(req.body, function (err, user) {
            if (err) {
                switch (err) {
                    case 'ValidationError':
                        loginPageData.alerts = [{
                            type: 'warning',
                            content: 'Please fill up all required information and make sure they are valid.'
                        }];
                        break;
                    case 'UserNotExisted':
                        loginPageData.alerts = [{
                            type: 'danger',
                            content: 'User not existed.'
                        }];
                        break;
                    default:
                        loginPageData.alerts = [{
                            type: 'danger',
                            content: 'Login failed. Something wrong happened.'
                        }];
                        break;
                }
                res.render('auth/login', loginPageData);
            } else {
                if (!user) {
                    loginPageData.alerts = [{
                        type: 'danger',
                        content: 'Login failed'
                    }];
                } else {
                    req.session.user = user;
                    var token = jwt.sign({
                        _id: user._id,
                        email: user.email,
                        displayName: user.displayName
                    }, config.jwt.secret);
                    res.cookie('token', token).redirect('/chat');
                }
            }
        });
    })
    .get('/logout', function (req, res, next) {
        req.session.destroy();
        res.clearCookie("token").redirect('/');
    });

module.exports = router;

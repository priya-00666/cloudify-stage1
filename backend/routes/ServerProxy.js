'use strict';
/**
 * Created by kinneretzin on 05/12/2016.
 */


var express = require('express');
var request = require('request');
var config = require('../config').get();

var router = express.Router();

var logger = require('log4js').getLogger('ServerProxy');

function _errorHandler(res,err) {
    var isTimeout = err.code === 'ETIMEDOUT';
    var isConnTimeout = err.connect;

    logger.error(isConnTimeout ? 'Manager is not available' : ( isTimeout ? 'Request timed out' : err.message), err);
    if (isConnTimeout) {
        res.status(500).send({message: isConnTimeout ? 'Manager is not available' : ( isTimeout ? 'Request timed out' : err.message)});
    } else { // If its not a connection timeout, then headers might have already been sent, so cannot send body. Just set the status code and end the request.
        res.status(500).end();
    }
}

function buildManagerUrl(req,res,next) {
    var serverUrl = req.query.su;
    if (serverUrl) {
        req.su=    config.manager.protocol + '://' + config.manager.ip + ':' + config.manager.port + serverUrl;
        logger.debug('Proxying '+req.method+' request to server with url: '+req.su);
        next();
    } else {
        next('no server url passed');
    }
}

function proxyRequest(req,res,next) {
    req.pipe(request[req.method.toLowerCase()](
                req.su,
                {timeout: config.app.proxy.timeouts.get})
        .on('error',function(err){_errorHandler(res,err)}))
        .pipe(res);
}

/**
 * End point to get a request from the server. Assuming it has a url parameter 'su' - is the manager path
 */
router.all('/',buildManagerUrl,proxyRequest);

module.exports = router;

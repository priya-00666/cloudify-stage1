'use strict';
/**
 * Created by pposel on 13/09/2017.
 */

var fs = require('fs-extra');
var pathlib = require('path');
var _ = require('lodash');
var config = require('../config').get();
var consts = require('../consts');
const {NodeVM, VMScript} = require('vm2');

var logger = require('log4js').getLogger('WidgetBackend');

//TODO: Temporary solution, the approach needs to be think over thoroughly
var widgetsFolder = '../widgets';
if (!fs.existsSync(widgetsFolder)) {
    widgetsFolder = '../dist/widgets';
}

var services = {};
var BackendRegistrator = function (widgetId) {
    return {
        register: (method, serviceName, service) => {
            if (!method) {
                throw new Error('Method must be provided');
            }
            if (!serviceName) {
                throw new Error('Service name must be provided');
            }
            if (!service) {
                throw new Error('Service body must be provided');
            } else if (!_.isFunction(service)) {
                throw new Error('Service body must be a function (function(request, response, next, helper) {...})');
            }

            if (!_.isUndefined(_.get(services, [widgetId, serviceName, method]))) {
                throw new Error('Service ' + serviceName + ' for method ' + method + ' for widget ' + widgetId + ' already exists');
            } else {
                if (_.isEmpty(services[widgetId]))
                    services[widgetId] = {};

                if (_.isEmpty(services[widgetId][serviceName]))
                    services[widgetId][serviceName] = {};

                logger.info('--- registering service ' + serviceName + ' for ' + method + ' method');
                services[widgetId][serviceName][method] = new VMScript('module.exports = ' + service.toString());
            }
        }
    }
}

module.exports = (function() {

    function _getInstalledWidgets() {
        return fs.readdirSync(pathlib.resolve(widgetsFolder))
            .filter(dir => fs.lstatSync(pathlib.resolve(widgetsFolder, dir)).isDirectory()
            && _.indexOf(config.app.widgets.ignoreFolders, dir) < 0);
    }

    function importWidgetBackend(widgetId) {
        var backendFile = pathlib.resolve(widgetsFolder, widgetId, config.app.widgets.backendFilename);
        if (fs.existsSync(backendFile)) {
            logger.info('-- initializing file ' + backendFile);

            try {
                var backend = require(backendFile);
                if (_.isFunction(backend)) {
                    backend(BackendRegistrator(widgetId));
                } else {
                    throw new Error('Backend definition must be a function (module.exports = function(BackendRegistrator) {...})');
                }
            } catch(err) {
                throw new Error('Error during importing widget backend from file ' + backendFile + ' - ' + err.message);
            }
        }
    }

    function initWidgetBackends() {
        logger.info('Scanning widget backend files...');

        var widgets = _getInstalledWidgets();

        _.each(widgets, widgetId => importWidgetBackend(widgetId));

        logger.info('Widget backend files for registration completed');
    }

    function callService(method, serviceName, req, res, next) {
        var widgetId = req.header(consts.WIDGET_ID_HEADER);
        var widgetServices = services[widgetId];
        if (widgetServices) {
            var serviceScripts = widgetServices[serviceName];
            if (serviceScripts) {
                logger.error(serviceScripts);
                var serviceScript = serviceScripts[method];
                if (serviceScript) {
                    var helper = require('./services');

                    var vm = new NodeVM();
                    return vm.run(serviceScript)(req, res, next, helper);
                } else {
                    throw new Error('Widget ' + widgetId + ' has no service ' + serviceName + ' for method ' + method + ' registered');
                }
            } else {
                throw new Error('Widget ' + widgetId + ' has no service ' + serviceName + ' registered');
            }
        } else {
            throw new Error('Widget ' + widgetId + ' does not have any services registered');
        }

    }

    return {
        importWidgetBackend,
        initWidgetBackends,
        callService
    }
})();

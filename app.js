'use strict';

const
// Standard Node stuff
           env = process.env,

// Middleware
    bodyParser = require("body-parser"),

// Routes
           api = require('./js/api.js'),       // HTTP/AJAX request handlers
           msg = require('./js/messages.js'),  // WebSocket message handlers
       storage = require('./js/storage.js'),   // General purpose Database
         mysql = require('./js/mysql.js'),     // WordPress Database access
  
// Package and Server OS info  
       sysInfo = require('./utils/sys-info');  // Package, Server OS, Node, NPM info


/// HTTP and WebSocket stack
var
express = require('express'),  
    app = express(),  
 server = require('http').createServer(app), 
    ios = require('socket.io')(server);

/// Frontend(s) html, js, stylesheet, etc delivery
app.use(express.static(__dirname + '/www'));
/// JSON body parser
app.use(bodyParser.json());

/// ---------- Routes 

/// Version info
app.get('/version', function(req, res, next) {  
        sendJson(res, null, sysInfo.version());
});

/// ---------- Local Database Routes
//  db/auctions database
app.get('/api/auctions/:collection?/:id?/:objname?', function(req, res, next) {
    console.log(req.params);
    api.auctions(req.url, function(err, data) {
        sendJson(res, err, data);
    });
});

//  db/messages database
app.get('/api/messages/:collection?/:id?', function(req, res, next) {
    console.log(req.params);
    api.messages(req.url, function(err, data) {
        sendJson(res, err, data);
    });
});

//  General purpose storage database
app.get('/storage/:collection?/:id?', function(req, res, next) {
    console.log(req.params);
    storage.get(req.url, function(err, data) {
        sendJson(res, err, data);
    });
});

app.post('/storage/:collection/:id', function(req, res, next) {
    console.log(req.params);
    storage.post(req.url, req.body, function(err, data) {
        sendJson(res, err, data);
    });
});



/// ---------- WordPress MySql Database access
app.get('/mysql/db/:command?', function(req, res, next) {
    console.log(req.params);
    mysql.db(req.url, function(err, data) {
        sendJson(res, err, data);
    });
});

/// Helper to send JSON responses
function sendJson(res, err, data) {
        res.setHeader('Cache-Control', 'no-cache, no-store');
        if (err) {
            res.json({error: err});
        }
        else {
            res.json(data);
        }
}


// For Cloud9 the port/ip is env.PORT and env.IP
// For OpenShift the port/ip is env.OPENSHIFT_NODEJS_PORT and env.OPENSHIFT_NODEJS_IP
server.listen( env.PORT || 3000, env.IP || 'localhost', function () {
    /// ---------- WebSocket Server ----------
    // When a socket.io client connects - initialize it's message handlers
    ios.on('connection', function (socket) {
        msg.initMessageHandlers(socket);
    });

    console.log('Application worker %s started...', process.pid);
});


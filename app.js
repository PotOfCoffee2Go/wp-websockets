'use strict';

const
// Standard Node stuff
    env = process.env,

// Routes
    api = require('./js/api.js'),       // HTTP/AJAX request handlers
    msg = require('./js/messages.js'),  // WebSocket message handlers
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


/// ---------- WebSocket Server ----------


// For Cloud9 the port/ip is env.PORT and env.IP
// For OpenShift the port/ip is env.OPENSHIFT_NODEJS_PORT and env.OPENSHIFT_NODEJS_IP
console.log('ip: ' + env.IP);
console.log('port: ' + env.PORT);

server.listen( env.PORT || 3000, env.IP || 'localhost', function () {
    // When a client connects
    ios.on('connection', function (socket) {

        /// #### Standard Events
        socket.on('disconnect', function() {console.log('onDisconnect: ' + socket.id);});
        socket.on('Join', function(message) {msg.onJoin(socket, message);});
        socket.on('Leave', function(message) {msg.onLeave(socket, message);});
        
        /// #### Custom Events
        socket.on('getAuctions', function(url) {
            api.auctions(url, function(err, data) {
                if (err) throw err;
                socket.emit('getAuctions', {
                  room: null,
                  data: data,
                  error: null
                });
            });
        });
        socket.on('update bid', function(message) {msg.onUpdateBid(socket, message);});

        // - Send a connected message to the client
        msg.emitConnected(socket);

    });
    console.log('Application worker %s started...', process.pid);
});


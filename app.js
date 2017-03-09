'use strict';

const
// Standard Node stuff
           env = process.env,

// Middleware
    bodyParser = require("body-parser"),

// Routes
           api = require('./routes/api.js'),        // HTTP/AJAX request handlers
           sio = require('./routes/siohandler.js'), // WebSocket message handlers
       storage = require('./routes/storage.js'),    // General purpose Database
         mysql = require('./routes/mysql.js'),      // WordPress Database access
  
// Package, Server OS, Node, NPM info
       sysInfo = require('./utils/sys-info');


/// HTTP and WebSocket stack
var
express = require('express'),  
    app = express(),  
 server = require('http').Server(app), 
    ios = require('socket.io')(server);

/// Frontend(s) html, js, stylesheet, etc
app.use(express.static(__dirname + '/www'));

/// JSON body parser
app.use(bodyParser.json());

/// ---------- Routes 

/// health for openshift
app.get('/health', (req, res, next) => {sendJson(res, null, {'health':'ok'});});

/// Version info
app.get('/version', (req, res, next) => {sendJson(res, null, sysInfo.version());});

/// ---------- Local Database Routes
//  db/auctions database
app.get('/api/auctions/:collection?/:id?/:objname?', (req, res, next) => {
    console.log(req.params);
    api.auctions(req.url, (err, data) => {sendJson(res, err, data);});
});

//  db/messages database
app.get('/api/messages/:collection?/:id?', (req, res, next) => {
    console.log(req.params);
    api.messages(req.url, (err, data) => {sendJson(res, err, data);});
});

//  General purpose storage database
app.get('/db/storage/:collection?/:id?', (req, res, next) => {
    console.log(req.params);
    storage.get(req.url, (err, data) => {sendJson(res, err, data);});
});
app.put('/db/storage/:collection/:id?', (req, res, next) => {
    console.log(req.params);
    storage.put(req.url, req.body, (err, data) => {sendJson(res, err, data);});
});
app.post('/db/storage/:collection/:id?', (req, res, next) => {
    console.log(req.params);
    storage.post(req.url, req.body, (err, data) => {sendJson(res, err, data);});
});



/// ---------- WordPress MySql Database access
app.get('/mysql/db/:command?', (req, res, next) => {
    console.log(req.params);
    mysql.db(req.url, (err, data) => {sendJson(res, err, data);});
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
//server.listen( env.OPENSHIFT_NODEJS_PORT || 3000, env.OPENSHIFT_NODEJS_IP || 'localhost', () => {
server.listen(
    env.OPENSHIFT_NODEJS_PORT || env.PORT || 3000,
    env.OPENSHIFT_NODEJS_IP || env.IP || 'localhost',
    () => {
        /// ---------- WebSocket Server ----------
        // When a socket.io client connects
        //   initialize it's server-side message handlers
        ios.on('connection', (socket) => {sio.init(socket);});
    
        console.log('Application worker %s started...', process.pid);
    }
);


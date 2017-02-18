'use strict';

const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env,
      msg          = require('./js/messages.js'),
      JsonDB       = require('node-json-db');

// Parse values found in package.json      
var pkg = JSON.parse(fs.readFileSync(path.join('', './package.json')));

// Create/Open database
if (!fs.existsSync('./db')) {
    fs.mkdirSync('./db');
}
var db  = new JsonDB("./db/messages", true, true); // true = auto save, true = pretty

/// ---------- API HTTP Server
/// Super simple web server
var server = http.createServer(function (req, res) {
  var url = req.url;
  if (url == '/') {
    url += 'index.html';
  }

  // Health monitoring - just returns a HTTP status of 200
  if (url == '/health') {
    res.writeHead(200);
    res.end();
  }
  // Sends a JSON object with version - handy for testing
  else if (url.indexOf('/version/') == 0) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify( {
      "name": pkg.name,
      "version": pkg.version,
      "description": pkg.description,
      "author": pkg.author
    } ));
  }
  // Get data from database
  else if (url.indexOf('/bids/') == 0) {
    var data = db.getData("/bids");
    console.log(data);
    res.writeHead(200);
    res.end();
 }

  // Return a web page from the 'static' directory
  else {
    fs.readFile('./static' + url, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end();
      }
      else {
        var ext = path.extname(url).slice(1);
        if (ext && ext.length < 1) {
          ext = 'txt';
        }
        res.setHeader('Content-Type', contentTypes[ext]);
        if (ext === 'html') {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        }
        res.end(data);
      }
    });
  }
});

/// ---------- WebSocket Server
var ios = require('socket.io')(server);
console.log('port: ' + env.PORT);

// For OpenShift the port/ip is env.OPENSHIFT_NODEJS_PORT and env.OPENSHIFT_NODEJS_IP

server.listen( env.PORT || 3000,  env.IP || 'localhost', function () {
    // When a client connects
    ios.on('connection', function (socket) {

        /// #### Standard Events
        socket.on('disconnect', function() {console.log('onDisconnect: ' + socket.id);});
        socket.on('Join', function(message) {msg.onJoin(socket, message, db);});
        socket.on('Leave', function(message) {msg.onLeave(socket, message, db);});
        
        /// #### Custom Events
        socket.on('update bid', function(message) {msg.onUpdateBid(socket, message, db);});

        // - Send a connected message to the client
        msg.emitConnected(socket);

    });
  console.log('Application worker %s started...', process.pid);
});


/*
/// ---------- Server connection to websockets as a client
var ioc = require('socket.io-client'),
csocket = ioc.connect('http://localhost:3000', {reconnect: true});

csocket.on('connect', function () {
    console.log('API Server Connect');
});
csocket.on('disconnect', function () {
    changeIoIndicator('red');
});

csocket.on('connected', function (msg) {
  console.log('API Server Connected: ' + JSON.stringify(msg));
  emitConnected(msg);
});

// Export variables and functions
function emitConnected(msg) {
    csocket.emit('connected', msg);
    changeIoIndicator('green');
}

// -----------------------

function changeIoIndicator(color) {
    if (color === 'red') {
      console.log('Red')
    }
    else if (color === 'green') {
      console.log('Green')
    }
}
*/
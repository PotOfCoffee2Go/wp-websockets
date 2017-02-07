'use strict';

const http         = require('http'),
      fs           = require('fs'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env;

var version = JSON.parse(fs.readFileSync(path.join('', './package.json'))).version;

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
    res.end(JSON.stringify( {version: version} ));
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

        /// #### Events
        socket.on('connected', onConnected);

        socket.on('disconnect', onDisconnect);

        socket.on('update bid', onUpdateBid);

        /// #### Connected message
        /// - Upon connection send a connected message to the client
        ///   - In the message will be a newClientId which the client
        ///     uses in the response
        ///   - If the client disconnects - when it reconnects it should
        ///     ignore newClientID and use the same clientId that was given
        ///     during the first connect
        /// - Send ClientId to client
        emitConnected();

        function emitConnected() {
            // Send connected - with a recommended session/client id
            // When the client responds it can use these values or
            //  previous values if reconnecting - see onConnected()
            socket.emit('connected', {
              data: {},
              error: null
            });
        }

        /// - Got Connected response from client
        ///   - Activate client on the server
        function onConnected(msg) {
            if (msg.data && msg.data.room) {
              socket.join(msg.data.room);
              console.log("onConnected: joined room - " + JSON.stringify(msg));
            }
            else {
              console.log('onConnected: ' + JSON.stringify(msg));
            }
        }

        /// #### Disconnect message
        /// - Tell server to deactivate client
        function onDisconnect() {
              console.log('onDisconnect: ' + socket.id);
        }

        /// - A bid has been updated
        function onUpdateBid(msg) {
          if (msg.data && msg.data.room) {
            socket.broadcast.to(msg.data.room).emit('reload', msg);
            console.log('onUpdateBid: broadcast - ' + JSON.stringify(msg));
          }
          console.log('onUpdateBid: %s',JSON.stringify(msg));
        }
    
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
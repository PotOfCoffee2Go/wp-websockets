(function () {
    "use strict";
    const api  = require('./api.js'),
       storage = require('./storage.js');
    
    var payload = function(resource, data, location, status, error) {
        return {
            resource: resource,
            data: data ? data : {},
            location: location,
            status: status ? status : {code: 200, text: '200 - OK'},
            error: error ? error : null };
    };

    /// - Got Join request from client
    function onJoin(socket, msg) {
        if (msg.resource) {
            socket.join(msg.resource);
            console.log('onJoin: ' + socket.id + ' joined resource - ' + msg.resource);
        }
        else {
            console.log('onJoin: ' + socket.id + ' resource to join was not specified');
        }
    }

    /// - Got Leave request from client
    function onLeave(socket, msg) {
        if (msg.resource) {
            socket.leave(msg.resource);
            console.log('onLeave: ' + socket.id + ' left resource - ' + msg.resource);
        }
        else {
            console.log('onLeave: ' + socket.id + ' resource to leave was not specified ');
        }
    }

    /// - Get request from client
    function onGet(socket, msg) {
        if (typeof msg.resource !== 'string') {
            console.log('onGet: ' + socket.id + ' Missing field (resource)');
            socket.emit('Get',
                payload(msg.resource, {} ,null,
                    {code:400, text: '400 - Bad Request - Missing field (resource)'},
                    {name:'RestError', message:'400 - Bad Request - Missing field (resource)'}));
            return;
        }
        
        var resPath = msg.resource.split('/');
        // Is /api/:command/ request?
        if (resPath[1] === 'api' && typeof api[resPath[2]] === 'function') {
            api[resPath[2]](msg.resource, function(err, data) {
                if (!err) {
                    socket.emit('Get', payload(msg.resource, data, msg.resource, null, null));
                }
                else {
                    console.log('onGet: ' + socket.id + ' server error ' + err.message);
                    socket.emit('Get', 
                        payload(msg.resource, {} ,null,
                            {code:500, text: '500 - Internal Server Error'},
                            {name: err.name, message: err.message}));
                }
            });
        }
        else if(resPath[1] === 'storage') {
            storage.get(msg.resource, function(err, data) {
                if (!err) {
                    socket.emit('Get', payload(msg.resource, data, msg.resource, null, null));
                }
                else {
                    console.log('onGet: ' + socket.id + ' server error ' + err.message);
                    socket.emit('Get', 
                        payload(msg.resource, {} ,null,
                            {code:500, text: '500 - Internal Server Error'},
                            {name: err.name, message: err.message}));
                }
            });
        }
        else {
            console.log('onGet: ' + socket.id + ' resource ' + msg.resource + ' not found ');
            socket.emit('Get', 
                payload(msg.resource, {} ,null,
                    {code:404, text: '404 - Not Found'},
                    {name:'RestError', message:'404 - Not Found'}));
        }
    }

    var msg = module.exports = {

        initMessageHandlers: function initMessageHandlers(socket) {
            /// #### Standard Messages
            socket.on('disconnect', function() {console.log('onDisconnect: ' + socket.id);});
            socket.on('Join', function(message) {onJoin(socket, message);});
            socket.on('Leave', function(message) {onLeave(socket, message);});

            socket.on('Get', function(message) {onGet(socket, message);});
            socket.on('Post', function(message) {msg.onPost(socket, message);});
            socket.on('Put', function(message) {msg.onPut(socket, message);});
            socket.on('Patch', function(message) {msg.onPatch(socket, message);});
            socket.on('Delete', function(message) {msg.onDelete(socket, message);});

            socket.on('update bid', function(message) {msg.onUpdateBid(socket, message);});

            // - Send a 'Connected' message back to the client
            msg.emitConnected(socket);
        },
    
        /// #### Standard Events
        emitConnected: function emitConnected(socket) {
            // Send connected
            socket.emit('Connected', payload('/', {},'/',null,null));
        },

        /// #### Custom Events
        /// - A bid has been updated so broadcast to all others in the room
        onUpdateBid: function onUpdateBid(socket, msg) {
            if (msg.room) {
                msg.received = new Date().toISOString();
                if (msg.data && msg.data.auction_id && msg.data.auc_url) {
                    msg.data.auc_url += ('?ult_auc_id=' + msg.data.auction_id);
                }
                socket.broadcast.to(msg.room).emit('reload', msg);
                msg.broadcast = new Date().toISOString();
                api.messageDb.push('/bids/' + msg.room + '[]', {updatebid: msg});
                console.log('onUpdateBid: broadcast - ' + JSON.stringify(msg));
            }
            console.log('onUpdateBid: %s',JSON.stringify(msg));
        }

    };
})();

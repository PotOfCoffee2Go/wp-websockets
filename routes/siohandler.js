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

    /// - Got Watch request from client
    function onWatch(socket, msg) {
        if (msg.resource) {
            socket.join(msg.resource);
            console.log('onWatch: ' + socket.id + ' joined resource - ' + msg.resource);
        }
        else {
            console.log('onWatch: ' + socket.id + ' resource to join was not specified');
        }
    }

    /// - Got Unwat request from client
    function onUnwatch(socket, msg) {
        if (msg.resource) {
            socket.leave(msg.resource);
            console.log('onUnwatch: ' + socket.id + ' left resource - ' + msg.resource);
        }
        else {
            console.log('onUnwatch: ' + socket.id + ' resource to leave was not specified ');
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
        else if(resPath[1] === 'db' && resPath[2] === 'storage') {
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

    function onPut(socket, msg) {
        if (typeof msg.resource !== 'string') {
            console.log('onPut: ' + socket.id + ' Missing field (resource)');
            socket.emit('Put',
                payload(msg.resource, {} ,null,
                    {code:400, text: '400 - Bad Request - Missing field (resource)'},
                    {name:'RestError', message:'400 - Bad Request - Missing field (resource)'}));
            return;
        }
        
        var resPath = msg.resource.split('/');
        if(resPath[1] === 'db' && resPath[2] === 'storage') {
            storage.put(msg.resource, msg.data, function(err, data, retCode) {
                retCode = retCode || null;
                if (!err) {
                    socket.emit('Put', payload(msg.resource, data, msg.resource, retCode, null));
                }
                else {
                    console.log('onPut: ' + socket.id + ' server error ' + err.message);
                    socket.emit('Put', 
                        payload(msg.resource, {} ,null,
                            {code:400, text: '400 - Bad Request'},
                            {name: err.name, message: err.message}));
                }
            });
        }
        else {
            console.log('onPut: ' + socket.id + ' resource ' + msg.resource + ' not found ');
            socket.emit('Put', 
                payload(msg.resource, {} ,null,
                    {code:404, text: '404 - Not Found'},
                    {name:'RestError', message:'404 - Not Found'}));
        }
    }
    
    function onPost(socket, msg) {
        if (typeof msg.resource !== 'string') {
            console.log('onPost: ' + socket.id + ' Missing field (resource)');
            socket.emit('Post',
                payload(msg.resource, {} ,null,
                    {code:400, text: '400 - Bad Request - Missing field (resource)'},
                    {name:'RestError', message:'400 - Bad Request - Missing field (resource)'}));
            return;
        }
        
        var resPath = msg.resource.split('/');
        if(resPath[1] === 'db' && resPath[2] === 'storage') {
            storage.post(msg.resource, msg.data, function(err, data, retCode) {
                retCode = retCode || null;
                if (!err) {
                    socket.emit('Post', payload(msg.resource, data, msg.resource, retCode, null));
                }
                else {
                    console.log('onPost: ' + socket.id + ' server error ' + err.message);
                    socket.emit('Post', 
                        payload(msg.resource, {} ,null,
                            {code:400, text: '400 - Bad Request'},
                            {name: err.name, message: err.message}));
                }
            });
        }
        else {
            console.log('onPost: ' + socket.id + ' resource ' + msg.resource + ' not found ');
            socket.emit('Post', 
                payload(msg.resource, {} ,null,
                    {code:404, text: '404 - Not Found'},
                    {name:'RestError', message:'404 - Not Found'}));
        }
    }
    
    
    
    
    function onPatch(socket, msg) {}
    function onDelete(socket, msg) {}

    /// #### Standard Events
    function emitConnected(socket) {
        // Send connected
        socket.emit('Connected', payload('/', {},'/',null,null));
    }

    /// #### Custom Events
    /// - A bid has been updated so broadcast to all others in the room
    function onUpdateBid(socket, msg) {
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

    module.exports = {

        init: function init(socket) {
            /// #### Standard Messages
            socket.on('disconnect', () => {console.log('onDisconnect: ' + socket.id);});
            socket.on('Watch', (message) => {onWatch(socket, message);});
            socket.on('Unwatch', (message) => {onUnwatch(socket, message);});

            socket.on('Get', (message) => {onGet(socket, message);});
            socket.on('Post', (message) => {onPost(socket, message);});
            socket.on('Put', (message) => {onPut(socket, message);});
            socket.on('Patch', (message) => {onPatch(socket, message);});
            socket.on('Delete', (message) => {onDelete(socket, message);});

            socket.on('update bid', (message) => {onUpdateBid(socket, message);});

            // - Send a 'Connected' message back to the client
            emitConnected(socket);
        }
    };
    

})();

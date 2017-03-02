"use strict";

// Assign namespace to hold Onyx & Breezy auction data and functions
var obapi = obapi || {};

(function (ns) {
    /* global io */

    ns.connect = function obapi_connect(url) {

        if (typeof io === 'undefined') {
            throw new Error('Script socket.js must be loaded for WebSockets to work');
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.js"></script>
        }

        // Connect to server and get our socket
        ns.socket = io.connect(url, {reconnect: true});

        ns.on = function(event, listener) {ns.socket.on(event, listener); };
        ns.off = function(event, listener) { ns.socket.removeListener(event, listener); };
        
        // Implement catch-all for custom messages
        //  only catches custom events
        //  http://stackoverflow.com/questions/10405070/socket-io-client-respond-to-all-events-with-one-handler
        var onevent = ns.socket.onevent;
        ns.socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call (this, packet);        // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);         // additional call to catch-all
        };
        /* Usage of Catch-all custom events
        obapi.on('*',function(event, msg) {
            console.log('***', event, msg);
        });
        */
        
        // Emit message to the server
        ns.emit = function obapi_emit(message, payload) {
            ns.socket.emit(message, payload);
        };
        
        var payload = function(resource, data) {
            return {
                resource: resource,
                data: data ? data : {},
                location: null,
                error: null };
        };
        
        ns.join = function obapi_join(resource) {
            ns.emit('Join', payload(resource));
        };
        ns.leave = function obapi_leave(resource) {
            ns.emit('Leave', payload(resource));
        };
        ns.get = function obapi_get(resource) {
            ns.emit('Get', payload(resource));
        };
        ns.post = function obapi_post(resource, data) {
            ns.emit('Post', payload(resource, data));
        };
        ns.put = function obapi_put(resource, data) {
            ns.emit('Put', payload(resource, data));
        };
        ns.patch = function obapi_patch(resource, data) {
            ns.emit('Patch', payload(resource, data));
        };
        ns.delete = function obapi_delete(resource) {
            ns.emit('Delete', payload(resource));
        };

    };
})(obapi);


"use strict";

// Assign namespace to hold Onyx & Breezy auction data and functions
var obapi = obapi || {};

(function (ns) {
    /* global io */

    ns.io = {};
    ns.io.connect = function poc2go_io_connect(url) {

        if (typeof io === 'undefined') {
            throw new Error('Script socket.io.js must be loaded for WebSockets to work');
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js"></script>
        }

        // Connect to server and get our socket
        ns.io.socket = io.connect(url, {reconnect: true});

        ns.on = function(event, listener) {ns.io.socket.on(event, listener); };
        ns.off = function(event, listener) { ns.io.socket.removeListener(event, listener); };
        
        // Implement catch-all for custom messages
        //  only catches custom events
        //  http://stackoverflow.com/questions/10405070/socket-io-client-respond-to-all-events-with-one-handler
        var onevent = ns.io.socket.onevent;
        ns.io.socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call (this, packet);        // original call
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);         // additional call to catch-all
        };
        /* Usage of Catch-all custom events
        obapi.on("*",function(event, msg) {
            console.log('***', event, msg);
        });
        */
        
        // Emit message to the server
        ns.io.emit = function poc2go_io_emit(message, payload) {
            ns.io.socket.emit(message, payload);
        };
    };
})(obapi);


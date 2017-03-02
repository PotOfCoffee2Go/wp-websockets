"use strict";

// Assign namespace to hold auction data and functions
var poc2go = poc2go || {};
poc2go.data = poc2go.data || {};

(function (ns) {
    ns.io = {};
    
    /* global io EventEmitter */
    ns.io.connect = function poc2go_io_connect(url) {

        if (typeof io === 'undefined') {
            throw new Error('Script socket.io.js must be loaded for WebSockets to work');
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js"></script>
        }

        // Messages from the server will trigger javascript events
        ns.ee = new EventEmitter();
        ns.on = function(event, listener) { ns.ee.on(event, listener); };
        ns.off = function(event, listener) { ns.ee.off(event, listener); };

        // Connect to server
        ns.io.socket = io.connect(url, {reconnect: true});
        
        // Emit message to the server
        ns.io.emit = function poc2go_io_emit(message, payload) {
            ns.io.socket.emit(message, payload);
        };
        
        ns.io.socket.on('connect', function () {
            ns.ee.trigger('connect',[{}]);
        });
        ns.io.socket.on('disconnect', function () {
            ns.ee.trigger('disconnect',[{}]);
        });
    
        ns.io.socket.on('Connected', function (msg) {
            ns.ee.trigger('Connected', [msg]);
            msg.room = 'abc';
            ns.io.emit('Join', msg);
            ns.io.emit('getAuctions', '/api/auctions/auction');
        });

        ns.io.socket.on('getAuctions', function (msg) {
            ns.ee.trigger('Auctions', [msg]);
        });
    }

/*
    // Export variables and functions
    function emitConnected(msg) {
//           csocket.emit('connected', msg);
        changeIoIndicator('green');
    }

    // -----------------------
    
    function changeIoIndicator(color) {
        if (color === 'red') {
            console.log('Red');
        }
        else if (color === 'green') {
            console.log('Green');
        }
    }

    // Add to namespace
    ns.changeIoIndicator = changeIoIndicator;
*/
})(poc2go);

/*!
 * EventEmitter v5.1.0 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * https://github.com/Olical/EventEmitter
 * @preserve
 */
(function(){"use strict";function t(){}function i(t,n){for(var e=t.length;e--;)if(t[e].listener===n)return e;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var e=t.prototype,r=this,s=r.EventEmitter;e.getListeners=function(n){var r,e,t=this._getEvents();if(n instanceof RegExp){r={};for(e in t)t.hasOwnProperty(e)&&n.test(e)&&(r[e]=t[e])}else r=t[n]||(t[n]=[]);return r},e.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},e.getListenersAsObject=function(n){var e,t=this.getListeners(n);return t instanceof Array&&(e={},e[n]=t),e||t},e.addListener=function(r,e){var t,n=this.getListenersAsObject(r),s="object"==typeof e;for(t in n)n.hasOwnProperty(t)&&-1===i(n[t],e)&&n[t].push(s?e:{listener:e,once:!1});return this},e.on=n("addListener"),e.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},e.once=n("addOnceListener"),e.defineEvent=function(e){return this.getListeners(e),this},e.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},e.removeListener=function(r,s){var n,e,t=this.getListenersAsObject(r);for(e in t)t.hasOwnProperty(e)&&(n=i(t[e],s),-1!==n&&t[e].splice(n,1));return this},e.off=n("removeListener"),e.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},e.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},e.manipulateListeners=function(r,t,i){var e,n,s=r?this.removeListener:this.addListener,o=r?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(e=i.length;e--;)s.call(this,t,i[e]);else for(e in t)t.hasOwnProperty(e)&&(n=t[e])&&("function"==typeof n?s.call(this,e,n):o.call(this,e,n));return this},e.removeEvent=function(e){var t,r=typeof e,n=this._getEvents();if("string"===r)delete n[e];else if(e instanceof RegExp)for(t in n)n.hasOwnProperty(t)&&e.test(t)&&delete n[t];else delete this._events;return this},e.removeAllListeners=n("removeEvent"),e.emitEvent=function(n,u){var r,e,t,i,o,s=this.getListenersAsObject(n);for(i in s)if(s.hasOwnProperty(i))for(r=s[i].slice(0),t=0;t<r.length;t++)e=r[t],e.once===!0&&this.removeListener(n,e.listener),o=e.listener.apply(this,u||[]),o===this._getOnceReturnValue()&&this.removeListener(n,e.listener);return this},e.trigger=n("emitEvent"),e.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},e.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},e._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},e._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return r.EventEmitter=s,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:r.EventEmitter=t}).call(this);
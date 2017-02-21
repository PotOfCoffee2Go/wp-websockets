(function () {
    "use strict";
     var api  = require('./api.js');

    module.exports = {
        /// #### Standard Events
        emitConnected: function emitConnected(socket) {
            // Send connected
            socket.emit('Connected', {
              room: null,
              data: {},
              error: null
            });
        },

        /// - Got Join request from client
        ///   - Have them join the room they put in msg.data.room
        onJoin: function onJoin(socket, msg) {
            if (msg.room) {
              socket.join(msg.room);
              console.log('onJoin: ' + socket.id + ' joined room - ' + JSON.stringify(msg));
            }
            else {
              console.log('onJoin: ' + socket.id + ' msg.data.room was not specified ' + JSON.stringify(msg));
            }
        },
        
        /// - Got Leave request from client
        ///   - Have them leave the room they put in msg.data.room
        onLeave: function onLeave(socket, msg) {
            if (msg.room) {
              socket.leave(msg.room);
              console.log('onLeave: ' + socket.id + ' left room - ' + JSON.stringify(msg));
            }
            else {
              console.log('onLeave: ' + socket.id + ' msg.data.room was not specified ' + JSON.stringify(msg));
            }
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

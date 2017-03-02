    (function (ns) {
        "use strict";
        
        /* global io */
        var csocket = io.connect('https://wp-websockets-potofcoffee2go.c9users.io', {reconnect: true});
        
        csocket.on('connect', function () {
            console.log('API Server Onconnect');
        });
        csocket.on('disconnect', function () {
            changeIoIndicator('red');
        });
    
        csocket.on('Connected', function (msg) {
            console.log('API Server Connected: ' + JSON.stringify(msg));
            msg.room = 'abc';
            csocket.emit('Join', msg);
            csocket.emit('getAuctions', '/api/auctions/auction');
        });


        csocket.on('getAuctions', function (msg) {
            ns.data = msg.data;
            ns.auctionItem();
            console.log('Namespace poc2go : ');
            console.log(ns);

        });


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
    })(poc2go); /* global poc2go */

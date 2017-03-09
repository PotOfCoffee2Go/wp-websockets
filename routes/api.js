(function () {
    "use strict";
    var   fs        = require('fs'),
          cfg       = require('../../data/config.js'),
          JsonDB    = require('node-json-db');
          
    // Create/Open database
    if (!fs.existsSync(cfg.jsondb.dir)) {
        fs.mkdirSync(cfg.jsondb.dir);
    }

    var api = module.exports = {
        auctionDb: new JsonDB(cfg.jsondb.auctionDb, true, true), // true = auto save, true = pretty
        messageDb: new JsonDB(cfg.jsondb.messageDb, true, true), // true = auto save, true = pretty

        auctions: function auctions(url, cb) {
            // Handle url terminating with a '/' by removing it
            if (url[url.length-1] === '/') url = url.substring(0, url.length-1);
            // Edge case where a complete collection being requested
            if (url === '/api/auctions') url = '/api/auctions/';
            
            var action = {
                url: url,
                cb: cb,
                urlparts: url.replace('/api/auctions/','').split('/'),
                resource: url.replace('/api/auctions','')
            };
            queryDb(api.auctionDb, action);
        },

        messages: function messages(url, cb) {
            // Handle url terminating with a '/' by removing it
            if (url[url.length-1] === '/') url = url.substring(0, url.length-1);
            // Edge case where a complete collection being requested
            if (url === '/api/messages') url = '/api/messages/';
            
            var action = {
                url: url,
                cb: cb,
                urlparts: url.replace('/api/messages/','').split('/'),
                resource: url.replace('/api/messages','')
            };
            queryDb(api.messageDb, action);
        }
        
    };
    
    function queryDb(db, action) {
            var data = {}, err = null;
            try {
                    var got = db.getData(action.resource);
                    var lastpart = data;
                    for (var i = 0; i < action.urlparts.length-1; i++) {
                        lastpart = lastpart[action.urlparts[i]] = {};
                    }
                    if (action.resource === "/") {
                        data = got;
                    }
                    else {
                        lastpart[action.urlparts[i]] = got;
                    }
                }
                catch(error) {
                    err = error;
                }
            if (action.cb) action.cb(err, data);
    }



})();


(function () {
    "use strict";
    var   fs        = require('fs'),
          cfg       = require('../utils/config.js'),
          JsonDB    = require('node-json-db');
          
    // Create/Open database
    if (!fs.existsSync(cfg.jsondb.dir)) {
        fs.mkdirSync(cfg.jsondb.dir);
    }

    var api = module.exports = {
        auctionDb: new JsonDB(cfg.jsondb.auctionDb, true, true), // true = auto save, true = pretty
        messageDb: new JsonDB(cfg.jsondb.messageDb, true, true), // true = auto save, true = pretty

        messages: function messages(url, cb) {
            var action = {
                url: url,
                cb: cb,
                urlparts: url.split('/')
            };
            if (action.urlparts[3] === 'bids' ) {
                bids(action);
            }

        },
        
        auctions: function auctions(url, cb) {
            var action = {
                url: url,
                cb: cb,
                urlparts: url.split('/')
            };
            if (action.urlparts[3] === 'something' ) {
                something(action);
            }

        },

    };
    
    function bids(action) {
            var data = [], err = null;
            try {
                    var got = api.messageDb.getData('/' + action.urlparts[3] + '/' + action.urlparts[4]);
                    got.forEach(function(element) {
                        data.push(element.updatebid);
                    });
                }
                catch(error) {
                    err = error;
                }
            if (action.cb) action.cb(err, data);
    }

})();


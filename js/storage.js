(function () {
    "use strict";
    var   fs        = require('fs'),
          cfg       = require('../utils/config.js'),
          JsonDB    = require('node-json-db');
          
    // Create/Open database
    if (!fs.existsSync(cfg.jsondb.dir)) {
        fs.mkdirSync(cfg.jsondb.dir);
    }

    var sdb = module.exports = {
        storageDb: new JsonDB(cfg.jsondb.storageDb, true, true), // true = auto save, true = pretty

        get: function get(url, cb) {
            // Handle url terminating with a '/' by removing it
            if (url[url.length-1] === '/') url = url.substring(0, url.length-1);
            // Edge case where a complete database being requested
            if (url === '/storage') url = '/storage/';
            
            var action = {
                url: url,
                cb: cb,
                urlparts: url.replace('/storage/','').split('/'),
                resource: url.replace('/storage','')
            };
            queryDb(sdb.storageDb, action);
        },
        post: function post(url, data, cb) {
            // Handle url terminating with a '/' by removing it
            if (url[url.length-1] === '/') url = url.substring(0, url.length-1);

            var action = {
                url: url,
                cb: cb,
                urlparts: url.replace('/storage/','').split('/'),
                resource: url.replace('/storage','')
            };
            sdb.storageDb.push(action.resource, data);
            if (cb) cb(null, {result: 'Done!!'});
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


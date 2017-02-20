
(function () {
    "use strict";
    const mysql  = require('mysql'),
         cfg    = require('../utils/config.js');

    var connection = null;
    
    module.exports = {
        db: function db(url, db, cb) {
            var action = {
                url: url,
                db: db,
                cb: cb,
                urlparts: url.split('/')
            };
            
            
            if (action.urlparts[3] === 'bidders' ) {
                connect();
                connection.query('select * from wp_wdm_bidders where auction_id=' + action.urlparts[4], function (error, results, fields) {
                if (error) throw error;
                connection.end();
                if (cb) cb(null, results);
                });

                //bidders(action);
            }


        },

    };
    
    function connect() {
        connection = mysql.createConnection(cfg.mysql);
        connection.connect();
    }


 
 

})();



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
                var aucId = action.urlparts[4];
                connect();
                connection.query('select * from wp_wdm_bidders where auction_id=' + aucId, function (berror, bresults, bfields) {
                    if (berror) throw berror;
                    connection.query('select * from wp_posts where id=' + aucId, function (perror, presults, pfields) {
                        if (perror) throw perror;
                        connection.query('select * from wp_postmeta where post_id=' + aucId, function (merror, mresults, mfields) {
                            if (merror) throw merror;
                            connection.query('select * from wp_comments where comment_post_id=' + aucId, function (cerror, cresults, cfields) {
                                if (cerror) throw cerror;
                                connection.end();
                                
                                var metadata = {};
                                mresults.forEach(function(element) {
                                    metadata[element.meta_key] = element.meta_value;
                                });
    
                                presults[0].meta =  metadata;
                                presults[0].comments =  cresults;
                                presults[0].bidders =  bresults;
                                if (cb) cb(null, {auction: presults[0]});
                            });
                        });
                    });
                });
            }
            
            
            else if (action.urlparts[3] === 'users' ) {
                var userId = action.urlparts[4];
                connect();
                connection.query('select * from wp_users' + (userId ? (' where id=' + userId) : ''), function (uerror, uresults, ufields) {
                    if (uerror) throw uerror;
                    connection.end();
                    if (cb) cb(null, {users: uresults});
                });
            }
            
        },

    };
    
    function connect() {
        connection = mysql.createConnection(cfg.mysql);
        connection.connect();
    }

})();



(function () {
    "use strict";
    const mysql  = require('mysql'),
          async  = require('async'),
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
            
            
            if (action.urlparts[3] === 'auctions' ) {
                connect();

                var aucId = action.urlparts[4];
                connection.query('select * from wp_posts' + (aucId ? (' where id=' + aucId) : ''), function (perror, presults, pfields) {
                    if (perror) throw perror;
                    if (presults.length === 0) {
                        connection.end();
                        if (cb) cb(null, {auctions: [{ID: aucId, meta: {}, comments: [], bidders: []}]});
                        return;
                    }

                    var auctions = [];

                    async.forEachOf(presults, function (post, key, callback) {
                        if (post.post_type === 'ultimate-auction') {
                            connection.query('select * from wp_wdm_bidders where auction_id=' + post.ID, function (berror, bresults, bfields) {
                                if (berror) console.log(berror);
                                connection.query('select * from wp_postmeta where post_id=' + post.ID, function (merror, mresults, mfields) {
                                    if (merror) console.log(merror);
                                    connection.query('select * from wp_comments where comment_post_id=' + post.ID, function (cerror, cresults, cfields) {
                                        if (cerror) console.log(cerror);
                                        
                                        var metadata = {};
                                        mresults.forEach(function(element) {
                                            metadata[element.meta_key] = element.meta_value;
                                        });
            
                                        post.meta =  metadata;
                                        post.comments =  cresults;
                                        post.bidders =  bresults;
                                        auctions.push(post);
                                        callback();
                                    });
                                });
                            });
                        }
                        else {
                            callback();
                        }
                    }, function (err) {
                        if (err) throw err;
                        connection.end();
                        if (cb) cb(null, {auctions: auctions});
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
        // connection.connect();
    }

})();


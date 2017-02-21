
(function () {
    "use strict";
    const mysql  = require('mysql'),
          async  = require('async'),
          cfg    = require('../utils/config.js');

    var connection = null;

    module.exports = {
        db: function db(url, cb) {
            var action = {
                url: url,
                db: db,
                cb: cb,
                urlparts: url.split('/')
            };
            
            
            if (action.urlparts[3] === 'auctions' ) {
                var aucId = action.urlparts[4];
                var connection = mysql.createConnection(cfg.mysql);
                connection.query('select * from wp_posts where post_type = "ultimate-auction" ' + 
                        (aucId ? (' and id=' + aucId) : ''), function (perror, presults, pfields) {
                    if (perror) throw perror;
                    if (presults.length === 0) {
                        connection.end();
                        if (cb) cb(null, {auctions: [{ID: aucId, meta: {}, comments: [], bidders: []}]});
                        return;
                    }

                    var auctions = [];

                    async.forEachOf(presults, function (post, key, callback) {
                        connection.query('select wp_wdm_bidders.*, wp_users.user_login, wp_users.display_name from wp_wdm_bidders ' +
                                'left join wp_users on wp_wdm_bidders.email = wp_users.user_email ' +
                                'where auction_id=' + post.ID, function (berror, bresults, bfields) {
                            if (berror) callback(berror);
                            connection.query('select * from wp_postmeta where post_id=' + post.ID, function (merror, mresults, mfields) {
                                if (merror) callback(merror);
                                connection.query('select * from wp_comments where comment_post_id=' + post.ID, function (cerror, cresults, cfields) {
                                    if (cerror) callback(cerror);
                                    var toptions = {nestTables: false, sql: 'select * from wp_term_relationships ' +
                                        'left join wp_terms on wp_term_relationships.term_taxonomy_id = wp_terms.term_id ' +
                                        'left join wp_term_taxonomy on wp_term_relationships.term_taxonomy_id = wp_term_taxonomy.term_id ' +
                                        'where wp_term_relationships.object_id=' + post.ID};
                                    connection.query(toptions, function (terror, tresults, tfields) {
                                        if (terror) callback(terror);
                                        
                                        var metadata = {};
                                        mresults.forEach(function(element) {
                                            metadata[element.meta_key] = element.meta_value;
                                        });
            
                                        post.meta =  metadata;
                                        post.categories =  tresults;
                                        post.comments =  cresults;
                                        post.bidders =  bresults;
                                        auctions.push(post);
                                        callback();
                                    });
                                });
                            });
                        });
                    }, function (err) {
                        if (err) throw err;
                        connection.end();
                        if (cb) cb(null, {auctions: auctions});
                    });
                });
            }
            
            
            else if (action.urlparts[3] === 'users' ) {
                var userId = action.urlparts[4];
                var connection = mysql.createConnection(cfg.mysql);
                connection.query('select * from wp_users' + (userId ? (' where id=' + userId) : ''), function (uerror, uresults, ufields) {
                    if (uerror) throw uerror;
                    connection.end();
                    if (cb) cb(null, {users: uresults});
                });
            }
            

            else if (action.urlparts[3] === 'test' ) {
                aucId = action.urlparts[4];
                var options = {nestTables: false};
                options.sql = 'select * from wp_posts ' + 
                    'LEFT JOIN wp_wdm_bidders ON wp_posts.ID = wp_wdm_bidders.auction_id ' +
                    'LEFT JOIN wp_postmeta ON wp_posts.ID = wp_postmeta.post_id ' +
                    'LEFT JOIN wp_comments ON wp_posts.ID = wp_comments.comment_post_id ' +
                    (aucId ? (' where wp_posts.id=' + aucId) : '');
                var connection = mysql.createConnection(cfg.mysql);
                connection.query(options, function (error, results, fields) {
                    if (error) throw error;
                    connection.end();
                    if (cb) cb(null, {auctions: results});
                });
            }

            
        },

    };
    

})();


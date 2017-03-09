
(function () {
    "use strict";
    const mysql  = require('mysql'),
          async  = require('async'),
          cfg    = require('../../data/config.js'),
          api    = require('./api.js');


    var mySql = module.exports = {
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
                                        
                                        var data = {};
                                        data.post = post;
                                        data.meta =  metadata;
                                        data.categories =  tresults;
                                        data.comments =  cresults;
                                        data.bidders =  bresults;
                                        auctions.push(data);
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
            

            else if (action.urlparts[3] === 'rebuild' ) {
                mySql.db('/mysql/db/auctions/', function(err, data) {
                    if (err) throw err;
                    mySql.db('/mysql/db/users/', function(uerr, udata) {
                        if (uerr) throw uerr;
                        var users = {};
                        udata.users.forEach(function(user) {
                            users['u' + user.ID] = user;
                        });
                        var auctions = {};
                        data.auctions.forEach(function(auction) {
                            auctions['a' + auction.post.ID] = auction;
                        });
                        
                        api.auctionDb.push('/', {user: users, auction: auctions});
                        if (cb) cb(null, {result: 'Done!!'});
                    });
                    
                });
            }

        }

    };
    

})();


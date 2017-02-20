(function () {
    "use strict";
    module.exports = {
        db: function db(url, db, cb) {
            var action = {
                url: url,
                db: db,
                cb: cb,
                urlparts: url.split('/')
            };
            if (action.urlparts[3] === 'bids' ) {
                bids(action);
            }

        },

    };
    
    function bids(action) {
            var data = [], err = null;
            try {
                    var got = action.db.getData('/' + action.urlparts[3] + '/' + action.urlparts[4]);
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


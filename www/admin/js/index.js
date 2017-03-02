    'use strict';
    $(function() {/* global $ obapi Handlebars */
    
        obapi.io.connect('https://wp-websockets-potofcoffee2go.c9users.io');

        // Catch-all custom events (will not see connect/disconnect/etc.)
        obapi.on("*",function(event, msg) {
            console.log('***', event, '***', msg);
        });

        /// Standard socket.io events
        // socket.io connect
        obapi.on('connect', function() {
            console.log('Established WebSocket connection to auction server');
        });
        // socket.io disconnect
        obapi.on('disconnect', function() {
            console.log('WebSocket disconnected from auction server');
        });

        /// Custom socket.io events
        // Connection accepted
        obapi.on('Connected', function(msg) {
            console.log('Connected to auction server');
            obapi.io.emit('/api/auctions/auction', '');    // Get all auctions
            obapi.io.emit('/api/auctions/user', '');       // Get all users
        });

        // List of users
        obapi.on('/api/auctions/user', function(msg) {
            // console.log('*** Users', msg);
            var source = $('#users-info-template').html();
            var template = Handlebars.compile(source);
            Object.keys(msg.data.user).forEach(function(user) {
                $('#users-info').append(template(msg.data.user[user]));
            });
        });

        // List of auctions
        obapi.on('/api/auctions/auction', function(msg) {
            // console.log('*** Auctions', msg);
            var source = $('#auction-item-template').html();
            var template = Handlebars.compile(source);
            Object.keys(msg.data.auction).forEach(function(item) {
                $('#auction-items').append(template(msg.data.auction[item]));
            });

        });

        $( "#about" ).click(function() {
            // console.log( "Handler for about .click() called." );
            var codeUrl = 'https://wp-websockets-potofcoffee2go.c9users.io/api/auctions/auction/a117';
            
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                    if (xmlhttp.status == 200) {
                        var responseJson = JSON.parse(xmlhttp.responseText);
                        $('#post1 img').attr('src', responseJson.auction.a117.meta.wdm_auction_thumb);
                        $('#post1 h3').html(responseJson.auction.a117.post.post_title);
                        $('#post1 p:first').html(responseJson.auction.a117.post.post_content);
                    }
                    else {
                        throw new Error('markupcode: get source file returned status ' + xmlhttp.status);
                    }
                }
            };
            xmlhttp.open('GET', codeUrl, true);
            xmlhttp.send();

        });
        
        $( "#services" ).click(function() {
            console.log( "Handler for services .click() called." );
        });
        
        $( "#contact" ).click(function() {
            console.log( "Handler for contact .click() called." );
        });
        
        $( "#call-to-action" ).click(function() {
            console.log( "Handler for call-to-action .click() called." );
        });

        obapi.auctionClick = function auctionClick(item) {
            alert(item + ' Auction Page');
        }
        
        obapi.moreInfoClick = function moreInfoClick(item) {
            alert(item+ ' More Info Page');
        }

        console.log( "ready!" );
    });

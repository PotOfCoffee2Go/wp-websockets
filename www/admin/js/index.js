    'use strict';
    $(function() {/* global $ poc2go Handlebars*/
    
        poc2go.io.connect('https://wp-websockets-potofcoffee2go.c9users.io');

        // socket.io connect
        poc2go.on('connect', function() {
            console.log('Established WebSocket connection to auction server');
        });
        // socket.io disconnect
        poc2go.on('disconnect', function() {
            console.log('WebSocket disconnected from auction server');
        });

        // Connection accepted
        poc2go.on('Connected', function(msg) {
            console.log('Connected to auction server');
            console.log(msg);
        });
        // List of auctions
        poc2go.on('Auctions', function(msg) {
            console.log('List of Auctions');
            console.log(msg);

            var source = 
                '<div id="feeder-a{{post.ID}}" class="col-md-3 col-sm-6 hero-feature">' +
                '    <div class="thumbnail">' +
                '        <img src="{{meta.wdm_auction_thumb}}" style="display:block;max-width:230px;max-height:95px;" alt="">' +
                '        <div class="caption">' +
                '            <h3>{{post.post_title}}</h3>' +
                '            <p>{{post.post_content}}</p>' +
                '            <p>Status: {{categories.0.name}}</p>' +
                '            <p>' +
                '                <a onClick="poc2go.auctionClick(\'a{{post.ID}}\');"  href="#" class="btn btn-primary">Auction!</a>' + 
                '                <a onClick="poc2go.moreInfoClick(\'a{{post.ID}}\');" href="#" class="btn btn-default">More Info</a>' +
                '            </p>' +
                '        </div>' +
                '    </div>' +
                '</div>';
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

        poc2go.auctionClick = function auctionClick(item) {
            alert(item + ' Auction Page');
        }
        
        poc2go.moreInfoClick = function moreInfoClick(item) {
            alert(item+ ' More Info Page');
        }

        console.log( "ready!" );
    });

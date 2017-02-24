    'use strict';
    $(function() {/* global $ */
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

        console.log( "ready!" );
    });

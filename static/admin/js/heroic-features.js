    'use strict';
    
    $(function() {
      $( "#about" ).click(function() {
        console.log( "Handler for about .click() called." );
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

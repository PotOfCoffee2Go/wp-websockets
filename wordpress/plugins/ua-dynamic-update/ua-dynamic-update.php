<?php
/*
Plugin Name: UA-Dynamic-Update
Plugin URI: http://codescullery.net/wp1
Version: 1.0.0
License: MIT
Author: PotOfCoffee2GO
Author URI: http://codescullery.net/poc2g/site/
Description: Provides dynamic updates for the Ultimate Auction plugin
*/

function uadu_activation() {
}
register_activation_hook(__FILE__, 'uadu_activation');

function uadu_deactivation() {
}
register_deactivation_hook(__FILE__, 'fwds_slider_deactivation');

/* Javascript */
function uadu_scripts() {

  wp_enqueue_script('jquery');

  wp_enqueue_script('socketio', '//cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js');

  wp_register_script('uadu_client', plugins_url('js/client.js', __FILE__),array("socketio"));
  wp_enqueue_script('uadu_client');

}
add_action('wp_enqueue_scripts', 'uadu_scripts');






?>

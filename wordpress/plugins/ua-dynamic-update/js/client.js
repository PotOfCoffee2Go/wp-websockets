function uadu_websocket(room) {
	this.socket = null;
	this.data = {
                room: room
	};
	
	this.start();
}

	
uadu_websocket.prototype.start = function start() {
	var self = this;
	this.socket = io.connect('https://wp-websockets-potofcoffee2go.c9users.io');
	
	this.socket.on('disconnect', function () {
		self.changeIoIndicator('red');
	});
	this.socket.on('connected', function (msg) {
		console.log('OnConnected: ' + JSON.stringify(msg));
		self.emitConnected();
	});
 	this.socket.on('reload', function (msg) {
		var x = document.getElementsByClassName("wdm_bidding_price");
		for (var i = 0; i < x.length; i++) {
		    x[i].innerHTML = '<strong>$' + (Number(msg.data.ab_bid).toFixed(2)) + ' USD</strong>';
		}
	});
}
 
uadu_websocket.prototype.emitConnected = function emitConnected() {
	this.socket.emit('connected',
	        {
	            data: this.data,
	            error: null
	        });
	this.changeIoIndicator('green');
}
	
uadu_websocket.prototype.emitUpdateBid = function emitUpdateBid(data) {
	data.room = data.auction_id;
	this.socket.emit('update bid',
	        {
	            data: data,
	            error: null
	        });
}
	
	// -----------------------
	
uadu_websocket.prototype.changeIoIndicator = function changeIoIndicator(color) {
	if (color === 'red') {
		document.querySelector('#redio-img').style.display = 'inline-block';
		document.querySelector('#greenio-img').style.display = 'none';
	}
	else if (color === 'green') {
		document.querySelector('#redio-img').style.display = 'none';
		document.querySelector('#greenio-img').style.display = 'inline-block';
	}
}
	


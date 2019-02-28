var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname + '/client'));

serv.listen(3000);
console.log('server started.');

var SOCKET_LIST = {};

//entity

var Entity = function() {
	var self = {
		x: 100,
		y: 10,
		spdX: 0,
		spdY: 0,
		id: "",
	}
	self.update = function () {
		self.updatePosition()
	}
	self.updatePosition = function () {
		self.x += self.spdX;
		self.y += self.spdY;
	}
	return self
}

//player info

var Player = function(id){
	var self = Entity();
		self.id = id;
		self.number = "" + Math.floor(10 * Math.random());
		self.pressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.maxSpd = 1;

		var superUpdate = self.update;
		self.update = function () {
			self.updateSpd();
			superUpdate();
		}

		self.updateSpd = function () {
			if(self.pressingRight)
				self.spdX = self.maxSpd;
			else if (self.pressingLeft)
				self.spdX = -self.maxSpd;
			else
				self.spdX = 0;

			if(self.pressingUp)
				self.spdY = -self.maxSpd;
			else if (self.pressingDown)
				self.spdY = self.maxSpd;
			else
				self.spdY = 0;
		}
	Player.list[id] = self;
	return self;
}

Player.list = {};
Player.onConnection = function (socket) {
	var player = Player(socket.id);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
	});
}
Player.onDisconnection = function (socket) {
	delete Player.list[socket.id];
}
Player.update = function () {
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}
	return pack;
}

//start server

var io = require('socket.io')(serv,{});

//connection

io.sockets.on('connection', function(socket){

	console.log('user connection');
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	Player.onConnection(socket);


//disconnection

	socket.on('disconnect',function(){
		console.log('user disconnection');
		delete SOCKET_LIST[socket.id];
		Player.onDisconnection(socket);
	});

//movements


});

//update loop

setInterval(function(){
	var pack = Player.update();

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/60);
////////////////
//SERVER-START//
////////////////

const express = require('express');
const app = express();
const serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(3000);
console.log('server started.');

///////////
//MONGODB//
///////////

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://biemsday:Kleopatra21@cluster0-shard-00-00-od0we.gcp.mongodb.net:27017,cluster0-shard-00-01-od0we.gcp.mongodb.net:27017,cluster0-shard-00-02-od0we.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";
const client = new MongoClient(uri,  {useNewUrlParser: true});
const dbName = "project-w";

client.connect(function(err, client){
	const db = client.db(dbName);
	const col = db.collection('users');
	console.log("Connected correctly to server");
});

//////////
//ENTITY//
//////////

var SOCKET_LIST = {};

var Entity = function() {
	var self = {
		x: 100,
		y: 10,
		spdX: 0,
		spdY: 0,
		id: "",
	};
	self.update = function () {
		self.updatePosition()
	};
	self.updatePosition = function () {
		self.x += self.spdX;
		self.y += self.spdY;
	};
	return self
};

///////////////
//PLAYER-INFO//
///////////////

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
		};

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
		};

	Player.list[id] = self;
	return self;

};

Player.list = {};

//////////////////
//AUTHENTICATION//
//////////////////

var login = function(data,cb){

	client.connect(function(err, client){

		console.log("check user data");

		const db = client.db(dbName);
		const col = db.collection('users');

		col.find({user:data.username, password:data.password}).limit(2).toArray(function(err, docs) {

			if(docs.toString() !== ''){
				cb(true);
			} else {
				cb(false);
			}

			client.close();
		});
	});
};

//////////////
//CONNECTION//
//////////////

Player.onConnection = function (socket) {

	socket.on('login',function(data){
		login(data,function(res){
			if(res){
				console.log(res);
				socket.emit('loginResponse',{success:true});
				res = null;
			} else {
				console.log(res);
				socket.emit('loginResponse',{success:false});
				res = null;
			}
		});
	});

	socket.on('signUp',function(data){
		isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});
			} else {
				addUser(data,function(){
					socket.emit('signUpResponse',{success:true});
				});
			}
		});
	});

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
};

Player.onDisconnection = function (socket) {
	delete Player.list[socket.id];
};

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
};

////////////////
//SERVER-START//
////////////////

var DEBUG = true;

var io = require('socket.io')(serv,{});

//////////////
//CONNECTION//
//////////////

io.sockets.on('connection', function(socket){

	console.log('user connection');
	socket.id = Math.floor(99999 * Math.random());
	SOCKET_LIST[socket.id] = socket;
	Player.onConnection(socket);

//chatMsg

	socket.on('sendMsgToServer',function(data){
		var playerName = ("user-" + socket.id);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('chatMsg',playerName+': '+data);
		}
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});

//disconnection

	socket.on('disconnect',function(){
		console.log('user disconnection');
		delete SOCKET_LIST[socket.id];
		Player.onDisconnection(socket);
	});
});

//update loop

setInterval(function(){
	var pack = Player.update();

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/60);
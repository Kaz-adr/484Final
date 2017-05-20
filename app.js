var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Hand = require('pokersolver').Hand;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var clients = 0;
var submissions = 0;
var highestHand = 0;
function remake(){
	let cardset = [
	'As',
	'2s',
	'3s',
	'4s',
	'5s',
	'6s',
	'7s',
	'8s',
	'9s',
	'Ts',
	'Js',
	'Qs',
	'Ks',
	'Ad',
	'2d',
	'3d',
	'4d',
	'5d',
	'6d',
	'7d',
	'8d',
	'9d',
	'Td',
	'Jd',
	'Qd',
	'Kd',
	'Ac',
	'2c',
	'3c',
	'4c',
	'5c',
	'6c',
	'7c',
	'8c',
	'9c',
	'Tc',
	'Jc',
	'Qc',
	'Kc',
	'Ah',
	'2h',
	'3h',
	'4h',
	'5h',
	'6h',
	'7h',
	'8h',
	'9h',
	'Th',
	'Jh',
	'Qh',
	'Kh',
	];
	cardset.sort(function(a, b){return 0.5 - Math.random()});
	console.log(cardset);
	return cardset;
}
var cards = remake();
	io.on('connection', function(socket){
		clients++;
		console.log('a user connected');
		socket.emit('yournumber', {number: clients});
		socket.on('disconnect', function(){
			clients--;
			console.log('user disconnected');
		});
		socket.on('begin', function(){
			if(clients>=2 && clients<=4){
				io.emit('ready');
				for(i = 1; i <= clients; i++){
					let nhand = [];
					for(j = 0; j < 5; j++){
						nhand.push(cards.pop());
					}
					io.emit('yourhand', {user: i, hand: nhand})
				}
			}
			else{
				io.emit('notready');
			}
		});
		socket.on('gimme', function(data){
			let v = [];
			for(i = 0; i < data.num;i++){
				v.push(cards.pop());
			}
			io.emit('hereugo',{user: data.user, new: v});
			//check if all players have submitted
			++submissions;
			if(submissions == clients){
				io.emit('nextround');
				console.log('next round');
				submissions = 0;
			}
		});
		socket.on('show', function(data){
			++submissions;
			if(Hand.solve(data.crds).rank > highestHand){
				highestHand = Hand.solve(data.crds).rank;
				console.log(highestHand);
			}
			io.emit('rate', {score: Hand.solve(data.crds),user: data.user});
			if(submissions == clients){
				io.emit('who');
				submissions = 0;
				//console.log(Hand.winners(allHands).rank);
			}
			
		});
		socket.on('almost', function(data){
			let b = false;
			++submissions;
			if(data.win.rank == highestHand){
				b = true;
				
			}
			else{
				b = false;
			}
			io.emit('winner', {user: data.user, winner: b});
			if(submissions == clients){
				//reset server
				highestHand = 0;
				cards = remake();
				io.emit('reset');
				submissions = 0;
			}
		});

		/*
		socket.on('chat message', function(msg){
    		console.log('message: ' + msg);
    		io.emit('chat message', msg);
  		});
  		*/
		/*
	  console.log('A user connected');
	  clients++;
	  //socket.emit('newclientconnect', {description: 'sup gamers'});
	  io.sockets.emit('ooo', {description: clients +' gamers connected'});
	  
	  setTimeout(function(){
	  	socket.emit('testerEvent', {description: 'A custom event named testerEvent!'})
	  }, 4000);
	  
	  //Whenever someone disconnects this piece of code executed
	  socket.on('disconnect', function () {
	  	clients--;
	    io.sockets.emit('ooo',{description: clients+ ' clients connected'});
	  });

	  socket.on('clientEvent', function(data){
	  	console.log(data);
	  });
		socket.emit('youfool', {description: 'room full</br><strong>fuck off for now</strong>'});
		*/
	});

//Whenever someone connects this gets executed


http.listen(3000, function(){
  console.log('listening on *:3000');
});
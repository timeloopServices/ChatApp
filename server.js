var sql = require("mysql");
var client = require("socket.io").listen(8080).sockets;
var connection = sql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "chat"
});

connection.connect(function(err){
	if(err) throw err;
		client.on('connection',function(socket){
		var sendStatus = function(s){
			socket.emit('status',s);
		};
		//emit messages
		connection.query("select * from messeges ORDER BY `messeges`.`id` ASC limit 100", function(err,res){
			if(err) throw err;
			socket.emit('output',res);
		});
		// wait for input
		socket.on('input', function(data){
			var whitespacePattern = /^\s*$/;
			if(whitespacePattern.test(data.name) || whitespacePattern.test(data.message)){
				sendStatus("Name and message is required.");
			}else{
				var post = {name:data.name,message: data.message};
				var query = connection.query("INSERT INTO messeges SET ?",post,function(err,res){
					//emit latest message to all clients
					client.emit('output',[data]);
					sendStatus({
						message: "Message sent!",
						clear: true
					});
				});		
			}										
			//console.log(data);
		});

	});
});



//var express = require('express');
//var socket = require('socket.io')

//var app = express();
var mysql = require('mysql');
var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"ecoescolas"
});


// ok eu vou criar um array para guardar as coisas, mas é só até resolvermos a cena da BD
//sorry

var arraypoints = [];
var arrayturmas = [];
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);



var port = process.env.PORT || 3000;


con.query("ALTER TABLE main ADD IF NOT EXISTS turma varchar(255) NOT NULL DEFAULT 'default'")

function add(turma){

    con.query("SELECT * FROM main WHERE turma = '"+turma+"'",function(err,result){
        if (err) console.log(err);
        if (result[0]) {
			//alert("Turma ja adicionada")
			io.emit('err',{err:"Turma ja adicionada!"});
			

        }else{
			con.query("INSERT IGNORE INTO main(turma,pontos) VALUES('"+turma+"','0')")
			var value = turma
			io.emit("startCourse",{turma:value})
            console.log("Turma "+turma+ " adicionada com sucesso")
        }
    })

    
}

function increment(points,turma){
	
	
    con.query("SELECT * FROM main WHERE turma = '"+turma+"'",function(err,result){
		if (err) throw err;
        if (result[0] != null) {
			con.query("UPDATE main SET pontos = pontos + '"+String(points)+"' WHERE turma = '"+turma+"'")
        }else{
            console.log("Turma nao existe")
        }
    })
}





server.listen(port, function(){
  console.log('listening on port ' + port + ', time to... try not to fail...');
});


//Links and stuuuff
app.get('/', function(req, res){
	res.sendFile('initialP.html', {root : __dirname})
});


app.get('/questions', function(req, res){
	res.sendFile(__dirname + '/questions.html')
});

app.get('/index', function(req, res){
	res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', newConnection);

io.on('connection',function(socket){
	
	socket.on('points',function(value){
		
		increment("5",value);
		var index = arrayturmas.findIndex(arrayturmas => arrayturmas === turma);
		arraypoints[index] += 1;
		
	})
	socket.on('addClass',function(data,target){
		add(data.value);
		
		socket.emit('startCourse',{},target);
	});
	socket.on('passClass',function(data){
		
		setTimeout(function(){
			io.emit('recieveClass',{turma:data.value})
		},2000);
		
	});
	socket.on("getScoreboard",function(){
		con.query("SELECT * FROM main ORDER BY pontos DESC",function(err,result){
			if (err) throw err;
			var txt = ""
			for (var k = 0; k < 6; k++){
				txt = txt + "Turma: " + result[k].turma + " | Pontos: " + result[k].pontos + "<br />";
			}
			socket.emit("recieveScoreBoard",{scoreboard:txt});
		})
	})
	socket.on('log',function(data){
		console.log(data);
	});

})

function newConnection(socket) {
	
}
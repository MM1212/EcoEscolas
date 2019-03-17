
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

/*
con.query("ALTER TABLE main ADD IF NOT EXISTS turma varchar(255) NOT NULL DEFAULT 'default'")

function add(turma){

    con.query("SELECT * FROM main WHERE turma = '"+turma+"'",function(err,result){
        if (err) console.log(err);
        if (result[0]) {
			//alert("Turma ja adicionada")
			io.emit('err',{err:"Turma ja adicionada!"});
			

        }else{
			con.query("INSERT IGNORE INTO main(turma,pontos) VALUES('"+turma+"','0')")
			io.emit("startCourse")
            console.log("Turma "+turma+ " adicionada com sucesso")
        }
    })

    
}
*/

function add(turma){
	arrayturmas.push(turma);
}

function increment(points,turma){
	console.log(turma)
	con.query("UPDATE main SET pontos = pontos + '"+String(points)+"' WHERE turma = '"+turma+"'")
    con.query("SELECT * FROM main WHERE turma = '"+turma+"'",function(err,result){
		if (err) throw err;
        if (result[0] != null) {
            
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
	res.sendFile('index.html', {root : __dirname})
});


app.get('/questions', function(req, res){
	res.sendFile(__dirname + '/questions.html')
});

io.sockets.on('connection', newConnection);
io.on('connection',function(socket){
	socket.on('points',function(value){
		
		//increment("5",value);
		var index = arrayturmas.findIndex(arrayturmas => arrayturmas === turma);
		arraypoints[index] += 1;
		
	})
	socket.on('add',function(data, code){
		//add(data.value);
		var target = code;
	socket.emit('startCourse', target);
	});
	socket.on('log',function(data){
		console.log(data);
	});

})

function newConnection(socket) {
	
}

//var express = require('express');
//var socket = require('socket.io')

//var app = express();
var mysql = require('mysql');
var con = mysql.createConnection({
    host:"42c987f7205d9ac5725f053a26421a857f2c5dbc498e78d190e2358ff97e821e",
    user:"ahldhajsuiczjh",
    database:"d2slusrirabf84"
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

con.query("CREATE TABLE IF NOT EXISTS main();")
con.query("CREATE TABLE IF NOT EXISTS gelados();")
con.query("ALTER TABLE main ADD IF NOT EXISTS turma varchar(255) NOT NULL DEFAULT 'default'")
con.query("ALTER TABLE gelados ADD IF NOT EXISTS gelados INT NOT NULL DEFAULT '0'")
con.query("ALTER TABLE gelados ADD IF NOT EXISTS money INT NOT NULL DEFAULT '0'")
con.query("ALTER TABLE gelados ADD IF NOT EXISTS type INT NOT NULL DEFAULT '0'")

function add(turma,target){

    con.query("SELECT * FROM main WHERE turma = '"+turma+"'",function(err,result){
        if (err) console.log(err);
        if (result[0]) {
			//alert("Turma ja adicionada")
			io.emit('err',{err:"Turma ja adicionada!"});
			

        }else{
			con.query("INSERT IGNORE INTO main(turma,pontos) VALUES('"+turma+"','0')")
			var value = turma
			io.emit("startCourse",{turma:value},target)
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


function new_iceCream(){
	con.query("UPDATE gelados SET gelados = gelados + '1' WHERE type = '0'")
	con.query("UPDATE gelados SET money = money + '1' WHERE type = '0'")	
}



server.listen(port, function(){
  console.log('listening on port ' + port + ', time to... try not to fail...');
});


//Links and stuuuff
app.get('/', function(req, res){
	res.sendFile('pages/initialP.html', {root : __dirname})
});


app.get('/questoesbonitas', function(req, res){
	res.sendFile(__dirname + '/pages/questions.html')
});

app.get('/inicio', function(req, res){
	res.sendFile(__dirname + '/pages/index.html')
});

app.get('/gelados', function(req, res){
	res.sendFile(__dirname + '/pages/geladosMain.html')
});

app.get('/gelados/manage', function(req, res){
	res.sendFile(__dirname + '/pages/geladosManage.html')
});

io.sockets.on('connection', newConnection);

io.on('connection',function(socket){
	
	socket.on('points',function(value){
		
		increment("5",value);
		var index = arrayturmas.findIndex(arrayturmas => arrayturmas === turma);
		arraypoints[index] += 1;
		
	})
	socket.on('addClass',function(data,target){
		add(data.value,target);
	});
	socket.on('passClass',function(data,code){
		
		setTimeout(function(){
			socket.emit('recieveClass',{turma:data.value},code)
		},20);
		
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
	socket.on("getIceCreams",function(){
		con.query("SELECT gelados FROM gelados WHERE type = '0'",function(err,result){
			if (err) throw err;
			if (result[0]){
				socket.emit("recieveIceCreams",{iceCreams:result[0].gelados});
			}else{
				socket.emit("recieveIceCreams",{});
			}
			
		})
	})
	socket.on("getIceCreamsMoney",function(){
		con.query("SELECT money FROM gelados WHERE type = '0'",function(err,result){
			if (err) throw err;
			if (result[0]){
				socket.emit("recieveIceCreamsMoney",{iceCreams:result[0].money});
			}else{
				socket.emit("recieveIceCreamsMoney",{});
			}
			
		})
	})
	socket.on("setIceCreamsMoney",function(){
		new_iceCream();
	})
	socket.on('log',function(data){
		console.log(data);
	});

})

function newConnection(socket) {
	
}
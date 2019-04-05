
//var express = require('express');
//var socket = require('socket.io')

//var app = express();
/*
var mysql = require('mysql');
var con = mysql.createConnection({
	host: "ec2-54-228-243-238.eu-west-1.compute.amazonaws.com",
	port: "5432",
    user: "kdrzimizeyhgdq",
	password:"41810520867a4dadbab35340dbb518b04d7d1f41d20b26bbf761b859624c7bec",
	database:"d1ucgtr0o6rs1r"
});
*/


const { Client } = require('pg');

const con = new Client({
  connectionString: "postgres://kdrzimizeyhgdq:41810520867a4dadbab35340dbb518b04d7d1f41d20b26bbf761b859624c7bec@ec2-54-228-243-238.eu-west-1.compute.amazonaws.com:5432/d1ucgtr0o6rs1r",
  ssl: true,
});

con.connect();

// ok eu vou criar um array para guardar as coisas, mas é só até resolvermos a cena da BD
//sorry

var arraypoints = [];
var arrayturmas = [];
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);



var port = process.env.PORT || 3000;

//con.query("CREATE TABLE IF NOT EXISTS main(turma varchar(255),pontos INT);")

//con.query("CREATE TABLE IF NOT EXISTS gelados();")

//con.query("ALTER TABLE main ADD IF NOT EXISTS turma varchar(255) NOT NULL DEFAULT 'default'")

//con.query("ALTER TABLE gelados ADD IF NOT EXISTS gelados INT NOT NULL DEFAULT '0'")

//con.query("ALTER TABLE gelados ADD IF NOT EXISTS money INT NOT NULL DEFAULT '0'")

//con.query("ALTER TABLE gelados ADD IF NOT EXISTS type INT NOT NULL DEFAULT '0'")


function add(turma,target){

    con.query("SELECT * FROM main WHERE turma = '"+turma+"';",function(err,result){
       if (err) console.log(err);
        if (result.rows[0]) {
			io.emit('err',{err:"Turma ja adicionada!"});
			

        }else{
			con.query("INSERT INTO main(turma,pontos) VALUES('"+turma+"','0');")
				io.emit("err",{err:"Turma "+turma+" adicionada com sucesso"})
				console.log("Turma "+turma+ " adicionada com sucesso")
			
        }
    })

    
}

function increment(points,turma){
	
	
    con.query("SELECT * FROM main WHERE turma = '"+turma+"';",function(err,result){
		if (err) throw err;
        if (result.rows[0] != null) {
			con.query("UPDATE main SET pontos = pontos + '"+String(points)+"' WHERE turma = '"+turma+"';")
		
       }else{
			console.log("Turma nao existe")
		
        }
 		})
}


function new_iceCream(money,type){
	if (type == 0) {
		con.query("UPDATE gelados SET gelados = gelados + '1' WHERE type = '0';")
	}
	con.query("UPDATE gelados SET money = money + '"+String(money)+"' WHERE type = '0';")	
}



server.listen(port, function(){
  console.log('OLAAAAA, ESTOU A FUNCIONAR POR AGORA');
});


//Links and stuuuff
app.get('/', function(req, res){
	res.sendFile('pages/initialP.html', {root : __dirname})
});


app.get('/questoesbonitas', function(req, res){
	res.sendFile(__dirname + '/pages/questions.html')
});

app.get('/inicio', function(req, res){
	res.sendFile(__dirname + '/pages/addform.html')
});

app.get('/inicio/grupos', function(req, res){
	res.sendFile(__dirname + '/pages/bancas.html')
});

app.get('/gelados', function(req, res){
	res.sendFile(__dirname + '/pages/geladosMain.html')
});

app.get('/gelados/controlo', function(req, res){
	res.sendFile(__dirname + '/pages/geladosManage.html')
});

app.get('/obossequemanda', function(req, res){
	res.sendFile('pages/admin.html', {root : __dirname})
});

io.sockets.on('connection', function (socket) {
});
io.on('connection',function(socket){
	
	socket.on('points',function(value){
		
		increment("5",value);
		var index = arrayturmas.findIndex(arrayturmas => arrayturmas === turma);
		arraypoints[index] += 1;
		
	})
	socket.on('addClass',function(data,target){
		add(data.value,target);
	});
	socket.on("checkClass",function(data,target){
		con.query("SELECT * FROM main WHERE turma = '"+data.turma+"'",function(err,result){
			if (err) throw err;
				if (result.rows[0]) {
					socket.emit("startCourse",{turma:data.turma},target)
				}else{
					socket.emit('err',{err:"Turma não existe na base de dados, se houver algum erro fale com os cromos"});
				}
		})
	})
	socket.on("getScoreboard",function(){
		con.query("SELECT * FROM main ORDER BY pontos DESC",function(err,result){
			if (err) throw err;
		var index = []
		if (result) {
			for (var k = 0; k < 5; k++) {
				if (result.rows[k] != null) {
					index[k] = result.rows[k].turma + " &rarr; " + result.rows[k].pontos + " pontos";
				} else {
					index[k] = ""
				}	
			}
			
			socket.emit("recieveScoreBoard",{pos_1:index[0], pos_2:index[1], pos_3:index[2], pos_4:index[3], pos_5:index[4]});	
		} else {
			socket.emit("recieveScoreBoard",{pos_1:"", pos_2:"", pos_3:"", pos_4:"", pos_5:""});
		}
		})
	});
	socket.on("getIceCreams",function(){
		con.query("SELECT gelados FROM gelados WHERE type = '0';",function(err,result){
			if (err) throw err;
			if (result.rows[0]){
				socket.emit("recieveIceCreams",{iceCreams:result.rows[0].gelados});
				
			}else{
				socket.emit("recieveIceCreams",{});
		
			}
			
		})
	})
	socket.on("getIceCreamsMoney",function(){
		con.query("SELECT money FROM gelados WHERE type = '0';",function(err,result){
			if (err) throw err;
			if (result != null){
			
				socket.emit("recieveIceCreamsMoney",{iceCreams:result.rows[0].money});
				
			}else{
				socket.emit("recieveIceCreamsMoney",{});
			
			}
			
		})
	})
	socket.on("setIceCreamsMoney",function(data){
		new_iceCream(data.money,data.type);
	})
	socket.on("getAdminInfo",function(data){
		var gelados2 = ""
		var money2 = ""
		var turmas = ""
		con.query("SELECT gelados FROM gelados WHERE type = '0';",function(err,result){
			if (err) throw err;
			if (result.rows[0]){
				
					gelados2 = String(result.rows[0].gelados)

			}else{
				gelados2 = "0"
		
			}
			
		})
		con.query("SELECT money FROM gelados WHERE type = '0';",function(err,result){
			if (err) throw err;
			if (result != null){
				money2 = String(result.rows[0].money)
				
				
			}else{
				money2 = "0"
			
			}
			
		})
		con.query("SELECT * FROM main ORDER BY pontos DESC;",function(err,result){
			if (err) throw err;
			if (result.rows) {
				turmas = String(result.rows.length);
			}else{
				turmas = 0;
			}
		});
		setTimeout(function(){
			socket.emit("recieveAdminInfo",{iceCreams:gelados2,money:money2,semear:turmas});
		},1000);
		
	})
	socket.on("relative",function(data){
		con.query(data.query,function(err,result){
			if (err) throw err;
			if (result.rows != null) {
				var query = JSON.stringify(result.rows);
				console.log(JSON.stringify(result.rows))
				socket.emit("getRelative",{query:query})
			}else{
				socket.emit("getRelative",{query:"ola"})
			}
		})
	})

	socket.on('Get Points', function(turma){
		con.query("SELECT pontos FROM main WHERE turma = '"+turma+"';", function(error, result){
			if (error) throw error;
			if (result.rows[0]) {
				socket.emit('Recieve Points', {points: result.rows[0].pontos,turma:turma});
			}else{
				socket.emit('Recieve Points', {points: 0});
			}
			
		});
	});
	socket.on('log',function(data){
		console.log(data.log);
	});

})

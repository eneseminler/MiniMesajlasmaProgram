var express  = require("express");
var app = express();
var sunucu = app.listen("5000");
var io = require("socket.io").listen(sunucu);
var yol = require("path");
var mysql = require("mysql");
var baglanti = mysql.createConnection({
	host:'localhost',
	user:'emrecanful' ,
	password: '1321912199haha',
	database: 'chatapp'
});



baglanti.connect();
io.sockets.on("connection", function (socket){

socket.on("gonder", function(veri)
{
	//kayıt ol ve giriş yap diye button olacak
	//kayıt sayfası yapılacak
	//giriş yaptığında veri buraya gelecek 
	console.log(veri + "sisteme giriş yaptı.");
	io.sockets.emit("al",veri);
})


socket.on("mesaj", function(veri)
{
	
	console.log(veri);
		var mesaj = {mesaj:veri.mesaj,kullanici:veri.kullanici};
	var query = baglanti.query('insert into nodejs set ?',mesaj, function(hata,cevap){
		console.log(query.sql);
		console.log(mesaj);
	});
	io.sockets.emit("mesajAl",veri);
})



});



app.get("/", function(talep,cevap)
	{
		cevap.sendFile(yol.join(__dirname + "/newIndex.html"));
	});

console.log("Sunucu Aktif");
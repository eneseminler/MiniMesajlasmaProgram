var express  = require("express");
var app = express();
var sunucu = app.listen("5000");
var io = require("socket.io").listen(sunucu);
var yol = require("path");
var mysql = require("mysql");
var baglanti = mysql.createConnection({
	host:'localhost',
	user:'root' ,
	password: '12345678',
	database: 'nodejs'
});



baglanti.connect();

var KullaniciSayi = 0;
var Dizi;

var id = "";
io.sockets.on("connection", function (socket){

socket.on("gonder", function(veri)
{
	//kayıt ol ve giriş yap diye button olacak
	//kayıt sayfası yapılacak
	//giriş yaptığında veri buraya gelecek 
	console.log(veri + "sisteme giriş yaptı.");
	io.sockets.emit("al",veri);
	console.log(socket.id);

	var kisi = {kisi_id:socket.id, kisi_isim: veri};
	var query = baglanti.query('insert into Kisi set ?',kisi, function(hata,cevap){
		console.log(query.sql);
		console.log(kisi);
	});
	++KullaniciSayi;
	console.log(KullaniciSayi + "kisi serverda");
	io.sockets.emit("alsayi",KullaniciSayi);
})

socket.on('disconnect', function () {
    console.log('user disconnected');
    --KullaniciSayi;
   	console.log(socket.id);

	io.sockets.emit("alsayi",KullaniciSayi);

	var kisi_id = socket.id;
	var sorgula = baglanti.query('select kisi_isim from Kisi where kisi_id=?',kisi_id, function(hata,cevap){
		Dizi = cevap[0].kisi_isim;
		io.sockets.emit("cikti", Dizi);
	});
    });

socket.on('cikis',function(username){

	console.log(socket.username + " server "+ socket.id);
	io.sockets.emit('cikti',socket.username);
});

socket.on("mesaj", function(veri)
{
	console.log(veri);
	var kisi_adi = veri.kullanici;
	var sorgula = baglanti.query('select kisi_id from Kisi where kisi_isim=?',kisi_adi, function(hata,cevap){
		console.log(sorgula.sql);
		console.log(kisi_adi + "id sorgusu");
		console.log(cevap);
	id = cevap[0].kisi_id;
	console.log(id);

	var mesaj = {kisi_id:id,mesaj_tarih:veri.mesaj ,mesaj:veri.mesaj}; 
	var query = baglanti.query('insert into Mesaj set ?',mesaj, function(hata,cevap){
		console.log(query.sql);
		console.log(" sorgu mesaj yazdırma");
	});
	io.sockets.emit("mesajAl",veri);
	});
	
})



});



app.get("/", function(talep,cevap)
	{
		cevap.sendFile(yol.join(__dirname + "/newIndex.html"));
	});

console.log("Sunucu Aktif");
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

var kullanici_sayi=0;
var kullanicilar = ["Saab", "Volvo", "BMW"];
var kullanicilar2 = ["Saab"];
io.sockets.on("connection", function (socket){

socket.on("gonder", function(veri)
{

	//Giriş yapınca isim buraya geliyor.
	//İsim var mı diye sorgu yap?
	var isim = veri;
	var sorgu = baglanti.query('select isim from kisi where isim=?',isim, function(hata,cevap){
	if (cevap != '') {
		//var q = ("UPDATE `kisi` SET `socketid` = ") + ("`") + socket.id+ ("`") + (" WHERE `kisi`.`isim` = ?");
		var q = ('update kisi set socketid = \'') + socket.id + ('\' where isim=? ');
		var query = baglanti.query(q,isim, function(hata2,cevap2){
		console.log("Kişi socket id'si değiştirildi.");
	});
	}
	else{
		var kisi = {socketid:socket.id, isim: isim};
		var query = baglanti.query('insert into kisi set ?',kisi,function(hata3,cevap3){
		console.log(" Kişi veritabanına eklendi");
		
		});
	}
	});


	console.log(veri + "   sisteme giriş yaptı.");
	kullanicilar[kullanici_sayi] = veri;
	++kullanici_sayi;
	var a = {sayi:kullanici_sayi, isim:veri, liste:kullanicilar};
	io.sockets.emit("Giris",a);
})





socket.on("MesajGonder", function(veri)
{
	
	var mesaj = {mesaj_kisi:veri.kullanici,mesaj_icerik:veri.mesaj,mesaj_tarih:"30.04.19"};
	var query = baglanti.query('insert into genel set ?',mesaj, function(hata,cevap){
		console.log(query.sql);
		console.log(mesaj);
	});
	io.sockets.emit("MesajAl",veri);
})

socket.on("Yaz", function(veri)
{
	io.sockets.emit("Yaziyor",veri);
})

socket.on('disconnect', () => {

   	var usr;
   	//console.log(socket.id);
    var sorgula = baglanti.query('select isim from kisi where socketid=?',socket.id, function(hata,cevap){
    //console.log(sorgula.sql);
    //console.log(cevap);

	usr = cevap[0].isim;
	console.log("id den isim sorgusu");
	console.log(usr);
	var a = kullanicilar.indexOf(usr);
	kullanicilar[a] = "0";
	var test = kullanici_sayi;
	for (i = 0,y=0; i < test; i++) {
		
		if (kullanicilar[i] != "0") {
			kullanicilar2[y] = kullanicilar[i];
		
			y++;
		}
	}
	kullanicilar = kullanicilar2;
	
    console.log(usr);
	--kullanici_sayi;
	var b = {sayi:kullanici_sayi, isim:usr, liste:kullanicilar};
    io.sockets.emit("Cikis",b);
})
    
})



});



app.use(express.static(yol.join(__dirname, 'public')));

console.log("Sunucu Aktif");
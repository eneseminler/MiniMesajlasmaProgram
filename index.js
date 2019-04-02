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
let sockets= {};
let socketsoda = {};

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
		//console.log("Kişi socket id'si değiştirildi.");
	});
	}
	else{
		var kisi = {socketid:socket.id, isim: isim};
		var query = baglanti.query('insert into kisi set ?',kisi,function(hata3,cevap3){
		//console.log(" Kişi veritabanına eklendi");
		
		});
	}
	});

	sockets[isim] = socket.id;

	//console.log(veri + "   sisteme giriş yaptı.");
	kullanicilar[kullanici_sayi] = veri;
	++kullanici_sayi;
	var a = {sayi:kullanici_sayi, isim:veri, liste:kullanicilar};
	io.sockets.emit("Giris",a);

});


socket.on("MesajGonder", function(veri)
{

	var oda = veri.oda;
	var d = Tarih();
	veri.mesaj_tarih = d;
	if (oda == "genel" || oda == "kirmizi" || oda == "yesil" || oda == "mavi") {

	var q = 'insert into ' + oda + ' set ?';
	
	var mesaj = {mesaj_kisi:veri.kullanici,mesaj_icerik:veri.mesaj,mesaj_tarih:veri.mesaj_tarih};
	var query = baglanti.query(q ,mesaj, function(hata,cevap){
		
	});
	socket.broadcast.to(oda).emit('MesajAl', veri);	
	}
	else{
	

	console.log(veri.kullanici);
	console.log("mesaj gonderiyor");
	console.log(oda);
	var q = 'insert into ozel set ?';

	var mesaj = {oda:oda,mesaj_gonderen:veri.kullanici,mesaj_alici:oda,mesaj_icerik:veri.mesaj,mesaj_tarih:veri.mesaj_tarih};
	
	var query = baglanti.query(q ,mesaj, function(hata,cevap){
		
	});
	io.sockets.emit("YeniMesaj",veri);
	socket.broadcast.to(oda).emit('MesajAl', veri);	
	}
	
	
	//io.to(sockets[veri.mesaj]).emit(("MesajAl",veri));


});

socket.on("Yaz", function(veri)
{
	socket.broadcast.to(veri.oda).emit('Yaziyor', veri);
});

socket.on('disconnect', () => {

   	var usr;
   	//console.log(socket.id);
    var sorgula = baglanti.query('select isim from kisi where socketid=?',socket.id, function(hata,cevap){
    //console.log(sorgula.sql);
    //console.log(cevap);

	usr = cevap[0].isim;
	delete sockets[usr]; 
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
	
	--kullanici_sayi;
	var b = {sayi:kullanici_sayi, isim:usr, liste:kullanicilar};
    io.sockets.emit("Cikis",b);
})
    
});


socket.on("OdaKapa",function(veri){

socket.broadcast.to(veri.oda).emit("OdaCikis", veri.kullanici);

});

socket.on("OdaAc",function(veri){

//console.log(veri);

socket.join(veri.oda);
var oda = veri.oda;

socket.broadcast.to(veri.oda).emit("OdaGiris", veri.kullanici);

var a = "select * from " +veri.oda;
//console.log(a);
var sorgula = baglanti.query(a, function(hata,cevap){
	  
	 //console.log(cevap);
	// console.log(sorgula.sql);
	io.to(socket.id).emit("GecmisMesaj", cevap);

});



});




socket.on("OdaAcKisi",function(veri){

//console.log(veri);

var gercekoda = ((veri.oda.length)*(veri.kullanici.length)*33)+(veri.oda.length+veri.kullanici.length);
console.log("gercekoda altta");
console.log(gercekoda);
socket.join(gercekoda);

io.to(gercekoda).emit("OdaGiris", veri.kullanici);
var a = "select * from ozel where oda=?";
//console.log(a);
	var sorgula = baglanti.query(a,gercekoda, function(hata,cevap){
	  
	 console.log(cevap);
	console.log(sorgula.sql);
	io.to(socket.id).emit("GecmisMesajOzel", cevap);

});
});


    function Tarih(){
        var d = new Date();
        var a=  d.getDate() + "." +  d.getMonth()+ "." + d.getFullYear()  + "-" + d.getHours() + ":" + d.getMinutes(); 

        return a;
    }

//connect sonu silme

});

app.use(express.static(yol.join(__dirname, 'public')));

console.log("Sunucu Aktif ve 5000 Portu dinleniyor.");
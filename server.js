const mongo = require('mongodb').MongoClient;
const express = require('express');
const valid = require('valid-url');
var app = express();
const mongoUrl = 'mongodb://dbmaster:dbmaster1620@ds113179.mlab.com:13179/urlshort';
const appUrl = 'https://still-caverns-95817.herokuapp.com/';

app.get('/', (req,res)=>{
	res.json({err: 'Please use: https://still-caverns-95817.herokuapp.com/new/<YourURLgoeshere>'})
})
app.get('/new/:newUrl(*)', (req,res)=>{
	var newUrl = req.params.newUrl;
	if(valid.isUri(newUrl)){
		mongo.connect(mongoUrl, (err,client)=>{
		if(err) throw err;

		var coll = client.db('urlshort').collection('url');
		coll.count().then((number)=>{
			var newObj = {
				shortUrl : appUrl + (number + 1),
				orgUrl : newUrl
			}
			coll.insert(newObj);
			res.json({
				shortUrl : appUrl + (number + 1),
				orgUrl : newUrl
			});
			client.close();
		})
	})
	}
	else{
		res.json({error:'Please insert a valid URL. E.g : https://www.google.com'});
	}
});

app.get('/:short', (req,res)=>{
	var shortID = req.params.short;
	mongo.connect(mongoUrl, (err,client)=>{
		if(err) throw err;

		var coll = client.db('urlshort').collection('url');
		coll.findOne({shortUrl : appUrl + shortID},{orgUrl: 1, _id: 0}, function(err,data){
			if(err) throw err;

			res.redirect(301, data.orgUrl);
		})

	})
})

app.listen(process.env.PORT || 1337);
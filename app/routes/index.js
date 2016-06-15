'use strict';
var mongo = require('mongodb');
var url = process.env.MONGOLAB_URI;
var path = process.cwd();

module.exports = function (app) {

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	//for short urls
	app.route('/g/*')
		.get(function (req, res) {
			var input = req.path;
			input = parseInt(input.slice(3, input.length));
			
				mongo.connect(url, function(err, db) {
			if(err) throw err;
			var collection = db.collection('urls');
  
		collection.find({'id': input}).toArray(function(err, documents) {
	      if(err) throw err;
	      if(documents[0] == null) res.send("No such url stored");
	      else
		 	res.redirect(documents[0]["url"]);
		 db.close();
		 })
		}); 
		//	res.send("No such short url");
		});
		
	//for url entries
	app.route('/*')
		.get(function (req, res) {
			var input = req.path;
			input = input.slice(1, input.length);
			
			//check if input is valid
			if(input.match(/http:\/\/(\w.)?\w+.[a-zA-Z]+/)){
			
			//get id
			mongo.connect(url, function(err, db) {
			if(err) throw err;
			var collection = db.collection('urls');
  
		collection.count({}, function(err, data){
				var id =data;
				collection.insert({
    			id : id, url: input
			}, function(err, data) {
			// handle error
			if(err) throw err;
			db.close();
				res.send("{\"url\" : \"" +req.originalUrl.slice(1, req.originalUrl.length) + "\", \"short url\" : \"https://shortener-microservice-cestzen.c9users.io/g/" + id +"\"}");
			});

			});
		}); 
			}else	
				res.send(input + " is not a valid url");
		});

};

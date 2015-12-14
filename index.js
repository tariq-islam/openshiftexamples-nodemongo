// setup database connection
var MongoClient = require('mongodb').MongoClient;
var user = process.env.MONGODB_USER || 'dummy';
var pass = process.env.MONGODB_PASSWORD || 'dummy';
var dbip = process.env.MONGODB_SERVICE_HOST || '127.0.0.1';
var dbport = process.env.MONGODB_SERVICE_PORT || 27017;
var dbcoll = process.env.MONGODB_DATABASE || 'sampledb';
var db = null;
var url = 'mongodb://'+user+':'+pass+'@'+dbip+'/'+dbport+'/'+dbcoll;
// uncomment to use without authentication
//var url = 'mongodb://'+dbip+'/'+dbport+'/'+dbcoll

var mongoCreatedCollections = false;
var initMongo = function(errcallback) {
   console.log('attempting mongoDB connection to ' + url);
   MongoClient.connect(url, function(err, mydb) {
      if (err) {
         console.log('unable to connect to mongo database -' + err);
         errcallback(err);
         return;
      } else {
         db = mydb;
         console.log('connected to mongo database, creating some dummy data...');
         // stuff in dummy data
         db.createCollection('test1', {strict:false}, function(err, collection) {
            collection.insert({name:"name1",type:1}, function(err, records) { if (err) throw err;});
         });
         db.createCollection('test2', {strict:false}, function(err, collection) {
            collection.insert({name:"name",type:2}, function(err, records) { if (err) throw err;});
         });
         mongoCreatedCollections = true;
      }
   });
}

// setup webserver
var express = require('express');
var app = express();
app.get('/', function(req, res) {
   console.log('GET request');
   res.send('Hello MongoDB.\n <a href=\'/test1\'>test1</a> \n <a href=\'/test2\'>test2</a> \n <a href=\'/test3\'>test3</a>');
});
app.get('/test1', function(req, res) {
   if (!mongoCreatedCollections) { res.send('test1 - no DB connection'); return; }
   db.collection('test1').find().toArray(function(err, items){
      console.log(items);
      res.send('items in test 1: ' + items.length);
   });
});
app.get('/test2', function(req, res) {
   if (!mongoCreatedCollections) { res.send('test2 - no DB connection'); return; }
   db.collection('test2').find().toArray(function(err, items){
      console.log(items);
      res.send('items in test 2: ' + items.length);
   });
});
app.get('/test3', function(req, res) {
   if (!mongoCreatedCollections) { res.send('test3 - no DB connection'); return; }
   db.collection('test3').find().toArray(function(err, items){
      console.log(items);
      res.send('items in test 3: ' + items.length);
   });
});

// setup MongoDB
initMongo(function(err){ console.log('Couldnt connent to mongoDB: ' +err); });

// start listening for client connections
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
app.listen(server_port, server_ip_address, function() {
   console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});

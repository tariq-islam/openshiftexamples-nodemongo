// setup database connection
var MongoClient = require('mongodb').MongoClient;
var user = process.env.MONGODB_USER || 'dummy';
var pass = process.env.MONGODB_PASSWORD || 'dummy';
var dbip = process.env.MONGODB_SERVICE_HOST || '127.0.0.1';
var dbport = process.env.MONGODB_SERVICE_PORT || 27017;
var db = null;
var url = 'mongodb://'+user+':'+pass+'@'+dbip+'/'+dbport+'/sampledb'
// uncomment to use without authentication
//var url = 'mongodb://'+dbip+'/'+dbport+'/sampledb'

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
      }
   });
}

// setup webserver
var express = require('express');
var app = express();
app.get('/', function(req, res) {
   res.send('Hello MongoDB');
});
app.get('/test1', function(req, res) {
   db.collection('test1').find().toArray(function(err, items){
      console.log(items);
      res.send('items in test 1: ' + items.length);
   });
});
app.get('/test2', function(req, res) {
   db.collection('test2').find().toArray(function(err, items){
      console.log(items);
      res.send('items in test 2: ' + items.length);
   });
});
app.get('/test3', function(req, res) {
   db.collection('test3').find().toArray(function(err, items){
      console.log(items);
      res.send('items in test 3: ' + items.length);
   });
});

// setup MongoDB
initMongo(function(err){ console.log('Couldnt connent to mongoDB: ' +err); });

// start listening for client connections
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
app.listen(server_port, server_ip_address, function() {
   console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});

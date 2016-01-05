// setup database connection
var MongoClient = require('mongodb').MongoClient;
var user = process.env.MONGODB_USER || 'dummy';
var pass = process.env.MONGODB_PASSWORD || 'dummy';
var dbip = process.env.MONGODB_SERVICE_HOST || 'db.local';
//var dbip = 'localhost';
var dbport = process.env.MONGODB_SERVICE_PORT || 27017;
var dbcoll = process.env.MONGODB_DATABASE || 'sampledb';
var db = null;
var url = 'mongodb://'+user+':'+pass+'@'+dbip+':'+dbport+'/'+dbcoll;
// uncomment to use without authentication
//var url = 'mongodb://'+dbip+':'+dbport+'/'+dbcoll

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
         console.log('connected to mongo database...');
         mongoCreatedCollections = true;
      }
   });
}

// setup webserver
var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
   console.log('GET request');

   var requestip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

   var os = require('os');
   var interfaces = os.networkInterfaces();
   var addresses = [];
   for (var k in interfaces) {
       for (var k2 in interfaces[k]) {
           var address = interfaces[k][k2];
           if (address.family === 'IPv4' && !address.internal) {
               addresses.push(address.address);
           }
       }
   }

   // Respond with some HTML
   var respHTML = '<html><head><link rel="stylesheet" href="bootstrap.min.css">';
   respHTML += '<title>NodeMongo OpenShift Example</title></head>';
   respHTML += '<body><div class="container-fluid">';
   respHTML += '<div class="jumbotron"><h1>Hello Node + Mongo<h1>';
   respHTML += '<p><span class="label label-info">requesting IP:'+requestip+'</span></p>'
   respHTML += '<p><span class="label label-primary">my IP(s):'+addresses+'</span></p></div>';
   if (!mongoCreatedCollections) { 
     respHTML += '<div class="alert alert-danger" role="alert">ERROR, could not connect to DB</div><br/>';
     respHTML += '</body></html>'; 
     res.send(respHTML); return;
   }

   // store this info
   var stamp = getDateTime();
   console.log('inserting from:' + requestip + ' served by node ' + addresses);
   db.createCollection('history', {strict:false}, function(err, collection) {
      collection.insert({date:stamp,theirIp:requestip,myIp:addresses}, function(err, records) { if (err) throw err;});
   });

   respHTML += '<div class="panel panel-default">';
   respHTML += '<div class="panel-heading">GET Requests History</div>';
   respHTML += '<div class="panel-body"><ul class="list-group">';
   db.collection('history').find().toArray(function(err, items) {
      for (var i = items.length - 1; i >= 0; i--) {
         var itemout = '<li class="list-group-item"> date:' + items[i].date+', them:'+items[i].theirIp+', us:'+items[i].myIp+'</li>';
         //console.log(itemout);
         respHTML += itemout;
      };
      respHTML += '</ul></div>';
      respHTML += '</div><p><span class="label label-default">this page updated on:' + stamp + '</span></p>';
      respHTML += '</div></body></html>'
      res.send(respHTML);
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

//------------------------------------------------
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

// Retrieve
let MongoClient = require('mongodb').MongoClient,
    configs = require('../configs');

let db;
MongoClient.connect(configs.db.connectionString, function (err, db) {
    if (err) {
        return console.dir(err);
    }
    db = db;
    
    db.collection('test', function(err, collection) {});

});
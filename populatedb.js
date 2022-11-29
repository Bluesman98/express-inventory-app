#! /usr/bin/env node

console.log('This script populates some test books, categories, items and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []

function categoryCreate(name, description, cb) {
  categorydetails = {name:name , description: description }

  var category = new Category (categorydetails);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function itemCreate(name, description, category, stock, cb) {
  itemdetails = {name:name , description: description, category:category, stock:stock }
  var item = new Item(itemdetails);
       
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New item: ' + item);
    items.push(item)
    cb(null, item);
  }   );
}

function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('category 1 ', 'details of category 1', callback);
        },
        function(callback) {
          categoryCreate('category 2 ', 'details of category 2', callback);
        },
        function(callback) {
          categoryCreate('category 3 ', 'details of category 3', callback);
        },
        ],
        // optional callback
        cb);
}


function CreateItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('item 1', 'item 1 details',  categories[0], 0, callback);
        },
        function(callback) {
          itemCreate('item 2', 'item 2 details',  categories[1], 1, callback);
        },
        function(callback) {
          itemCreate('item 3', 'item 3 details',  categories[2], 2, callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createCategories,
    CreateItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Items: '+items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



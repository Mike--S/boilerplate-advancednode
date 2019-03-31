'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const mongo = require('mongodb').MongoClient;
const dotenv = require('dotenv');  
const app = express();
const routes = require('./routes.js');
const auth = require('./auth.js');

dotenv.config();

fccTesting(app); //For FCC testing purposes

mongo.connect(process.env.MONGO_URI, (err, db) => {
  if(err) {
      console.log('Database error: ' + err);
  } else {
      console.log('Successful database connection');
      app.set('view engine', 'pug');
      app.use('/public', express.static(process.cwd() + '/public'));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      auth(app, db)
      routes(app, db);
      
      app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on port " + (process.env.PORT || 3000));
      });
}});


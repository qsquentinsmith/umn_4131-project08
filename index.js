// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-256 algorithm
var crypto = require('crypto');

// include the mysql module
var mysql = require("mysql");

// required for reading XML files
var xml2js = require('xml2js');

var parser = new xml2js.Parser();

//setup connection to mysql. global
var con;

//access db configuration from xml file. 
fs.readFile(__dirname + '/dbconfig.xml', function(err, data) {
  if(err) throw err;
  // console.log("data: \n" + data);    
  
  parser.parseString(data, function (err, result) {
    if(err) throw err;
    
    con = mysql.createConnection({
      host: result.dbconfig.host[0],
      user: result.dbconfig.user[0], // replace with the database user provided to you
      password: result.dbconfig.password[0],// replace with the database password provided to you
      database: result.dbconfig.database[0], // replace with the database user provided to you
      port: result.dbconfig.port[0]
    });
  });
});

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in memory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}));

// server listens on port 9787 for incoming connections
app.listen(9787, () => console.log('Listening on port 9787!'));

//GET Method route for welcome page
app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/welcome.html');
});

// // GET method route for the events page.
// It serves events.html present in client folder
app.get('/events',function(req, res) {
  //if no session go to login
  if(!req.session.name){
    res.redirect('/login');
  }
  else{
    res.sendFile(__dirname + '/client/events.html'); 
    
  }
  
});

// GET method route for the addEvent page.
// It serves addEvent.html present in client folder
app.get('/addEvent',function(req, res) {
  //if no session go to login
  if(!req.session.name){
    res.redirect('/login');
  }
  else{
    res.sendFile(__dirname + '/client/addEvent.html');
  }
});

//GET method for stock page
app.get('/stock', function (req, res) {
  //if no session go to login
  if(!req.session.name){
    res.redirect('/login');
  }
  else{
    res.sendFile(__dirname + '/client/stock.html');
  }
});


//Homework 7: GET method for admin page
app.get('/admin', function (req, res) {
  //if no session go to login
  if(!req.session.name){
    res.redirect('/login');
  }
  else{
    res.sendFile(__dirname + '/client/admin.html');
  }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  //if no session go to login
    if(!req.session.name){
      res.sendFile(__dirname + '/client/login.html'); 
    }
    else{
      res.redirect('/events');
    }
    
});

//Homework 7:

//retrieve user login
app.get('/userLogin', function(req,res) {
  var data = {
    login: req.session.name
  }
  res.send(data);
});


// GET method to return the list of accounts
// The function queries the tbl_accunts table for the list of accounts and sends the response back to client
app.get('/getListOfUsers', function(req, res) {
  if(!req.session.name){
    res.sendFile(__dirname + '/client/login.html'); 
  }
  else{
    // Query event table for list of accounts send back
    con.query("SELECT * FROM tbl_accounts", function (err, result) {
      if (err) throw err;
      // var text = JSON.stringify(result);
      res.send(result);
      res.end();
    });
  }
});


//TODO: edit/ changing info on an existing login
app.post('/updateUser', function(req, res) {
  if(!req.session.name){
    res.sendFile(__dirname + '/client/login.html'); 
  }
  else{
    var sql = 'SELECT * FROM tbl_accounts WHERE acc_login = ? and acc_id != ?';
    con.query(sql, [req.body.login, req.body.id] , function (err, result) {
      if(err) throw err;
      
      if (result.length == 0){
        if(req.body.password){
          //update name, login, and password where acc_id = req.body.id
          var lineUpdate = { 
            acc_name: req.body.name,
            acc_login: req.body.login,
            acc_password: crypto.createHash('sha256').update(req.body.password).digest('base64')
          }
          var sqlUpdate = 'UPDATE tbl_accounts SET ? WHERE acc_id = ?';
          con.query(sqlUpdate, [lineUpdate, req.body.id] , function (err, result) {
            if(err) throw err;
          });
        }
        else{
          //update name and login where acc_id=req.body.id
          var lineUpdate = { 
            acc_name: req.body.name,
            acc_login: req.body.login
          }
          var sqlUpdate = 'UPDATE tbl_accounts SET ? WHERE acc_id = ?';
          con.query(sqlUpdate, [lineUpdate, req.body.id] , function (err, result) {
            if(err) throw err;
          });
        }
      res.send({flag:true});
      }
      else {
        res.send({flag:false});
      }
    });
  }
});


// TODO: POST method to insert details of a new user to tbl_accounts table
app.post('/addUser', function(req, res) {
  if(!req.session.name){
    res.sendFile(__dirname + '/client/login.html'); 
  }
  else{
    var login = req.body.login; 
    
      //query the database to check for existing login 
    var sql = 'SELECT COUNT(acc_login) as count FROM tbl_accounts WHERE acc_login = ?';
    con.query(sql,login, function (err, result) {
      if(err) throw err;
      var rowsReturned = JSON.parse(JSON.stringify(result));
      
      if(rowsReturned[0].count != 0){
        //login exists
        res.send({flag:false});
      }
      else {
        //insert into table
        var toBeInserted = {
          acc_name: req.body.name,
          acc_login: req.body.login,
          acc_password: crypto.createHash('sha256').update(req.body.password).digest('base64')
        };

        con.query('INSERT tbl_accounts SET ?', toBeInserted, function(err, result){
          if (err) throw err;
          console.log("Value Inserted");
          console.log(result.insertId);
          res.send({flag:true, id: result.insertId})
        });
      }      
    });
  }
});


//TODO: delete user
app.post('/deleteUser', function(req, res) {
  if(!req.session.name){
    res.sendFile(__dirname + '/client/login.html'); 
  }
  else{
    if(req.session.name !== req.body.login){
      var sql = 'DELETE FROM tbl_accounts WHERE acc_login="'+ req.body.login+'"'; 
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Value Deleted");
      });
      res.send({flag:true});
    }
    else {
      res.send({flag:false});
    }
  }
});





// GET method to return the list of events
// The function queries the tbl_events table for the list of events and sends the response back to client
app.get('/getListOfEvents', function(req, res) {

    // Query event table for list of events send back
    con.query("SELECT * FROM tbl_events", function (err, result) {
      if (err) throw err;
      var text = JSON.stringify(result);
      res.send(text);
      res.end();
  });
});

// POST method to insert details of a new event to tbl_events table
app.post('/postEvent', function(req, res) {

    // insert detail into json
    var toBeInserted = {
      event_day: req.body.day,
      event_event: req.body.event,
      event_start: req.body.start,
      event_end: req.body.end,
      event_location: req.body.location,
      event_phone: req.body.phone,
      event_info: req.body.info,
      event_url: req.body.url
    };

    // insert json into tbl_event
    con.query('INSERT tbl_events SET ?', toBeInserted, function(err, result){
      if (err) throw err;
      console.log("Value Inserted");
  });
  
  res.redirect(302, '/events');
});


// POST method to validate user login
// upon successful login, user session is created
app.post('/sendLoginDetails', function(req, res) {
  // get user and password from login page
  var loginInfo = req.body;
  var login = loginInfo.login;
  var pwd = crypto.createHash('sha256').update(loginInfo.password).digest('base64');
  var row_num = 0;
  
  //query the database with login and hashed password
  var sql = 'SELECT * FROM tbl_accounts;';
  con.query(sql, function (err, result) {
    if(err) throw err;
    var row = JSON.parse(JSON.stringify(result));
    for(var i=0; i<row.length; i++){
      if(row[i].acc_login === login){
        row_num = i;
      }
    }
    
    // Compare hashed password with password in row returned
    if(row[row_num].acc_password === pwd && row[row_num].acc_login === login){
      req.session.name = login;
      res.send('success');
    }
    else {
      res.send('fail');
    }
  });
});

// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
  if(!req.session.name) {
    res.send('Session not started, can not logout!');
  } 
  else {
    console.log('successfully destroyed session');
    req.session.destroy();
    res.redirect('/login');
  }
});

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  res.sendStatus(404);
});

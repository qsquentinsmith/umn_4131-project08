/*
TO DO:
-----
READ ALL COMMENTS AND REPLACE VALUES ACCORDINGLY
*/

var mysql = require("mysql");

var con = mysql.createConnection({
  // host: "cse-larry.cse.umn.edu",
  // user: "C4131F20U92", // replace with the database user provided to you
  // password: "8494", // replace with the database password provided to you
  // database: "C4131F20U92", // replace with the database user provided to you
  // port: 3306
  host: "us-cdbr-east-02.cleardb.com",
  user: "bdfd033b5b74d7",
  password: "d41ba063",
  database: "heroku_83bc8b774283c2e",
  port: 3306
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected!");
  var sql = `CREATE TABLE tbl_accounts(acc_id INT NOT NULL AUTO_INCREMENT,
                                       acc_name VARCHAR(20),
                                       acc_login VARCHAR(20),
                                       acc_password VARCHAR(50), PRIMARY KEY (acc_id))`;
  con.query(sql, function(err, result) {
    if(err) {
      throw err;
    }
    console.log("Table created");
  });
});

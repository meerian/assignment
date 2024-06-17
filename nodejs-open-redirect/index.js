const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'nodelogin'
  });

// Inititalize the app and add middleware
app.set('view engine', 'pug'); // Setup the pug
app.use(bodyParser.urlencoded({extended: true})); // Setup the body parser to handle form submits
app.use(session({secret: 'super-secret'})); // Session setup

/** Handle login display and form submit */
app.get('/login', (req, res) => {
  if (req.session.isLoggedIn === true) {
    return res.redirect('/');
  }
  res.render('login', {error: false});
});

app.post('/detail', (req, res) => {
  const {email} = req.body;
  if (email) {
    connection.query('UPDATE accounts SET email= ? WHERE username = ?', [email, req.session.username], function(error, results, fields) {
      res.redirect('/detail');
      res.end();
    });
  }
});

app.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (username && password) {
    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
      if (results.length > 0) {
        req.session.isLoggedIn = true;
        req.session.username = username;
        res.send('Your account balance is $1234.52');
      } else {
        res.redirect('/login?redirect_url=/balance');
      }
      res.end();
    });
  }
});

/** Handle logout function */
app.get('/logout', (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect('/');
});

/** Simulated bank functionality */
app.get('/', (req, res) => {
  res.render('index', {isLoggedIn: req.session.isLoggedIn});
});

app.get('/balance', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send('Your account balance is $1234.52');
  } else {
    res.redirect('/login?redirect_url=/balance');
  }
});

app.get('/account', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send('Your account number is ACL9D42294');
  } else {
    res.redirect('/login?redirect_url=/account');
  }
});

app.get('/detail', (req, res) => {
  if (req.session.isLoggedIn === true) {
    connection.query('SELECT email, username FROM accounts WHERE username = ?', [req.session.username], function(error, results, fields) {
      if (results.length > 0) {
        const emailData = { 
          email: results[0].email, 
          username: results[0].username,
      }; 
      res.render('detail', {
          error: false,
          data: emailData,
        });
      }
    });

  } else {
    res.redirect('/login?redirect_url=/detail');
  }
});

/** App listening on port */
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`);
});
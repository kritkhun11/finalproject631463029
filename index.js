
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public', { 'content-type': 'text/css' }));

// app.use(express.static(__dirname + '/public'));


app.set('view engine', 'ejs');

//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'finalproject029'
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected as ID ' + connection.threadId);
});


app.get('/', function(request, response) {
    response.render('login');
});


app.post('/auth', function(request, response) {
    const username = request.body.username;
    const password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                response.locals.error = 'Incorrect username and/or password.';
                response.render('login');
            }
        });
    } else {
        response.locals.error = 'Please enter username and password.';
        response.render('login');
    }
});
app.get('/adminlogin', function(request, response) {
    response.render('adminlogin');
});

app.post('/adminlogin', function(request, response) {
    const username = request.body.username;
    const password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/admin');
            } else {
                response.locals.error = 'Incorrect username and/or password.';
                response.render('adminlogin');
            }
        });
    } else {
        response.locals.error = 'Please enter username and password.';
        response.render('adminlogin');
    }
});
app.get('/admin', function(request, response) {
   
    connection.query('SELECT * FROM users', function(error, results, fields) {
        if (error) {
            response.locals.error = 'An error occurred while fetching user data.';
            response.render('admin');
            return;
        }

        // Render the admin view with the user data
        response.render('admin', {users: results});
    });
});

app.get('/admin/edit/:id', function(request, response) {
    const id = request.params.id;
    connection.query('SELECT * FROM users WHERE id = ?', [id], function(error, results, fields) {
        if (error) {
            response.locals.error = 'An error occurred while retrieving user data.';
            response.render('admin');
        } else {
            const item = results[0];
            response.render('edit', { item: item, message: '' });
        }
    });
});

app.post('/admin/edit/:id', function(request, response) {
    const id = request.params.id;
    // const { username, password,email,tel,img } = request.body;
    const username = request.body.username;
    const password = request.body.password;
    const email = request.body.email;
    const tel = request.body.tel;
    const img = request.body.img;
    connection.query('UPDATE users SET username = ?, password = ? , email = ? , tel = ? , img = ? WHERE id = ?', [username, password,email,tel,img ,id], function(error, results, fields) {
        if (error) {
            response.locals.error = 'An error occurred while updating user data.';
            response.render('admin');
        } else {
            response.redirect('/admin');
        }
    });
});

app.post('/admin/delete/:id', function(request, response) {
    const id = request.params.id;
  
    connection.query('DELETE FROM users WHERE id = ?', id, function(error, results, fields) {
      if (error) {
        response.locals.error = 'An error occurred while deleting the user.';
        response.render('admin');
      } else {
        response.redirect('/admin');
      }
    });
  });
  
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
        
    } else {
        response.send('Please login to view this page.');
    }
});

app.get('/register', function(request, response) {
    response.render('register');
});

app.post('/register', function(request, response) {
    const username = request.body.username;
    const password = request.body.password;
    const email = request.body.email;
    const tel = request.body.tel;
    const img = request.body.img;
    if (username && password) {
        connection.query('INSERT INTO users (username, password,email,tel,img) VALUES (?,?,?,?,?)', [username, password,email,tel,img], function(error, results, fields) {
            if (error) {
                response.locals.error = 'An error occurred while registering.';
                response.render('register');
            } else {
                response.locals.message = 'Registration successful!';
                response.render('login');
            }
        });
    } else {
        response.locals.error = 'Please enter username and password.';
        response.render('register');
    }
});
app.listen(3000, function() {
    console.log('Server listening on port 3000.');
});

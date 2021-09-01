const { users, schedules } = require('./data');
const express = require('express');
const crypto = require('crypto');
const path =require('path');
const app = express();
const PORT = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.listen(PORT, () => {
    if(process.env.PORT) {
        console.log('App is listening on port: ' + process.env.PORT);
    }
    else {
        console.log('App is listening on port: ' + 3000);
    }    
});

// Display the Welcome message
app.get('/', (req, res) => {
    res.render('index');
});

//Display all the users
app.get('/users', (req, res) => {
    res.render('users', {users: users});
});

//Add a new user
app.get('/users/new', (req, res) => {
    res.render('new-user');
});

//View a specific user
app.get('/users/:id', (req, res, next) => {

    if(req.params.id < users.length) {
        res.render('user', {user: users[req.params.id], user_id: req.params.id});
    }
    else {
        res.send('User not found');
    }
});

// View a specific user's schedule
app.get('/users/:id/schedules', (req, res) => {
    let obj = [];
    for( let i = 0; i < schedules.length; i++) {        
        if(req.params.id == schedules[i].user_id) {
            obj.push(schedules[i]);
        }
    }

    if(obj.length > 0) {
        res.render('schedules', {schedules: obj});
    }
    else {
        res.send('No schedule found');
    }
    
});

// View all schedules
app.get('/schedules', (req, res) => {
    res.render('schedules', {schedules: schedules});
});

// Add a new schedule
app.get('/schedules/new', (req, res) => {
    res.render('new-schedule', {users: users});
});

// Process the user data from the form
app.post('/users', (req, res) => {
    const secret = 'secret key';
    let obj= { };

    obj.firstname = req.body.firstname;
    obj.lastname = req.body.lastname;
    obj.email = req.body.email;
    obj.password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');
    
    users.push(obj);
    res.redirect('/users');
});

// Process the schedule data from the form
app.post('/schedules', (req, res) => {
    let obj= { };

    obj.user_id = parseInt(req.body.user_id);
    obj.day = parseInt(req.body.day);
    obj.start_at = req.body.start_at;
    obj.end_at = req.body.end_at;

    schedules.push(obj);
    res.redirect('/schedules');
});

//Default 404 Error - Page not found
app.use((req, res) => {
    res.status(404).send('404 Error - Page not found');
});
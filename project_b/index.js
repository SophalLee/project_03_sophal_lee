const { users, schedules } = require('./data');
const express = require('express');
const crypto = require('crypto');
const path =require('path');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.listen(3000);
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users', (req, res) => {
    res.render('users', {users: users});
});

app.get('/users/new', (req, res) => {
    res.render('new-user');
});

app.get('/users/:id', (req, res, next) => {

    if(req.params.id < users.length) {
        res.render('user', {user: users[req.params.id]});
    }
    else {
        res.send('User not found');
    }
});

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

app.get('/schedules', (req, res) => {
    res.render('schedules', {schedules: schedules});
});

app.get('/schedules/new', (req, res) => {
    res.render('new-schedule', {users: users});
});

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

app.post('/schedules', (req, res) => {
    let obj= { };

    obj.user_id = parseInt(req.body.user_id);
    obj.day = parseInt(req.body.day);
    obj.start_at = req.body.start_at;
    obj.end_at = req.body.end_at;

    schedules.push(obj);
    res.redirect('/schedules');
});

app.use((req, res) => {
    res.status(404).send('404 Error - Page not found');
});
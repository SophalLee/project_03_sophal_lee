const express = require('express');
const crypto = require('crypto');
const path =require('path');
const app = express();
const { create } = require('domain');
const { Pool } = require('pg');
const pgp = require('pg-promise')();
require('dotenv').config();

const publicDirectory = path.join(__dirname, './public');
const PORT = process.env.PORT || 3000
const validTime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(publicDirectory));


//Function to check the time entered is valid
function validateInput(regex, input) {
    return regex.test(input);
}

const connection = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
}

const db = pgp(connection);

// Display schedule on home page
app.get('/', (req, res) => { 

    db.any(`SELECT username, day, to_char(start_at, 'HH:MI AM') AS start_at, to_char(end_at, 'HH:MI AM') AS end_at FROM schedules`)
        .then(schedules => {
            res.render('index', {schedules});
        })
        .catch(err => {
            throw err;
        })
});

// //Form for adding a new schedule
app.get('/new', (req, res) => {
    res.render('new-schedule');
});

//After posting the form, add the values into the schedules table
app.post('/new', (req, res) => {
    const { username, day, start_at, end_at } = req.body;

    if(validateInput(validTime, req.body.start_at) && validateInput(validTime, req.body.end_at)) {
        db.none('INSERT INTO schedules (username, day, start_at, end_at) VALUES($1, $2, $3, $4)', [ username, day, start_at, end_at])
            .then(() => {
                res.redirect('/');
            })
            .catch(err => {
                throw err;
            })        
    }
    else {
        res.send("Incorrect time format. Format is HH:MM<br><br><a href='/new'>Add a schedule</a>");
    }
});

app.listen(PORT, () => {
    if(process.env.PORT) {
        console.log('App is listening on port: ' + process.env.PORT);
    }
    else {
        console.log('App is listening on port: ' + 3000);
    }
    
});

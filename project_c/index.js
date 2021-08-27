const express = require('express');
const crypto = require('crypto');
const path =require('path');
const app = express();
const { create } = require('domain');
const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.listen(PORT, () => {
    if(process.env.PORT) {
        console.log('App is listening on port: ' + process.env.PORT);
    }
    else {
        console.log('App is listening on port: ' + 3000);
    }
    
});

//Function to check the time entered is valid
function checkValidTime(time) {
    var regEx = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    return regEx.test(time);
}

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
})

// Display schedule on home page
app.get('/', (req, res) => {
    const displaySchedule = `SELECT * FROM schedule`;

    pool.query(displaySchedule, (err, results) => {
        if(err) { 
            throw err; 
        }
        else {
            res.render('index', {schedules: results.rows});
        }
    })
});

// //Form for adding a new schedule
app.get('/new', (req, res) => {
    res.render('new-schedule');
});

//After posting the form, add the values into the schedule table
app.post('/new', (req, res) => {
    const { username, day, start_at, end_at } = req.body;
    const addSchedule = `INSERT INTO schedule (username, day, start_at, end_at) 
                        VALUES('${username}', ${day}, '${start_at}', '${end_at}')`

    if(checkValidTime(req.body.start_at) && checkValidTime(req.body.end_at)) {
        pool.query(addSchedule, (err) => {
            if(err) throw err;
        })
        res.redirect('/new');
    }
    else {
        res.send("Incorrect time format. Format is HH:MM<br><br><a href='/new'>Add a schedule</a>");
    }
});






//***** IMPORTS  *******/

const express = require('express');
const bp = require('body-parser');
const mysql = require('mysql');
const cors = require("cors");
const bcrypt = require('bcrypt');
const credentials = require('./mysqlconnection');

//***** CONFIG ********/

const app = express();

app.use(bp.json());
app.use(cors());

const saltRounds = 10;

const con = mysql.createConnection({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    port: credentials.port,
    database: credentials.database
});

//***** ROUTES ********/

app.get('/', (req, res) => {
    res.json("Hello the api is working!");
});

app.post('/login', (req,res) => {
    const values = req.body
    console.log(values);
    con.query(`SELECT * FROM users where(emailAddress = '${values.email}')`, (err, user) => {
        
        if(err) console.log(err);
        
        if(user) {
            bcrypt.compare(values.password, user.password, (err, result) => {
                if(err) console.log(`***************password didnt match: ${err}`)
            })
        };
    })
})

app.post('/newUser', (req,res) => {

    const sub = req.body;
    console.log(sub);

    bcrypt.hash(sub.password, saltRounds, (err, hash) => {

        if(err){
            res.json({error: err});
        }
        // else {
        //     console.log(hash);
        // }
        // else {
        //     con.query(`INSERT INTO users (firstName, lastName, birthdate, emailAddress, gender, userName, password, created_at, updated_at) VALUES ('${sub.fName}', '${sub.lName}', '${sub.birthday}', '${sub.email}', '${sub.gender}', '${sub.userName}', '${hash}', now(), now());`, function(err, response){
        //         if (err) console.log(err);
        //         if (response) console.log(response);
        //     })
        // }

    })
})


const port = process.env.PORT || 2000
app.listen(port, () => {
    console.log(`Listening on ${port}`);
})

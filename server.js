//***** IMPORTS  *******/

const express = require('express');
const bp = require('body-parser');
const mysql = require('mysql');
const cors = require("cors");
const bcrypt = require('bcrypt-nodejs');
const credentials = require('./mysqlconnection');

//***** CONFIG ********/

const app = express();

app.use(bp.json());
app.use(cors());

const saltRounds = 10;
const ROOT_URL = "http://54.245.1.152";

const con = mysql.createConnection({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    port: credentials.port,
    database: credentials.database
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

//***** ROUTES ********/

app.get(ROOT_URL, (req, res) => {
    res.json("Hello the api is working!");
});

app.post(`${ROOT_URL}login`, (req,res) => {
    const values = req.body
    con.query(`SELECT * FROM users where(emailAddress = '${values.email}')`, (err, user) => {
        
        if(err) console.log(err);
        
        if(user.length) {
            console.log("*************", user[0].password)
            console.log("********************", values.password)
            bcrypt.compare(values.password, user[0].password, (err, isMatch) => {
                if(err) console.log(`***************There was an error: ${err}`);
                console.log(isMatch); // Define what happens when passwords match!
            })
        };
    })
})

app.post(`${ROOT_URL}/newUser`, (req,res) => {

    const sub = req.body;

    const securityQuestions = [[sub.securityQuestionOne, sub.securityAnswerOne], [sub.securityQuestionTwo, sub.securityAnswerTwo], [sub.securityQuestionThree, sub.securityAnswerThree]]
    console.log(sub);
    const salt = bcrypt.genSaltSync(saltRounds);

    bcrypt.hash(sub.password, salt, (err, hash) => {

        if(err){
            res.json({error: err});
        }
        // else {
        //     console.log(hash);
        // }
        else {
            con.query(`INSERT INTO users (firstName, lastName, birthdate, emailAddress, gender, userName, password, created_at, updated_at) VALUES ('${sub.fName}', '${sub.lName}', '${sub.birthday}', '${sub.email}', '${sub.gender}', '${sub.username}', '${hash}', now(), now());`, (err, response) => {
                if (err) console.log(err);
                if (response) {
                    con.query(`INSERT INTO address (users_id, cityName, stateName, zipCode, addressLineOne, addressLineTwo, created_at, updated_at) VALUES ('${response.insertId}', '${sub.city}', '${sub.state}', '${sub.zip}', '${sub.address}', '${sub.addressTwo ? sub.addressTwo : null}', now(), now())`, (err, result) => {
                        if (err) console.log(err);
                        if(result) console.log(result);
                    });
                    for(let idx = 0; idx < 3; idx++) {
                        con.query(`INSERT INTO securityquestions (users_id, question, answer, created_at, updated_at) VALUES ('${response.insertId}', '${securityQuestions[idx][0]}', '${securityQuestions[idx][1]}', now(), now())`, (err, result) => {
                            if (err) console.log(err);
                            if(result) console.log(result);
                        });
                    };
                };
                res.json({
                    success: "Account created",
                    id: response.insertId
                })
            });
        };

    })
})

app.post(`${ROOT_URL}/checkEmail`, (req,res) => {
    if(req.body.email && req.body.email.length) {
       if(validateEmail(req.body.email)) {
           con.query(`SELECT * FROM users where(emailAddress = '${req.body.email}')`, (err, user) => {

            if(err) console.log(err);

            if(user.length) {
                res.json(false);
            }

            else{
                res.json(true)
            }

           })
       }
    }
})

app.post(`${ROOT_URL}/checkUsername`, (req,res) => {
    if(req.body.username && req.body.username.length) {
           con.query(`SELECT * FROM users where(userName = '${req.body.username}')`, (err, user) => {
               
            if(err) console.log(err);

            if(user.length) {
                res.json(false);
            }

            else{
                res.json(true)
            }
       });
    }
})


const port = process.env.PORT || 2000
app.listen(port, () => {
    console.log(`Listening on ${port}`);
})

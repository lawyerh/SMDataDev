//***** IMPORTS  *******/

const express = require('express');
const bp = require('body-parser');
const mysql = require('mysql');
const cors = require("cors");

//***** CONFIG ********/

const app = express();

app.use(bp.json());
app.use(cors());

//***** ROUTES ********/

app.get('/', (req, res) => {
    res.json("Hello the api is working!");
});


const port = process.env.PORT || 2000
app.listen(port, () => {
    console.log(`Listening on ${port}`);
})

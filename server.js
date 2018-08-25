'use strict';

const express = require("express");
const config = require("./config");
const logger = require('morgan');
const bodyParser = require('body-parser');

// Init express
const app = express();

// Init MySQL Connection
const mysql = require('mysql');
const pool = mysql.createPool({
    host: config.mysqlHost,
    user: config.user,
    password: config.password,
    database: config.db,
    port: config.portDb,
    connectionLimit: 10
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }

    if (connection) {
        connection.release();
    }

    return;
});

app.use(logger('dev'));

// Set header
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.disable('x-powered-by');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, PATCH, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }

});

// Init test routes
app.get("/", (req, res) => {
    console.log("url route '/'");
    res.send(`Hello World from ${req}`);
});

app.get("/db", (req, res) => {
    pool.query(`SELECT * FROM Test`, (error, results, fields) => {
        if (error) {
            console.error('error in /db', error);
        } else {
            return res.json(results);
        }
    });
});

// Init API listening

app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}!`);
});
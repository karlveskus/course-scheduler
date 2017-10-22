const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

router.get('/', (req, res) => {
   pool.query('SELECT * FROM USERS', (err, result) => {
        if (err) {
            return console.log('ERROR ', err);
        }
        res.send(result.rows);
    });
});

router.get('/:id', (req, res) => {
    let id = req.params.id;

    pool.query('SELECT * FROM USERS WHERE id = $1', [id], (err, result) => {
        if (err) {
            return console.log('ERROR ', err);
        }
        res.send(result.rows);
    });
});

router.get('/:id/registered_subjects', (req, res) => {
    let id = req.params.id;

    pool.query('SELECT * FROM USER_REGISTERED_SUBJECT WHERE user_id = $1', [id], (err, result) => {
        if (err) {
            return console.log('ERROR ', err);
        }
        res.send(result.rows);
    });
});

router.get('/:id/draft_subjects', (req, res) => {
    let id = req.params.id;

    pool.query('SELECT * FROM USER_DRAFT_SUBJECT WHERE user_id = $1', [id], (err, result) => {
        if (err) {
            return console.log('ERROR ', err);
        }
        res.send(result.rows);
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/init.js');
const mockOis1Converter = require('../lib/mock_ois1_converter');

router.get('/', (req, res) => {
    //let token = req.headers['x-access-token'];

    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic2Vzc2lvbktleSI6MSwiYWRtaW4iOnRydWV9.DYshzaq1z5c1WrdGEpbgz4i-DcYxByTK_D0oJQbLkAU";
    let sessionKey = jwt.decode(token).sessionKey;
    db.query('SELECT * FROM v_drafts WHERE user_id = $1', [sessionKey], (err, result) => {
        if (err) {
            res.status(500).send();
        }
        else {
            result.rows.map((row) => {
                row.course = mockOis1Converter.processCourse(row.course);
            });
            res.status(200).send(result.rows);
        }
    });
});

router.post('/:course_id', (req, res) => {
    //let token = req.headers['x-access-token'];

    let course_id = req.params.course_id;
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic2Vzc2lvbktleSI6MSwiYWRtaW4iOnRydWV9.DYshzaq1z5c1WrdGEpbgz4i-DcYxByTK_D0oJQbLkAU";
    let sessionKey = jwt.decode(token).sessionKey;
    db.query('INSERT INTO draft_courses (user_id, course_id, locked_group_id, locked_lecturer_id, active_group_id, active_lecturer_id)' +
        'SELECT $1, $2, NULL, NULL, NULL, NULL WHERE NOT EXISTS (SELECT * FROM draft_courses WHERE course_id = $2 AND user_id = $1)', [sessionKey, course_id], (err, result) => {

        if (err) {
            res.status(500).send();
        }
        if (result.rowCount === 0) {
            res.status(400).send();
        }
        res.status(201).send();
    });
});

router.delete('/:course_id', (req, res) => {
    //let token = req.headers['x-access-token'];

    let course_id = req.params.course_id;
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic2Vzc2lvbktleSI6MSwiYWRtaW4iOnRydWV9.DYshzaq1z5c1WrdGEpbgz4i-DcYxByTK_D0oJQbLkAU";
    let sessionKey = jwt.decode(token).sessionKey;
    db.query('DELETE from draft_courses WHERE user_id = $1 AND course_id = $2', [sessionKey, course_id], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).send();
        }
        res.status(200).send();
    });
});

module.exports = router;
import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as fs from 'fs';
import axios from 'axios';
// var exec = require('child_process').exec;
const { exec } = require('child_process');

const app: Application = express();
const port = 9052;

app.get('/', (req, res) => {
    console.log(JSON.stringify(req.headers));
    res.status(200).json({ status: 'ready' });
});

app.get('/on', (req, res) => {
    // exec(`./alexa-remote-control/alexa_remote_control.sh -d 'Philippes Echo Flex' -e automation:'Kleines Licht'`, (error, stdout, stderr) => {
    // exec(`./alexa-remote-control/alexa_remote_control.sh -d 'Philippes Echo Flex' -e speak:'Das ist ein Test'`, (error, stdout, stderr) => {
    exec(`./alexa-remote-control/alexa_remote_control.sh -a`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ status: 'error', error });
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        return res.status(200).json({ status: 'success', stdout });
    });
});

app.listen(port, () => {
    console.log(`running at http://localhost:${port}`);
});

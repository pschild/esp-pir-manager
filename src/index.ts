import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as fs from 'fs';
import axios from 'axios';
var sys = require('sys')
var exec = require('child_process').exec;

const app: Application = express();
const port = 9052;

const puts = (error, stdout, stderr) => { sys.puts(stdout) };

const LIMIT = 60 * 60 * 1000; // 60 minutes
let cachedDate;

app.get('/', (req, res) => {
    console.log(JSON.stringify(req.headers));
    res.status(200).json({ status: 'ready' });
});

app.get('/on', (req, res) => {
    axios.get('http://192.168.178.48/on').then(r => {
        res.status(200).json({ status: 'on' });
    });
});

app.get('/off', (req, res) => {
    axios.get('http://192.168.178.48/off').then(r => {
        res.status(200).json({ status: 'off' });
    });
});

const onForTimespan = (seconds: number) => {
    axios.get('http://192.168.178.48/on').then(r => {
        setTimeout(() => { axios.get('http://192.168.178.48/off'); }, seconds * 1000);
    });
};

app.post('/movement', (req: Request, res: Response) => {
    const now = new Date();
    let logMessage = `${now} movement detected!`;
    
    // onForTimespan(3 * 60);

    if (!cachedDate || cachedDate.getTime() + LIMIT < now.getTime()) {
        // exec("./alexa_remote_control.sh -d 'Philippes Echo Flex' -e automation:'Kleines Licht'", puts);
        console.log(`${now.toISOString()}: triggered!`);
        logMessage += ` triggered!\n`;
        cachedDate = now;
    } else {
        console.log(`${now.toISOString()}: limit reached, skipping...`);
        logMessage += ` skipping!\n`;
    }

    fs.appendFile('movements.log', logMessage, (err) => {
        if (err) {
            return res.status(500).send(`Error writing to file!`);
        }
        // console.log(`Saved @ ${now.toISOString()}!`);
    });

    res.status(200).end();
});

app.listen(port, () => {
    console.log(`running at http://localhost:${port}`);
});

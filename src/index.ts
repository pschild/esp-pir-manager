import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as fs from 'fs';
var sys = require('sys')
var exec = require('child_process').exec;

const app: Application = express();
const port = 9052;

const puts = (error, stdout, stderr) => { sys.puts(stdout) };

const LIMIT = 5 * 60 * 1000; // 5 minutes
let cachedDate;

app.get('/', (req, res) => {
    console.log(JSON.stringify(req.headers));
    res.status(200).json({ status: 'ready' });
});

app.post('/movement', (req: Request, res: Response) => {
    const now = new Date();
    let logMessage = `${now} movement detected!`;

    if (!cachedDate || cachedDate.getTime() + LIMIT < now.getTime()) {
        exec("./alexa_remote_control.sh -d 'Philippes Echo Flex' -e automation:'Kleines Licht'", puts);
        console.log(`triggered!`);
        logMessage += ` triggered!\n`;
        cachedDate = now;
    } else {
        console.log(`limit reached, skipping...`);
        logMessage += ` skipping!\n`;
    }

    fs.appendFile('movements.log', logMessage, (err) => {
        if (err) {
            return res.status(500).send(`Error writing to file!`);
        }
        console.log(`Saved @ ${now.toISOString()}!`);
    });

    res.status(200).end();
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

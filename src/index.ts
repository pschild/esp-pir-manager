import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as fs from 'fs';
import axios from 'axios';

const app: Application = express();
const port = 9052;

app.get('/test', (req, res) => {
    return res.status(200).json({ status: 'success' });
});

app.listen(port, () => {
    console.log(`running at http://localhost:${port}`);
});

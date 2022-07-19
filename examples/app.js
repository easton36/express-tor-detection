const express = require('express');
const torDetectionMiddlewear = require('../dist/index');

const middlewearConfig = {
	block: true, // block TOR exit node requests
	userKey: 'isTor', // req.isTor = true
	errorFormat: 'json', // if block === 'true' then error format will be in JSON or TXT
	errorMessage: 'TOR connections are not allowed!' // message to serve to user
};

const app = express();

app.get('/', torDetectionMiddlewear(middlewearConfig), (req, res) => {
    console.log(req[middlewearConfig.userKey]);
    res.send('You are not using TOR!');
});

app.listen(process.env.port || 3000, () => {
    console.log(`Example app listening on port ${process.env.port || 3000}`);
});
const express = require('express');
const torDetectionMiddlewear = require('../dist/index');

const middlewearConfig = {
	block: true, // block TOR exit node requests
	userKey: 'isTor', // req.isTor = true
	errorMessage: 'TOR connections are not allowed!', // message to serve to user
	redirect: {
        clearNetDomain: 'example.com', // domain name for clearnet traffic
        torDomain: 'example.onion', //domain name for tor traffic
        redirectClearNet: false, //redirect clearnet traffic if accessing from tor domain
        redirectTor: true, //redirect tor traffic if accessing from clearnet domain
    }
};

const app = express();

app.get('/', torDetectionMiddlewear(middlewearConfig), (req, res) => {
    console.log(req.isTor); // false
    res.send('You are not using TOR!');
});

app.listen(process.env.port || 3000, () => {
    console.log(`Example app listening on port ${process.env.port || 3000}`);
});
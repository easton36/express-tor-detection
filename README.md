
  

# express-tor-detection

ExpressJS middlewear to manage users connecting from a TOR exit node 

### Read more about TOR exit node detection: [here](https://2019.www.torproject.org/projects/tordnsel.html.en)

### Read more about using middlewear with Express [here](https://expressjs.com/en/guide/using-middleware.html)

## Installation
Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```console
$ npm install express-tor-detection
```
## Usage
```js
const express = require('express');
const torDetectionMiddlewear = require('express-tor-detection');

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
```

## Example

View the [example](https://github.com/easton36/express-tor-detection/tree/master/example)! Feel free to fork and submit your own!

const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const config = require('./config');

// define server
const server = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;

  // get the payload
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  // end event will always be called (but not data)
  req.on('end', () => {
    // choose the handler this request should go to or default to notFound
    const chosenHandler = router[trimmedPath] || handlers.notFound;

    // construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer,
    };

    // route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      statusCode = Number.isInteger(statusCode) ? statusCode : 200;
      payload = typeof payload === 'object' ? payload : {};

      // convert the payload to a string
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

// create and start the server
http
  .createServer(server)
  .listen(config.httpPort, () => console.log(`listening on port ${config.httpPort}`));

// define the handlers
const handlers = {
  hello(data, callback) {
    callback(200, { message: 'Hello! Soli Deo Gloria!' });
  },
  notFound(data, callback) {
    callback(404, { message: 'Oops! That route doesn\'t exist!' });
  },
};

// define a request router
const router = { ...handlers };

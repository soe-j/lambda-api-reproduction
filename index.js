const FUNCTIONS_DIR = './functions/';

const express = require('express');
const app = express();

const server = app.listen(1337, () => {
  console.log("Server is listening to PORT:", server.address().port);
});

// fixup headers key like Lambda
app.use((req, res, next) => {
  for (oldkey in req.headers) {
      var newkey = oldkey.replace(/((?:^|-)[a-z])/g, val => val.toUpperCase());
      // custom hack for X-Parse-Os-Version ==> X-Parse-OS-Version
      newkey = newkey.replace(/(-Os-)/g, val => val.toUpperCase());

      req.headers[newkey] = req.headers[oldkey];
      delete req.headers[oldkey];
  }
  next();
});

// allow request by pages on other local server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get("/:resource", async (req, res, next) => {

  const func = await getFunc(req.params.resource).catch(e => {
    res.status(404).json({
      resource: req.params.resource,
      message: 'Not Found'
    });
  });
  if (func === undefined) return;

  const funcRes = await func.handler({
    queryStringParameters: req.query,
    headers: req.headers
  }).catch(e => {
    res.status(500).json({
      message: e.message,
      stack: e.stack.split('\n')
    });
  });
  if (funcRes === undefined) return;

  res.status(funcRes.statusCode).json(JSON.parse(funcRes.body));
});

const getFunc = async name => {
  // import every page reload
  const key = require.resolve(`${FUNCTIONS_DIR}/${name}`);
  delete require.cache[key];

  return require(`${FUNCTIONS_DIR}/${name}`);
};

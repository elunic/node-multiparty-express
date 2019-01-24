# multiparty-express

[![Build Status](https://travis-ci.org/elunic/node-multiparty-express.svg?branch=master)](https://travis-ci.org/elunic/node-multiparty-express)

An express middleware for `multiparty`, with TypeScript typings.

## Usage

* It is recommened to only include the middleware on routes that actually require it.
* On routes that have included the middleware, `req.fields` and `req.files` will be key-value objects, with the keys
  being the fieldnames and the values being arrays of values (for fields) or file descriptor objects (for files).
* The file descriptor objects are those used by `multiparty`.

```javascript
const multiparty = require('multiparty-express');
const express = require('express');

const app = express();

app.post('/upload', multiparty(), (req, res, next) => {
  for (const fieldname in req.files) {
    for (const file of req.files[fieldname]) {
      moveUploadedFile(file.path, './uploads/' + file.originalFilename);
    }
  }
  
  for (const fieldname of req.fields) {
    // process field
  }
  
  multiparty.cleanup(req);
});
```


### Debug messages

This module uses `debug` with the `multiparty` namespace.


## TODO

* Allow options to configure which fields/files should actually be processed
* Alows `multiparty` options

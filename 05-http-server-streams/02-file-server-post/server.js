const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  console.log(req);
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (!filepath) {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end('The file is already on disk');
        return;
      }

      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        res.end('Subfolders are not supported');
        return;
      }

      const readStream = fs.createReadStream(filepath);
      const outStream = fs.createWriteStream(`files/${pathname}`, {flags: 'wx'});
      const limitedStream = new LimitSizeStream({limit: 1000000});

      limitedStream.on('error', (error) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File too large');

          fs.unlink(filepath, (err) => {});
          return;
        }

        console.error(err);

        res.statusCode = 500;
        res.setHeader('Connection', 'close');
        res.end('Internal server error');

        fs.unlink(filepath, (err) => {});
      });

      outStream
          .on('error', (err) => {
            if (err.code === 'EEXIST') {
              res.statusCode = 409;
              res.end('File exists');
              return;
            }

            console.error(err);

            res.statusCode = 500;
            res.setHeader('Connection', 'close');
            res.end('Internal server error');

            fs.unlink(filepath, (err) => {});
          })
          .on('close', () => {
            res.statusCode = 201;
            res.end('File created');
          });


      req.pipe(limitedStream).pipe(outStream);

      res.on('close', () => {
        if (res.finished) return;
        fs.unlink(filepath, (err) => {});
      });

      // limitedStream.write(pathname);

      // res.end('Successful writing');
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

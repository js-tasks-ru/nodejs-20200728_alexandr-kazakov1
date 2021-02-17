const fs = require('fs');

module.exports = function deleteFile(filepath, req, res) {
  fs.unlink(filepath, (err) => {
    if (err) {
      res.statusCode = 404;
      res.end('File not found');
    } else {
      res.statusCode = 200;
      res.end(`${filepath} was deleted!`);
    }
  });
};

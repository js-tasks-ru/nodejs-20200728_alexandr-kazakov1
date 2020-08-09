const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const string = chunk.toString();
    const array = string.split(`${os.EOL}`);

    for (let i = 0; i < array.length; i++) {
      this.push(array[i]);
    }

    callback();
  }

  _flush(callback) {}
}

module.exports = LineSplitStream;

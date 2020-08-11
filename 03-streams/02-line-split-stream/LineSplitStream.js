const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.lastStringPart;
  }

  _transform(chunk, encoding, callback) {
    let string;

    if (this.lastStringPart) {
      string = this.lastStringPart + chunk;
    } else {
      string = chunk.toString();
    }

    const array = string.split(`${os.EOL}`);

    this.lastStringPart = array.pop();

    for (let i = 0; i < array.length; i++) {
      this.push(array[i]);
    }

    callback();
  }

  _flush(callback) {
    if (this.lastStringPart) {
      this.push(this.lastStringPart);
      this.lastStringPart = null;
    }
    callback();
  }
}

module.exports = LineSplitStream;

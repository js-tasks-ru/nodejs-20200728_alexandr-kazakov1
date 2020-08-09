const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.size = '';
  }

  _transform(chunk, encoding, callback) {
    this.size += chunk;

    if (this.size.length > this.limit) {
      throw new LimitExceededError();
    } else {
      this.push(chunk);
      callback();
    }
  }
}

module.exports = LimitSizeStream;

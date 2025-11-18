// Minimal shim for pino-pretty in browser environment
module.exports = function pinoPretty() {
  return function (o) {
    // return a simple string representation
    try {
      return typeof o === 'string' ? o : JSON.stringify(o);
    } catch (e) {
      return String(o);
    }
  };
};

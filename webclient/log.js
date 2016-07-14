/*jshint esversion: 6 */

var log = function() {
  var message = randomTimeString() + ': ';
  var args = [...arguments];
  args.forEach(function(token) {
    message += '\t';
    if (typeof(token) === 'object') {
      message += JSON.stringify(token);
    } else {
      message += token;
    }
  });
  console.log(message);
};

/*jshint esversion: 6 */

var messages = [];

var log = function() {
  var message = randomTimeString() + ': ';
  var args = [...arguments];
  args.forEach(function(token) {
    message += '\t';
    if (typeof(token) === 'object') {
      try {
        message += JSON.stringify(token);
      } catch (e) {
        console.log('json error', token);
      }
    } else {
      message += token;
    }
  });
  // console.log(message);
  messages.push(message);
  if (messages.length > 50 || args.length === 0) {
    var name = location.pathname;
    $.ajax({
      type: 'POST',
      data: {messages: messages, name: name},
      url: '/log',
      success: function(msg) {
        console.log(msg);
      }
    });
    messages = [];
  }
};

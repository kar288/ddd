'use strict';

var r = React.createElement;
class Instrument extends React.Component {
  getID() {
    return null;
  }

  actOnElement(el) {

  }

  render() {
    return r('div', {class: 'instrument-' + id}, this.props.children);
  }
};

var getParentRules = function() {
  console.log('getParentRules');
  var parentRules = parent.document.styleSheets[0].rules;
  for (var i = 0; i < parentRules.length; i++) {
    rules.insertRule(parentRules[i].cssText, 0);
  }
};

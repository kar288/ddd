/*jshint esversion: 6 */

/*******************************************************************************
                                   GENERAL
*******************************************************************************/
var getVariable = function(id, doc) {
  var doc = doc || document;
  var el = doc.getElementById(id);
  if (!el) {
    return el;
  }
  var str = el.innerHTML;
  if (!str || str.length === 0) {
    return {};
  }
  try {
    return JSON.parse(str);
  }
  catch (e) {
    console.log(str);
  }
};

var setVariable = function(id, val) {
  var n = document.getElementById(id);
  if (!n) {
    return;
  }
  n.innerHTML = '';
  n.innerHTML = JSON.stringify(val);
};

var isEmpty = function(obj) {
  if (!obj) {
    return true;
  }
  return Object.keys(obj).length === 0 &&
    JSON.stringify(obj) === JSON.stringify({});
};

var webstrateIsObject = function() {
  var url = document.URL;
  return url.includes('shared_notes');
};

var isActive = function(el, name) {
  var active = $(el.ownerDocument).find('#pairing-button').find('.active');
  return active.text().includes(name);
};

var isInEditor = function(el) {
  if (!el) {
    return false;
  }
  var doc = el.document || el.ownerDocument;
  var win = doc.defaultView || doc.parentWindow;
  if (!win) {
    debugger;
    return false;
  }
  return doc !== win.parent.document &&
    $(win.parent.document.body).hasClass('ddd_editor');
};

var isInDocument = function(el, document) {
  return el.ownerDocument === document;
};



var getParams = function(searchString) {
  var parse = function(params, pairs) {
    var pair = pairs[0];
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts.slice(1).join('='));

    // Handle multiple parameters of the same name
    if (typeof params[key] === 'undefined') {
      params[key] = value;
    } else {
      params[key] = [].concat(params[key], value);
    }

    return pairs.length == 1 ? params : parse(params, pairs.slice(1));
  };

  // Get rid of leading ?
  if (searchString.length === 0) {
    return {};
  }
  var params = parse({}, searchString.substr(1).split('&'));
  delete params[''];
  return params;
};

var formatObject = function(key, val) {
  return key + '=' + val + '&';
};

var stringFromParams = function(params) {
  var string = '?';
  Object.keys(params).forEach(function(key) {
    var val = params[key];
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        string += formatObject(key, v);
      });
    } else {
      string += formatObject(key, val);
    }
  });
  return string;
};

var getVariableFromUrl = function(key) {
  return getParams(location.search)[key];
};

var randomTimeString = function () {
  return new Date().getTime();
};

var surroundSelection = function (win) {
  var span = document.createElement("span");
  span.setAttribute('id', randomTimeString);
  span.style.fontWeight = "bold";
  span.style.color = "green";

  if (win.getSelection) {
      var sel = win.getSelection();
      if (sel.rangeCount) {
          var range = sel.getRangeAt(0).cloneRange();
          range.surroundContents(span);
          sel.removeAllRanges();
          sel.addRange(range);
      }
  }
  return span;
};

var deleteSelection = function (win) {
  $(surroundSelection(win)).remove();
};

var insertRules = function(iframeDocument, rules) {
  var cssnum = iframeDocument.styleSheets.length;
  var ti = setInterval(function() {
    cssnum = iframeDocument.styleSheets.length;
    if (cssnum) {
      var styleSheet = iframeDocument.styleSheets[0];
      rules.forEach(function(rule) {
        styleSheet.insertRule(rule, 0);
      });
      clearInterval(ti);
    }
  }, 10);
};

$.fn.addBack = function(selector) {
  return this.add(
    selector === null ? this.prevObject : this.prevObject.filter(selector)
  );
};

var defaultPreventer = function(e) {
  e.preventDefault();
};

var defaultOnMove = function(doc, on) {
  console.log(doc.body.id, on);
  if (!on) {
    $(doc.body).on('mousemove touchmove', defaultPreventer);
    $(doc.html).addClass('no-scroll');
    $(doc.body).addClass('no-scroll');
    return;
  }
  $(doc.html).removeClass('no-scroll');
  $(doc.body).removeClass('no-scroll');
  $(doc.body).off('mousemove touchmove', defaultPreventer);
};

// IOS Iframe bug
var toScrollFrame = function(iFrame, mask){
  // debugger;
  if(!navigator.userAgent.match(/iPad|iPhone/i)) {
    return false;
  } //do nothing if not iOS devie

  var mouseY = 0;
  var mouseX = 0;
  $(iFrame).on('transcluded', function() { //wait for iFrame to load
    //remeber initial drag motition
    // debugger;
    $(this).contents()[0].body.addEventListener('touchstart', function(e) {
      mouseY = e.targetTouches[0].pageY;
      mouseX = e.targetTouches[0].pageX;
    });
    //
    // //update scroll position based on initial drag position
    $(this).contents()[0].body.addEventListener('touchmove', function(e) {
      // debugger;
      var menu = $(this).find('#menu');
      menu.css('top', mouseY - e.targetTouches[0].pageY);
      console.log(mouseY - e.targetTouches[0].pageY);
    //   e.preventDefault(); //prevent whole page dragging
    //
    //   var box = jQuery(mask);
    //   box.scrollLeft(box.scrollLeft()+mouseX-e.targetTouches[0].pageX);
      // menu.css.top = mouseY - e.targetTouches[0].pageY;
    //   //mouseX and mouseY don't need periodic updating, because the current position
    //   //of the mouse relative to th iFrame changes as the mask scrolls it.
    });
  });

  return true;
};

 //add single-touch scrolling to example page

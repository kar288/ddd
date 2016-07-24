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
      // console.log(mouseY - e.targetTouches[0].pageY);
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

var getPos = function(e, container) {
  var pos = {
    x: e.pageX,
    y: e.pageY
  };
  if (e.originalEvent.touches) {
    pos = {
      x: e.originalEvent.touches[0].pageX,
      y: e.originalEvent.touches[0].pageY
    };
  }
  if (container) {
    var parent = container;
    var basePosition = $(parent).offset();
    var right = parent.getBoundingClientRect().right;
    var bottom = parent.getBoundingClientRect().bottom;
    var width = parseInt($(parent).css('width'));
    var height = parseInt($(parent).css('height'));
    if (pos.x > right) {
      pos.x = width;
    } else {
      pos.x -= basePosition.left;
    }
    if (pos.y > bottom) {
      pos.y = height;
    } else {
      pos.y -= basePosition.top;
    }
  }
  pos.x = Math.max(pos.x, 0);
  pos.y = Math.max(pos.y, 0);
  return pos;
};

var touch = false;
if ("ontouchstart" in document.documentElement) {
  touch = true;
}

var restartCanvas = function(doc, restart) {
  doc = doc ? doc : document;
  var images = getVariableFromUrl('images');
  if (images) {
    $(doc).find('.instrument-container').remove();
    $(doc).find('#content').find('div').remove();
    $(doc).find('#content').find('svg').find('*').remove();
    var loadedImages = 0;
    var imageParts = images.split(',');
    imageParts.forEach(function(image) {
      image = parseInt(image);
      var shape = doc.createElement('div');
      shape.id = 'image-' + image;
      $(shape).addClass('shape');
      $(shape).addClass('image');
      $(shape).css({
        'height': '200px',
        'width': '200px',
        'position': 'absolute',
        'top': Math.floor(Math.random() * (451 - 200)) + 'px',
        'left': Math.floor(Math.random() * (801 - 200)) +  'px'
      });
      $(doc).find('#content').append(shape);

      var imageEl = document.createElement('img');
      $(imageEl).addClass('noselect');
      $(imageEl).attr('src', '/' + image + '.jpg');
      $(imageEl).attr('height', '100%');
      $(imageEl).attr('width', '100%');
      $(shape).append(imageEl);

      // $(imageEl).on('load', function() {
      //   loadedImages++;
      //   if (loadedImages >= imageParts.length && restart) {
      //     // this.location = location.pathname;
      //   }
      // }.bind(doc));

      var svg = $(doc).find('svg')[0].cloneNode(true);
      svg.id = 'image-svg-' + image;
      $(shape).append(svg);
    });
  }
};

var includeInstruments = function(doc) {
  $('.instrument-container').each(function(i, el) {
    var newInstrument = el.cloneNode(true);
    $(doc.body).append(newInstrument);
  });
};

var restartEditor = function() {
  var participant = getVariableFromUrl('participant');
  var task = getVariableFromUrl('task');
  var doneIframes = 0;
  var iframes = $('iframe');

  iframes.each(function(i, el) {
    var name = $(el).attr('src');
    var newSrc = 'new?' +
      'id=' + name + '-' + participant + '-' + task +
      '&prototype=' + name;
    $(el).on('transcluded', function() {
      doneIframes++;
      if (doneIframes >= iframes.length) {
        var doc = $('#object-outline')[0].contentDocument;
        restartCanvas(doc);
        if (task === 'B') {
          includeInstruments(doc);
        }
        location = location.pathname + '?mainEditor=1';
      }
    });
    $(el).attr('src', newSrc);
  });
};
 //add single-touch scrolling to example page

var started = false;
 $(window).load(function() {
   if (started) {
     return;
   }

   var pathname = location.pathname;
   if (pathname.indexOf('toolbar') === -1 && pathname.indexOf('editor') === -1) {
     return;
   }

   started = true;
   var images = getVariableFromUrl('images');
   if (images) {
     if (pathname.indexOf('toolbar') === -1) {
       restartEditor();
       return;
     }

     restartCanvas(null /* doc */, true /* restart */);
     return;
   }
 });

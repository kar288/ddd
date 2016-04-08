'use strict';

/*******************************************************************************
                                   GENERAL
*******************************************************************************/
var getVariable = function(id, doc) {
  doc = doc || document;
  var str = doc.getElementById(id).innerHTML;
  if (!str || str.length === 0) {
    return {};
  }
  return JSON.parse(str);
};

var setVariable = function(id, val) {
  document.getElementById(id).innerHTML = JSON.stringify(val);
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

/*******************************************************************************
                                   INSTRUMENTS
*******************************************************************************/

var instrumentCode = function(extraFunction) {
  if (parent.document !== this) {
    parent.onloadIframe(document, 'active', null, actOnElement);
  }

  objectCodeInternal();

  $('.sub-instrument').on('click', function(e) {
    var active = this.id;
    setVariable('active', active);
  });

  if (extraFunction) {
    extraFunction();
  }
};

var moverCode = function() {
  window.actOnElement = function(el, pos) {
    if (!el) {
      setVariable('startPos', {});
      return;
    }

    var state = getVariable('active');
    if (state == 'stop') {
      return;
    }

    var target = el;
    // var target = el.closest('.note');
    if (!target) {
      return;
    }

    var style = getComputedStyle(target);
    var start = getVariable('startPos');
    if (isEmpty(start)) {
      start.x = pos.x - parseInt(style.getPropertyValue('left'));
      start.y = pos.y - parseInt(style.getPropertyValue('top'));
      setVariable('startPos', start);
    } else {
      target.style.left = pos.x - start.x + 'px';
      target.style.top = pos.y - start.y + 'px';
    }
  };

  instrumentCode();
};

var colorCode = function() {
  window.actOnElement = function(el, pos) {
    if (!el) {
      return;
    }
    var color = getVariable('active');
    el.style.backgroundColor = color;
  };

  instrumentCode();
};

var historyCode = function() {
  window.actOnElement = function(el, pos) {
    if (!el) {
      return;
    }
    var state = getVariable('active');
    if (state === 'redo') {
      return;
    }
    var tmp = $('#tmp');
    // debugger;
    var iframe = document.createElement('iframe');
    // iframe.setAttribute('src', el.ownerDocument.body.id);
    iframe.setAttribute('src', el.ownerDocument.body.id + '?v=-1');
    tmp.html(iframe);
    iframe.addEventListener('transcluded', function(e) {
      debugger;
    });
  };

  instrumentCode();
};

var clipboardCode = function() {
  window.actOnElement = function(el, pos) {
    if (el.id == 'paste' || el.id == 'cut' ||
      el.id == 'delete' || el.id == 'copy') {
      return;
    }
    if (!el) {
      return;
    }
    var state = getVariable('active');
    if (state === 'copy') {
      var copy = el.cloneNode(true);
      copy.id += '-';
      $('#tmp').html(copy);
      return;
    } else if (state === 'cut') {
      $('#tmp').html(el);
    } else if (state === 'delete') {
      $('#tmp').html(el);
      $('#tmp').html('');
    } else if (state === 'paste') {
      var tmp = document.getElementById('tmp').children[0];
      if (!tmp) {
        return;
      }
      var copy = tmp.cloneNode(true);
      copy.id += 'copy';
      console.log(tmp);
      el.appendChild(copy);
      $('#tmp').html('');
    }
  };

  instrumentCode();
};

var textInserterCode = function() {
  window.actOnElement = function(el, pos) {
    if (!el) {
      return;
    }

    var state = getVariable('active');
    if (state == 'stop') {
      return;
    }

    var selected = getVariable('selected');
    selected[el.ownerDocument.body.id + ' ' + el.id] = true;
    el.setAttribute('contenteditable', true);
    setVariable('selected', selected);
  };

  instrumentCode(function() {
    $('#stop').on('click', function() {
      var selected = getVariable('selected');
      Object.keys(selected).forEach(selEl => {
        var [doc, id] = selEl.split(' ');
        if (parent) {
          parent.document
            .getElementById(doc).contentWindow.document
            .getElementById(id)
            .setAttribute('contenteditable', false);
        }
      });
      setVariable('selected', {});
    });
  });
};

/*******************************************************************************
                                   EDITOR
*******************************************************************************/
var activeInstrumentID = null;
var actOnElements = {};

var config = {characterData: true, subtree: true, childList: true};

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (!activeInstrumentID) {
      return;
    }
    var target = mutation.target;
    var ownerDocument = target.ownerDocument;
    var objectID = getVariable('active-object', ownerDocument);
    var cursor = getVariable('cursor', ownerDocument);
    var object = ownerDocument.getElementById(objectID);
    actOnElements[activeInstrumentID](object, cursor);
  });
});

var onloadIframe = function(d, instrumentID, objectID, actOnElement) {
  if (instrumentID) {
    var instrument = $(d.getElementById(instrumentID));
    actOnElements[instrument.attr('class')] = actOnElement;
    instrument.bind('DOMSubtreeModified', function() {
      activeInstrumentID = instrument[0].getAttribute('class');
      $('.instrument').removeClass('selected');
      $('#' + activeInstrumentID).addClass('selected');
    });
  }

  if (objectID) {
    var info = d.getElementById('info');
    if (!info) {
      return;
    }
    observer.observe(
      info,
      config
    );
  }
};

/*******************************************************************************
                                   OBJECT
*******************************************************************************/
var objectCodeInternal = function() {
  if (!document.getElementById('info')) {
    debugger;
    // var info = document.createElement('div');
    // info.setAttribute('id', 'info');
    // var activeObject = document.createElement('div');
    // activeObject.setAttribute('id', 'active-object');
    // var cursor = document.createElement('div');
    // cursor.setAttribute('id', 'cursor');
    // info.appendChild(activeObject);
    // info.appendChild(cursor);
    // document.body.appendChild(info);
    // setVariable('cursor', {});
    // setVariable('active-object', '');
    //
    // document.body.append('div')
    // <div id="info"><div id="active-object">"title"</div><div id="cursor">{"x":261,"y":379}</div></div>
  }
  if (parent.document !== document) {
    parent.onloadIframe(document, null, 'active-object');
  }

  document.addEventListener('mousedown', function(e) {
    var id = e.target.getAttribute('id');
    setVariable('active-object', id);
    setVariable('cursor', {x: e.clientX, y: e.clientY});
  });

  document.addEventListener('mousemove', function(e) {
    if (!getVariable('active-object')) {
      return;
    }
    setVariable('cursor', {x: e.clientX, y: e.clientY});
  });

  document.addEventListener('mouseup', function(e) {
    setVariable('active-object', '');
    setVariable('cursor', '');
  });
};

var objectCode = function() {
  $('document').ready(function() {
    objectCodeInternal();
  });
};

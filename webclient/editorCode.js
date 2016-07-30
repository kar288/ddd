/*jshint esversion: 6 */

var actOnElements = {};
var turnOffs = {};
var turnOns = {};
var config = {characterData: true, subtree: true, childList: true};

// $(window).load(function() {
  // debugger;
//   var images = getVariableFromUrl('images');
//   if (images) {
//     restartEditor();
//     return;
//   }
// });

var transcludedInEditor = function(e) {
  // debugger;
  var iframe = $(this)[0];
  var d = iframe.contentDocument;
  var w = iframe.contentWindow;
  var instrumentID = d.body.id;
  if (getVariableFromUrl('mainEditor') === '1') {
    // if it is an instrument;
    if (w.actOnElement) {
      actOnElements[instrumentID] = w.actOnElement;

      // Turn instrument on
      var activeNode = d.getElementById('active');
      if (activeNode) {
        activeInstrumentObserver.observe(activeNode, config);
      }
    }
    var info = d.getElementById('info');
    if (!info) {
      return;
    }
    observer.observe(info, config);
  }
  if (w.actOnElement) {
    turnOffs[instrumentID] = w.turnOff;
    turnOns[instrumentID] = w.turnOn;
  }
  insertRules(
    $(this)[0].contentDocument,
    ['#opener-button, .opener-iframe {display: none;}']
  );
  // var hammertime = new Hammer(
  //   $(this)[0].contentDocument.body, {
  //     cssProps: {
  //       userSelect: true
  //     }
  //   }
  // );
  // var params = getParams(location.search);
  // var active = params.active;
  // if (!active || isEmpty(active)) {
  //   active = $('.editor-container').map(function(i, el) {
  //     return el.getAttribute('object');
  //   }).toArray();
  // }
  // active = new Set(active);
  // hammertime.on('swipe', function(ev) {
  //   var id = ev.target.ownerDocument.body.id;
  //   var object = $(parent.document)
  //     .find('.editor-container[object=object-' + id + ']');
  //   object.addClass(mobileHiddenClass);
  //   $(parent.document).find('.editor-container')
  //     .removeClass(mobileShownClass);
  //   var nextObject = null;
  //
  //   while (!nextObject) {
  //     if (ev.direction === Hammer.DIRECTION_LEFT) {
  //       object = object.next('.editor-container');
  //     } else if (ev.direction === Hammer.DIRECTION_RIGHT) {
  //       object = object.prev('.editor-container');
  //     }
  //     if (!object || object.length === 0) {
  //       var index = 0;
  //       var containers = $('.editor-container');
  //       if (ev.direction === Hammer.DIRECTION_RIGHT) {
  //         index = containers.length - 1;
  //       }
  //       object = $(containers[index]);
  //     }
  //     if (active.has(object.attr('object'))) {
  //       nextObject = object;
  //     }
  //   }
  //   nextObject.addClass(mobileShownClass);
  //   nextObject.removeClass(mobileHiddenClass);
  // });
};

var editorCode = function(iframe) {
  preventContextMenu();

  if (!$('body').hasClass('ddd_editor')) {
    return;
  }

  // toScrollFrame('iframe', '.editor-container');

  if (iframe) {
    var boundFunction = transcludedInEditor.bind(iframe);
    boundFunction();
  } else {
    $('iframe').on('transcluded', transcludedInEditor);
  }

  var timestamp = randomTimeString();
  var mobileHiddenClass = 'mobile-hidden-' + timestamp;
  var mobileShownClass = 'mobile-shown-' + timestamp;
  insertRules(
    document,
    [
      '.' + mobileShownClass + ' {display: block !important;}',
      '.' + mobileHiddenClass + ' {display: none !important;}'
    ]
  );

  $(window).bind('beforeunload', function(e) {
    log();
    $('.' + mobileHiddenClass).removeClass(mobileHiddenClass);
    $('.' + mobileShownClass).removeClass(mobileShownClass);
  });

  var params = getParams(location.search);
  if ('active' in params) {
    if (typeof params.active === 'string') {
      params.active = [params.active];
    }
    var activeObjects = new Set(params.active);
    $('.editor-container').each(function(i, el) {
      var object = $(el).attr('object');
      if (!activeObjects.has(object)) {
        var rules = [
          '.editor-container[object=' + object + '] {display: none;}'
        ];
        insertRules(document, rules);
      }
    });
  }
};

var prevPos = null;
var prevMover = null;

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    var target = mutation.target;
    var ownerDocument = target.ownerDocument;
    var objectID = getVariable('active-object', ownerDocument);
    var cursor = getVariable('cursor', ownerDocument);
    var cursorMover = getVariable('cursorMover', ownerDocument);
    var object = ownerDocument.getElementById(objectID);
    if (
      object &&
      ($(object).parent('#menu').length ||
      $(object).hasClass('sub-instrument') ||
      object.id === 'menu')
    ) {
      return;
    }
    $(ownerDocument).find('#pairing-button')
      .find('.active')
      .each(function(i, el) {
        var name = $(el).text();
        var f = actOnElements[name];
        if (!f || typeof actOnElements[name] === 'object') {
          return;
        }
        if (name === 'mover') {
          // if (prevMover && cursorMover && cursorMover.x === prevMover.x && cursorMover.y === prevMover.y) {
          //   return;
          // }
          prevMover = cursorMover;
          if (object) {
            log('action', name, object.id, cursorMover);
          } else {
            prevMover = null;
          }

          actOnElements[name](object, cursorMover);
        } else {
          if (prevPos && cursor && cursor.x === prevPos.x && cursor.y === prevPos.y) {
            
            return;
          }
          prevPos = cursor;
          if (object) {
            log('action', name, object.id, cursor);
          } else {
            prevPos = null;
          }

          actOnElements[name](object, cursor);
        }
      });
  });
});

var activeInstrumentObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    var target = mutation.target;
    var ownerDocument = target.ownerDocument;
    var activeSubInstrument = getVariable('active', ownerDocument);
    if (activeSubInstrument === 'start' || activeSubInstrument === 'stop') {
      var activeInstrumentID = target.ownerDocument.body.id;
      var iframes = $('iframe');
      iframes.each(function(i, el) {
        var doc = el.contentDocument;
        var button = $(doc).find('#pairing-button');
        if (activeSubInstrument === 'start' &&
          button.length &&
          !$(doc).find('.i-' + activeInstrumentID).length &&
          activeInstrumentID !== 'opener'
        ) {
          var instrument = el.contentDocument.createElement('div');
          $(instrument).text(activeInstrumentID);
          instrument.setAttribute('class', 'i-' + activeInstrumentID);
          // instrument.style.opacity = 0.4;
          $(instrument).addClass('active');
          button.prepend(instrument);
        } else if (activeSubInstrument === 'stop' &&
          button.length &&
          $(doc).find('.i-' + activeInstrumentID).length &&
          activeInstrumentID !== 'opener'
        ) {
          $(doc).find('.i-' + activeInstrumentID).remove();
        }
      });
    }
  });
});

var removeOthers = function(activeInstrumentID, activated) {
  if (isInEditor(this)) {
    $(parent.document).find('iframe').each(function(i, el) {
      var controller =
        $(el.contentDocument).find('.i-' + activeInstrumentID);
      controller.each(function(i, el) {
        if (!$(el).hasClass('active')) {
          $(el).remove();
        }
      });
    });
    if (activated) {
      $(activated).remove();
    }
  }
};

var activateInstrumentListener = function(pairingButton) {
  // TODO: look into this, activated and stuff seems a bit sketchy.
  $(pairingButton).children().each(function(i, el) {
    $(el).on('click tap', function() {
      var name = $(this).text();
      if ($(this).hasClass('active')) {
        if ($('.activated[instrument=' + name + ']').length === 0) {
          $(this).remove();
          // var deactivated = pairingButton.ownerDocument.createElement('div');
          // deactivated.setAttribute('class', 'deactivated');
          // deactivated.setAttribute('instrument', name);
          // pairingButton.appendChild(deactivated);
        }
      } else {
        var activeInstrumentID = $(this).text();
        this.style.opacity = 1;
        $(this).addClass('active');
        removeOthers(activeInstrumentID);
        if (!$(pairingButton).find('.activated').length) {
          var activated = pairingButton.ownerDocument.createElement('div');
          activated.setAttribute('class', 'activated');
          activated.setAttribute('instrument', name);
          pairingButton.appendChild(activated);
        }
      }
    });
  });
};

var pairingButtonObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    activateInstrumentListener(mutation.target);
    if (mutation.type === 'childList' &&
      mutation.addedNodes.length &&
      $(mutation.addedNodes[0]).hasClass('activated')
    ) {
      var addedNode = $(mutation.addedNodes[0]);
      var instrument = addedNode.attr('instrument');
      var turnOn = parent.turnOns[instrument];
      if (turnOn) {
        turnOn(this.document);
      }
      removeOthers(instrument, addedNode);
    }
    if (mutation.type === 'childList' &&
      mutation.removedNodes.length &&
      $(mutation.removedNodes[0]).hasClass('active')
    ) {
      var removedNode = $(mutation.removedNodes[0]);
      var turnOff = parent.turnOffs[removedNode.text()];
      if (turnOff) {
        turnOff(this.document);
      }
    }
  });
});

var pairingButtonListener = function() {
  var pairingButton = document.getElementById('pairing-button');
  if (pairingButton) {
    pairingButtonObserver.observe(pairingButton, config);
    activateInstrumentListener(pairingButton);
  }
};

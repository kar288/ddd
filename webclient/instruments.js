/*jshint esversion: 6 */

var instrumentCode = function(extraFunction) {
  objectCodeInternal();

  $('#innerText').click(function(e) {
    var menu = $('#menu');
    if (menu.hasClass('active')) {
      $('#stop').trigger('click');
      menu.find('#innerText').text('activate');
      log('activate', document.body.id);
    } else {
      $('#start').trigger('click');
      menu.find('#innerText').text('deactivate');
      log('deactivate', document.body.id);
    }
  });

  $('.expander-other-instruments').on('click tap', function(e) {
    $('.other-instruments').toggleClass('hidden');
  });

  $('.other-instruments').find('div').on('click tap', function(e) {
    if (parent.document !== document) {
      $('.other-instruments').toggleClass('hidden');
      $(window.frameElement).attr('src', $(this).text());
    } else {
      $('.other-instruments').toggleClass('hidden');
      location.href = '/' + $(this).text();
    }
  });

  $('.sub-instrument').on('click tap', function(e) {
    var active = this.id;
    setVariable('active', active);
    log(
      'sub-instrument',
      active,
      this.ownerDocument.body.id,
      $(this.ownerDocument).find('#menu').hasClass('active')
    );
  });

  $('#opener-button').on('click tap', function() {
    var opener = $('.opener-iframe');
    if (opener.length) {
      opener.remove();
      return;
    }
    opener = document.createElement('iframe');
    opener.setAttribute('class', 'opener-iframe');
    opener.setAttribute(
      'src',
      'new?prototype=opener&id=' + document.body.id + '-' + 'opener'
    );
    document.body.appendChild(opener);
  });

  $('#active').bind('DOMSubtreeModified', function() {
    var active = getVariable('active');
    if (!active || isEmpty(active)) {
      return;
    }

    if (active !== 'start') {
      var activeElement = $('[id*=' + active + ']');
      if (activeElement.length) {
        $('.sub-instrument').removeClass('selected');
        activeElement.addClass('selected');
      }
    } else {
      $('#menu').css('backgroundColor', 'red');
      $('#menu').addClass('active');
    }
    if (active !== 'stop') {
      return;
    }
    $('#menu').css('backgroundColor', 'white');
    $('#menu').removeClass('active');
    if (isInEditor(this)) {
      $(parent.document).find('iframe').each(function(i, el) {
        var controller = $(el.contentDocument).find('.i-' + document.body.id);
        if (!controller.hasClass('active')) {
          controller.remove();
        }
      });
    }
  });

  if ($('#stop')) {
    $('#stop').on('click', function() {
      removeOthers(document.body.getAttribute('id'));
      $('.sub-instrument').removeClass('selected');
    });
  }

  if (extraFunction) {
    extraFunction();
  }
};

var highlighterCode = function() {
  // var doc = '';
  // var id = '';
  var newEl = null;
  window.actOnElement = function(el, pos) {
    var active = getVariable('active');
    // var tmp = getVariable('tmp');
    if (active === 'stop') {
      // setVariable('tmp', '');
      // doc = '';
      // id = '';
      newEl = null;
      return;
    }
    if (!el) {
      if (newEl === null) {
        return;
      }
      // if (!tmp) {
      //   return;
      // }
      // var [doc, id] = tmp.split(' ');
      // var elDoc = parent.document
      //   .getElementById('object-' + doc).contentWindow.document;
      // var newEl = elDoc.getElementById(id);
      var elDoc = newEl.ownerDocument;
      var selection = elDoc.getSelection();
      if (!selection || selection.type !== 'Range') {
        return;
      }
      newEl.setAttribute('contenteditable', true);
      elDoc.execCommand('styleWithCSS', true, null);
      elDoc.execCommand(
        'backColor',
        false,
        $('#sample').css('background-color')
      );
      newEl.setAttribute('contenteditable', false);
      return;
    } else {
      // doc = el.ownerDocument.body.id;
      // id = el.id;
      newEl = el;
      // setVariable('tmp', el.ownerDocument.body.id + ' ' + el.id);
    }
  };

  instrumentCode();
};

var moverCodeInternal = function(el, pos, start, state) {
  if (!el || $(el).is('body') || isEmpty(pos)) {
    return {};
  }

  if (state === 'stop') {
    return start;
  }
  var style = getComputedStyle(el);
  if ($(el).parents('svg').length) {
    if (isEmpty(start)) {
      var xforms = el.getAttribute('transform') || 'translate(0, 0)';
      var parts  = /translate\((.*)[ ]*,[ ]*(.*)\)/.exec(xforms);
      var first = parseInt(parts[1]);
      var second = parseInt(parts[2]);
      if (isNaN(first) || isNaN(second)) {
        return start;
      }
      log('start moving', el.id, 'from', start);
      start.x = pos.x - first;
      start.y = pos.y - second;
    } else {
      log('moved', el.id, 'to', pos);
      el.setAttribute('transform',
        'translate(' +
          (pos.x - start.x) +
        ', ' +
          (pos.y - start.y) +
        ')');
    }
  } else {
    if (isEmpty(start)) {
      $(el.parentElement).append(el);

      var left = parseInt(style.getPropertyValue('left'));
      var top = parseInt(style.getPropertyValue('top'));
      if (isNaN(left) || isNaN(top)) {
        return start;
      }
      log('start moving', el.id, 'from', start);
      start.x = pos.x - left;
      start.y = pos.y - top;
    } else {
      log('moved', el.id, 'to', pos);
      el.style.left = pos.x - start.x + 'px';
      el.style.top = pos.y - start.y + 'px';
    }
  }
  return start;
};

var moverCode = function() {
  var start = {};
  window.actOnElement = function(el, pos) {
    var state = getVariable('active');
    start = moverCodeInternal(el, pos, start, state);
  };

  window.turnOn = function(doc) {
    defaultOnMove(doc, false);
  };

  window.turnOff = function(doc) {
    defaultOnMove(doc, true);
  };

  instrumentCode();
};

var searchCode = function() {
  var docId = '';
  if (isInEditor(this)) {
    $('.sub-instrument#search').on('click tap', function(e) {
      // var docId = getVariable('tmp');
      var text = $('#text').text();
      if (!docId) {
        $.ajax('/api/search?query=' + text).done(function(response) {
          var resultsContainer = $('#resultsContainer');
          resultsContainer.html('');
          var ids = response.ids;
          ids.splice(10);
          ids.forEach(function(id) {
            var el = document.createElement('div');
            el.setAttribute('id', id.id);
            $(el).html(id.id);
            resultsContainer.append(el);
            var snippets = document.createElement('div');
            snippets.setAttribute('id', 'snippet-' + id.id);
            id.positions.forEach(function(position) {
              var snippet = document.createElement('p');
              $(snippet).html(position);
              $(snippets).append(snippet);
            });
            resultsContainer.append(snippets);
            resultsContainer.append(document.createElement('hr'));
            $(document.body).highlight(text);
          });
        });
        return;
      }
      var targetEl = $(parent.document).find('#object-' + docId)[0];
      if (!targetEl) {
        return;
      }
      var targetDoc = targetEl.contentDocument;
      $(targetDoc.body).removeHighlight();
      $(targetDoc.body).highlight(text);
    });
    $('#stop').on('click tap', function(e) {
      // var docId = getVariable('tmp');
      if (!docId) {
        return;
      }
      var targetDoc = $(parent.document).find('#object-' + docId)[0].contentDocument;
      $(targetDoc.body).removeHighlight();
      // setVariable('tmp', '');
      docId = '';
      removeOthers('search');
    });
  }
  window.actOnElement = function(el, pos) {
    // if ($(el).attr('id') === 'pairing-button') {
    //   console.log('bla');
    // }
    if (!el) {
      return;
    }
    // setVariable('tmp', el.ownerDocument.body.getAttribute('id'));
    docId = el.ownerDocument.body.getAttribute('id');
  };
  instrumentCode();
};

var createObjectById = function(id) {
  var iframe = document.createElement('iframe');
  iframe.setAttribute(
    'src',
    'new?prototype=objectBase&id=' + id.replace('.txt', '')
  );
  $(document.body).append(iframe);
  $(iframe).on('transcluded', function(e) {
    var iframeDoc = this.contentDocument;
    var textContainer = iframeDoc.createElement('div');
    iframeDoc.body.setAttribute('id', name.replace('.txt', ''));
    $(iframeDoc.body).append(textContainer);
    $.ajax('/file?id=' + id).done(function(response) {
      $(textContainer).html(response.text);
      // $(this).remove();
    }.bind(iframe));
  }.bind(iframe));
  return iframe;
};

var textObjectCreatorCode = function() {
  $('.sub-instrument#create').on('click tap', function(e) {
    $.ajax('/fileNames').done(function(response) {
      response.names.forEach(function(name, i) {
        if (!name.endsWith('.txt') || i <= -1 || i > 100) {
          return;
        }
        createObjectById(name);
      });
    });
  });
};

var colorPickerCode = function() {
  var newEl = null;
  var elDoc = null;
  window.actOnElement = function(el, pos) {
    // var tmp = getVariable('tmp');
    // if (isEmpty(tmp)) {
      // tmp = '';
    // }
    // var [doc, id] = tmp.split(' ');

    var color = $('.selected').attr('id');
    if (color === 'stop' || color === 'active') {
      return;
    }
    if (!el || isInDocument(el, document)) {
      if (elDoc) {
        // var elDoc = parent.document
          // .getElementById(doc).contentWindow.document;
        var selection = elDoc.getSelection();
        el = newEl;
        // el = elDoc.getElementById(id);
        if (selection.type === 'Range') {
          // el.style.color = color;
          el.setAttribute('contenteditable', true);
          el.ownerDocument.execCommand('styleWithCSS', true, null);
          el.ownerDocument.execCommand('foreColor', false, color);
          el.setAttribute('contenteditable', false);
        } else if ($(el).parents('svg').length) {
          el.setAttribute('stroke', color);
          el.setAttribute('fill', color);
        } else {
          el.style.backgroundColor = color;
        }
      }
      // setVariable('tmp', '');
      newEl = null;
      elDoc = null;
      return;
    }
    newEl = el;
    elDoc = el.ownerDocument;
    // setVariable('tmp', 'object-' + el.ownerDocument.body.id + ' ' + el.id);

  };

  instrumentCode();
};

// var historyCode = function() {
//   window.actOnElement = function(el, pos) {
//     if (!el || isInDocument(el, document)) {
//       return;
//     }
//     var state = getVariable('active');
//     if (state === 'redo') {
//       return;
//     }
//     var tmp = $('#tmp');
//     var iframe = document.createElement('iframe');
//     // iframe.setAttribute('src', el.ownerDocument.body.id);
//     iframe.setAttribute('src', el.ownerDocument.body.id + '?v=-1');
//     tmp.html(iframe);
//     // iframe.addEventListener('transcluded', function(e) {
//     //   debugger;
//     // });
//   };
//
//   instrumentCode();
// };

var textInserterCode = function() {
  var selected = [];
  window.actOnElement = function(el, pos) {
    if (!el || isInDocument(el, document)) {
      return;
    }

    var state = getVariable('active');
    if (state === 'stop') {
      return;
    }

    // var selected = getVariable('tmp') || [];
    selected.push(el.ownerDocument.body.id + ' ' + el.id);
    el.setAttribute('contenteditable', true);
    $(el).find('svg').css('display', 'none');
    var convertProperties = {
      'color': 'foreColor'
    };
    function convertOtherProperties(property, value) {
      if (property === 'font-weight') {
        return value;
      }
      return '';
    }

    el.ownerDocument.execCommand('styleWithCSS', true, null);
    $(el).on('click', function(e) {
      var i = 0;

      var sample = $('#sample').find('span')[0];
      while (sample.style[i]) {
        var property = sample.style[i];
        var newProperty = convertProperties[property];
        var value = getComputedStyle(sample).getPropertyValue(property);
        if (newProperty) {
          e.target.ownerDocument.execCommand(
            newProperty,
            false,
            value
          );
        } else {
          e.target.ownerDocument.execCommand(
            convertOtherProperties(property, value),
            false,
            null
          );
        }
        i++;
      }
    });
    // setVariable('tmp', selected);
  };

  var clearContentEditable = function(docIds) {
      // var selected = getVariable('tmp');
      var keep = [];
      var remove = [];
      selected.forEach(function(selEl) {
        var [doc, id] = selEl.split(' ');
        if (docIds.indexOf(doc) >= 0) {
          remove.push(selEl);
        } else {
          keep.push(selEl);
        }
      });
      remove.forEach(function(selEl) {
        var [doc, id] = selEl.split(' ');
        if (isInEditor(this)) {
          var el = parent.document
            .getElementById('object-' + doc).contentWindow.document
            .getElementById(id);
          if (el) {
            $(el).attr('contenteditable', false);
            $(el).find('svg').css('display', 'block');
          }
        }
      });
      // setVariable('tmp', keep);
      selected = keep;
  };

  // window.turnOn = function(doc) {
  //   defaultOnMove(doc, false);
  // };

  window.turnOff = function(doc) {
    var docId = doc.body.id;
    clearContentEditable([docId]);
  };

  $('#stop').on('click tap', function(e) {
    // var selected = getVariable('tmp');
    var docIds = [];
    selected.forEach(function(selEl) {
      var [doc, id] = selEl.split(' ');
      docIds.push(doc);
    });
    clearContentEditable(docIds);
  });

  instrumentCode();
};

var drawShape = function(el, pos, state, style, shape, firstPos) {
  if (!el || state === 'stop' || state === 'active' || isEmpty(pos)) {
    shape = null;
    firstPos = null;
    return {shape: shape, firstPos: firstPos};
  }
  var size = 10;
  if (firstPos === null) {
    var id = 'shape-' + randomTimeString();
    firstPos = pos;
    shape = el.ownerDocument.createElement('div');
    shape.setAttribute('id', id);
    var svg = $($(el.ownerDocument).find('svg')[0]).clone();
    svg.html('');
    svg.prependTo(shape);
    $.each(style, function(prop, value) {
      $(shape).css(prop, value);
    });
    shape.style.position = 'absolute';
    $(shape).addClass('shape');
    el.appendChild(shape);
  } else {
    size = Math.max(10, (Math.abs(pos.x - firstPos.x)));
  }
  if (shape) {
    shape.style.width = size + 'px';
    shape.style.height = size + 'px';
    // var basePosition = $(shape.parentElement).offset();
    // console.log(basePosition);
    // console.log(firstPos);
    // console.log(firstPos);
    shape.style.top = (firstPos.y - size / 2) + 'px';
    shape.style.left = (firstPos.x - size / 2) + 'px';
    if (state === 'circle') {
      shape.style.borderRadius = size / 2 + 'px';
    }
  }
  return {shape: shape, firstPos: firstPos};
};

var shapesCode = function() {
  var shape = null;
  var firstPos = null;
  window.actOnElement = function(el, pos) {
    var state = $('.selected').attr('id');
    var style = {'background-color': $('#sample').css('background-color')};
    var result = drawShape(el, pos, state, style, shape, firstPos);
    shape = result.shape;
    firstPos = result.firstPos;
  };

  window.turnOn = function(doc) {
    defaultOnMove(doc, false);
  };

  window.turnOff = function(doc) {
    defaultOnMove(doc, true);
  };

  instrumentCode();
};

var resizerCode = function() {
  var newEl = null;
  window.actOnElement = function(el, pos) {
    if (!el && newEl) {
      el = newEl;
      newEl = null;

      var state = $('.selected').attr('id');
      if (!state || state === 'stop' || state === 'active') {
        return;
      }

      var doc = el.ownerDocument;
      var selection = doc.getSelection();
      if (selection.type === 'Range' && selection.baseNode.nodeType === 3) {
        // console.log('selectoin');
        // console.log(selection);
        // console.log(selection.type);
        el.setAttribute('contenteditable', true);
        el.ownerDocument.execCommand('styleWithCSS', true, null);
        if (state === 'more-diagonal') {
          el.ownerDocument.execCommand('fontSize', false, 7);
        } else if (state === 'less-diagonal') {
          el.ownerDocument.execCommand('fontSize', false, 2);
        }
        el.setAttribute('contenteditable', false);
        return;
      }
      if ($(el).is('body')) {
        el = $(parent.document).find('#object-' + el.getAttribute('id'))[0];
        if ($(el).is('body')) {
          return;
        }
      }
      var style = getComputedStyle(el);
      var height = parseFloat(style.getPropertyValue('height'));
      var width = parseFloat(style.getPropertyValue('width'));
      var change = {horizontal: 1, vertical: 1};
      if (state.indexOf('vertical') >= 0) {
        change.horizontal = 0;
      } else if (state.indexOf('horizontal') >= 0) {
        change.vertical = 0;
      }
      if (state.indexOf('more') >= 0) {
        height += change.vertical;
        width += change.horizontal;
      } else if (state.indexOf('less') >= 0) {
        height -= change.vertical;
        width -= change.horizontal;
      }
      el.style.height = height + 'px';
      el.style.width = width + 'px';
      return;
    }
    if (!newEl) {
      newEl = el;
    }
  };

  instrumentCode();
};

var textStylerCode = function() {
  var newEl = null;
  var elDoc = null;
  window.actOnElement = function(el, pos) {
    // var tmp = getVariable('tmp');
    if (!el || isInDocument(el, document)) {
      // if (!isEmpty(tmp)) {
      if (newEl && elDoc) {
        // var [doc, id] = tmp.split(' ');
        var state = $('.selected').attr('id');
        if (!state) {
          return;
        }
        // if (parent && doc && id) {
          // var elDoc = parent.document
            // .getElementById('object-' + doc).contentWindow.document;
          var selection = elDoc.getSelection();
          // el = elDoc.getElementById(id);
          el = newEl;
          el.setAttribute('contenteditable', true);
          if (state === 'bold') {
            el.ownerDocument.execCommand('bold');
          } else if (state === 'italic') {
            el.ownerDocument.execCommand('italic');
          } else if (state === 'underline') {
            el.ownerDocument.execCommand('underline');
          } else if (state === 'no-format') {
            el.ownerDocument.execCommand('removeFormat');
          } else if (state === 'verdana') {
            el.ownerDocument.execCommand('fontName', false, 'verdana');
          } else if (state === 'georgia') {
            el.ownerDocument.execCommand('fontName', false, 'georgia');
          }
          el.setAttribute('contenteditable', false);
          // setVariable('tmp', '');
          newEl = null;
          elDoc = null;
          return;
        // }
      }
    } else {
      newEl = el;
      elDoc = el.ownerDocument;
      // setVariable('tmp', el.ownerDocument.body.id + ' ' + el.id);
    }
  };

  instrumentCode();
};

var drawCode = function() {
  window.path = null;
  window.points = [];
  var basePosition = {top: 0, left: 0};
  var strokeWidth = 3;
  function midPointBtw(p1, p2) {
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
  }
  var points = [];
  var pathId = '';
  function generatePath(points) {
    var newPoints = [];
    newPoints.push(points[0]);

    for (var j = 1; j < points.length - 1; j++) {
      var p1  = points[j - 1];
      var p = points[j];
      var p2 = points[j + 1];
      var c = {x: p2.x - p1.x, y: p2.y - p1.y};
      var n = {x: -c.y, y: c.x};
      var len = Math.sqrt(n.x * n.x + n.y * n.y);
      if (len === 0) {
        continue;
      }
      var u = {x: n.x / len, y: n.y / len};

      newPoints.push({
        x: p.x + u.x * p.force * strokeWidth,
        y: p.y + u.y * p.force * strokeWidth
      });
    }
    newPoints.push(points[points.length - 1]);

    for (var j = points.length - 2; j > 0; j--) {
      var p1  = points[j + 1];
      var p = points[j];
      var p2 = points[j - 1];
      var c = {x: p2.x - p1.x, y: p2.y - p1.y};
      var n = {x: -c.y, y: c.x};
      var len = Math.sqrt(n.x * n.x + n.y * n.y);
      if (len == 0) {
        continue;
      }
      var u = {x: n.x / len, y: n.y / len};

      newPoints.push({
        x: p.x + u.x * p.force * strokeWidth,
        y: p.y + u.y * p.force * strokeWidth
      });
    }
    var p1 = newPoints[0];
    var p2 = newPoints[1];
    var pathString = 'M' + p1.x + ' ' + p2.y;
    for (var j = 1; j < newPoints.length; j++) {
      var midPoint = midPointBtw(p1, p2);
      if (isNaN(p1.x) || isNaN(p1.y) ||
        isNaN(midPoint.x) || isNaN(midPoint.y)) {
        console.log('NaN');
      }
      pathString = pathString +=
        ' Q ' + p1.x + ' ' + p1.y + ' ' + midPoint.x + ' ' + midPoint.y;
      p1 = newPoints[j];
      p2 = newPoints[j + 1];
    }

    return pathString;
  }
  window.touchstart = function(el, doc, pos, style) {
    if (isEmpty(pos)) {
      return;
    }

    var ns = 'http://www.w3.org/2000/svg';
    var svg = $(el).find('svg');
    if (!svg.length) {
      svg = doc.querySelector('svg');
      if (!svg) {
        svg = doc.createElementNS(ns, 'svg');
        svg.setAttribute('xmlns', ns);
        svg.style.overflow = 'visible';
        svg.style.width = '1px';
        svg.style.height = '1px';
        svg.style.position = 'absolute';
        doc.body.appendChild(svg);
      }
    } else {
      svg = svg[0];
      // basePosition = $(svg).offset();
    }

    var path = doc.createElementNS(ns, 'path');
    // console.log(basePosition);
    // console.log(pos);
    var x = pos.x ;
    var y = pos.y ;
    if (x === undefined) {
      debugger;
    }
    var point = {x: x, y: y, force: 1};
    points = [point];
    pathId = 'path-' + randomTimeString();
    var convertProperties = {
      'width': 'stroke-width',
      'background-color': 'stroke',
    };

    path.setAttribute('d', generatePath(points));
    if (!style) {
      var i = 0;
      var sample = $('#sample')[0];
      while (sample.style[i]) {
        var property = sample.style[i];
        path.setAttribute(
          convertProperties[property] || property,
          getComputedStyle(sample).getPropertyValue(property)
        );
        i++;
      }
    } else {
      $.each(style, function(prop, value) {
        path.setAttribute(prop, value);
      });
    }
    path.setAttribute('id', pathId);

    svg.appendChild(path);
    // setVariable('tmp', {pathId: pathId, points: points});
  };
  window.touchmove = function(el, doc, pos) {
    // var tmp = getVariable('tmp');
    // var pathId = pathId;
    var path = doc.getElementById(pathId);
    // var points = points;
    // console.log(basePosition);
    var point = {
      x: pos.x - basePosition.left,
      y: pos.y - basePosition.top,
      force: 1
    };
    points.push(point);
    var pathString = path.getAttribute('d');
    path.setAttribute('d', generatePath(points));
    // setVariable('tmp', {pathId: pathId, points: points});
  };
  // POS SHOULD BE AN OBJECT????
  window.actOnElement = function(el, pos, state, style) {
    if (!pos) {
      basePosition = {top: 0, left: 0};
      points = [];
      pathId = '';
    }
    if (!el) {
      // console.log('not el');
      return;
    }

    var doc = el.ownerDocument;
    if (!state) {
      state = getVariable('active');
    }
    if (state === 'stop') {
      basePosition = {top: 0, left: 0};
      points = [];
      pathId = '';
      return;
    }
    if (pathId === '') {
      touchstart(el, doc, pos, style);
    } else {
      touchmove(el, doc, pos);
    }
  };

  window.turnOn = function(doc) {
    defaultOnMove(doc, false);
  };

  window.turnOff = function(doc) {
    defaultOnMove(doc, true);
  };

  instrumentCode();
};

var openerCode = function() {
  var instrumentNames = new Set([
    'resizer',
    'mover',
    'draw',
    'clipboard',
    'shapes',
    'textStyler',
    'textInserter',
    'opener',
    'search',
    'colorPicker',
    'highlighter'
  ]);

  var reservedDocuments = new Set([
    'frontpage',
    'editorBase',
    'newObject',
    'new_instrument',
    'sessionBase',
    'objectBase',
    'textObjectCreator',
    'start',
    'instrument_editor',
    'newDocument'
  ]);

  var objectNames = new Set();

  if (!isInEditor(parent)) {
    $('.shortcuts').remove();
    $.ajax('/api/names').done(function(response) {
      var shortcuts = document.createElement('div');
      shortcuts.setAttribute('class', 'row shortcuts');
      document.body.appendChild(shortcuts);

      var instrumentShortcuts = document.createElement('div');
      instrumentShortcuts.setAttribute('class', 'col s6');
      instrumentShortcuts.setAttribute('id', 'instrument-shortcuts');
      shortcuts.appendChild(instrumentShortcuts);

      var instrumentTitle = document.createElement('h5');
      instrumentTitle.innerText = 'Instruments:';
      instrumentShortcuts.appendChild(instrumentTitle);

      instrumentNames.forEach(function(name) {
        var instrumentNode = document.createElement('div');
        instrumentNode.setAttribute('id', name);
        instrumentNode.setAttribute('class', 'name');
        instrumentNode.innerText = name;
        instrumentShortcuts.appendChild(instrumentNode);
        if (document.body.id === 'new') {
          $(instrumentNode).on('click tap', function() {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          });
        } else if (document.body.id === 'opener') {
          $(instrumentNode).on('click tap', function() {
            openObjectByName($(this).attr('id'));
          });
        }
      });

      var otherShortcuts = document.createElement('div');
      otherShortcuts.setAttribute('class', 'col s6');
      otherShortcuts.setAttribute('id', 'instrument-shortcuts');
      shortcuts.appendChild(otherShortcuts);

      var othersTitle = document.createElement('h5');
      othersTitle.innerText = 'Documents:';
      otherShortcuts.setAttribute('id', 'other-shortcuts');
      otherShortcuts.appendChild(othersTitle);

      objectNames = new Set(response.ids);

      response.ids.forEach(function(id) {
        if (instrumentNames.has(id) || reservedDocuments.has(id)) {
          return;
        }

        var node = document.createElement('div');
        node.setAttribute('id', id);
        node.setAttribute('class', 'name');
        node.innerText = id;

        if (document.body.id === 'new') {
          $(node).on('click tap', function() {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          });
        } else if (document.body.id === 'opener') {
          $(node).on('click tap', function() {
            openObjectByName($(this).attr('id'));
          });
        }
        otherShortcuts.appendChild(node);
      });
    });
  }

  var openObjectByName = function(text, basedOn) {
    if (parent.document !== document) {
      if (!isInEditor(this)) {
        $(parent).bind('beforeunload', function(e) {
          $(parent.document.body).find('.opener-iframe').remove();
        });

        parent.location.href = '/' + text;
        return;
      }
      var params = getParams(parent.location.search);
      var name = normalizeName(text);
      if (params.active && params.active.indexOf(name) === -1) {
        if (!Array.isArray(params.active)) {
          params.active = [params.active];
        }
        params.active.push('object-' + name);
      }
      parent.history.pushState(
        '',
        'Webstrates',
        parent.location.origin + parent.location.pathname + stringFromParams(params)
      );
      if ($(parent.document.body).find('[object=object-' + normalizeName(text) + ']').length) {
        parent.document.styleSheets[0].insertRule(
          '.editor-container[object=object-' + name + '] {display: block !important;}', 0
        );
        return;
      }
      // setVariable('tmp', text);
      var elContainer = parent.document.createElement('div');
      elContainer.setAttribute('class', 'editor-container');
      elContainer.setAttribute('object', 'object-' + normalizeName(text));

      var iframe = parent.document.createElement('iframe');
      if (objectNames.has(text)) {
        iframe.setAttribute('src', normalizeName(text));
      } else {
        if (basedOn) {
          iframe.setAttribute(
            'src',
            'new?prototype=' + basedOn + '&id=' + text
          );
          $(document.body).append(iframe);
        } else {
          iframe = createObjectById(text);
        }
      }
      iframe.setAttribute('id', 'object-' + normalizeName(text));
      iframe.style.width = '200px';
      // iframe.style.display = 'none';
      $(elContainer).prepend(iframe);

      var shortcut = parent.document.createElement('div');
      shortcut.setAttribute('class', 'shortcut');
      shortcut.setAttribute('object', 'object-' + normalizeName(text));
      $(shortcut).text(normalizeName(text));
      $(elContainer).prepend(shortcut);

      $(parent.document.body).prepend(elContainer);

      $(iframe).on('transcluded', function(e) {
        var iFrameDoc = $(this.contentDocument);
        if (!iFrameDoc.find('#info').length) {
          var objectHelpers = $(document)
            .find('#info')[0]
            .cloneNode(true);
          iFrameDoc[0].body.appendChild(objectHelpers);
        }
        iFrameDoc[0].body.setAttribute('id', normalizeName(text));
        parent.window.editorCode(this);
      });
    }
  };
  // getObjectNames();
  // $('.update').on('click', function(e) {
  //   getObjectNames();
  // });

  var editorClicking = function() {
    $('#editors').find('div').each(function(el) {
      $(this).on('click', function() {
        if (parent.document !== document) {
          parent.location.href = $(this).text();
        } else {
          window.location.href = $(this).text();
        }
      });
    });
  };

  var normalizeName = function(text) {
    return text.replace('.txt', '').replace('.', '-');
  };

  editorClicking();
  $('#open').on('click', function() {
    var basedOnElements = $('.name.selected');
    var basedOn;
    if (basedOnElements.length) {
      basedOn = $(basedOnElements[0]).text();
    }
    openObjectByName($('#name').text(), basedOn);
  });
  window.actOnElement = function(el, pos) {
    if (!el || isInDocument(el, document)) {
      return;
    }
  };

  instrumentCode();
};

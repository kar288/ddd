/*jshint esversion: 6 */

var instrumentCode = function(extraFunction) {
  objectCodeInternal();

  $('#innerText').on(touch ? 'tap' : 'click', function(e) {
    var menu = $('#menu');
    if (menu.hasClass('active')) {
      $('#stop').trigger(touch ? 'tap' : 'click');
      menu.find('#innerText').text('activate');
      log('activate', document.body.id);
    } else {
      $('#start').trigger(touch ? 'tap' : 'click');
      menu.find('#innerText').text('deactivate');
      log('deactivate', document.body.id);
    }
  });

  $('.expander-other-instruments').on(touch ? 'tap' : 'click', function(e) {
    $('.other-instruments').toggleClass('hidden');
  });

  $('.other-instruments').find('div').on(touch ? 'tap' : 'click', function(e) {
    var name = $(this).text();
    var parts = location.pathname.split('-');
    parts[0] = name;
    name = parts.join('-');

    if (parent.document !== document) {
      $('.other-instruments').toggleClass('hidden');
      $(window.frameElement).attr('src', name);
    } else {
      $('.other-instruments').toggleClass('hidden');
      location.href = '/' + name;
    }
  });

  $('.sub-instrument').on(touch ? 'tap' : 'click', function(e) {
    var active = this.id;
    setVariable('active', active);
    log(
      'sub-instrument',
      active,
      this.ownerDocument.body.id,
      $(this.ownerDocument).find('#menu').hasClass('active')
    );
  });

  $('#opener-button').on(touch ? 'tap' : 'click', function() {
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

var colorPickerCode = function() {
  var newEl = null;
  var elDoc = null;
  window.actOnElement = function(el, pos) {

    var color = $('.selected').css('background-color');
    if (color === 'stop' || color === 'active') {
      return;
    }
    if (!el || isInDocument(el, document)) {
      if (elDoc) {
        var selection = elDoc.getSelection();
        el = newEl;
        if (selection.type === 'Range') {
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
  var state = null;
  var selection = null;
  window.actOnElement = function(el, pos) {
    if (!el && newEl) {
      el = newEl;
      newEl = null;

      state = $('.selected').attr('id');
      if (!state || state === 'stop' || state === 'active') {
        return;
      }

      var doc = el.ownerDocument;
      selection = doc.getSelection();
      if (selection.type === 'Range' && selection.baseNode.nodeType === 3) {
        el.setAttribute('contenteditable', true);
        el.ownerDocument.execCommand('styleWithCSS', true, null);
        if (state === 'more-diagonal') {
          el.ownerDocument.execCommand('fontSize', false, 4);
        } else if (state === 'less-diagonal') {
          el.ownerDocument.execCommand('fontSize', false, 2);
        }
        el.setAttribute('contenteditable', false);
        return;
      }

      return;
    }
    if (el) {
      state = $('.selected').attr('id');
      selection = el.ownerDocument.getSelection();
      if (selection &&
        selection.baseNode &&
        selection.baseNode.nodeType == Node.TEXT_NODE &&
        selection.type === 'Range'
      ) {
        // console.log('TEXT');
        newEl = el;
      } else {
        // console.log('not text');
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
      }
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
    var properties = [
      {'html': 'background-color', 'svg': 'stroke'},
      {'html': 'background-color', 'svg': 'fill'},
      {'html': 'width', 'svg': 'stroke-width'}
    ];
    var convertProperties = {
      'width': 'stroke-width',
      'background-color': 'stroke',
    };

    path.setAttribute('d', generatePath(points));
    if (!style) {
      var i = 0;
      var sample = $('#sample')[0];
      properties.forEach(function(prop, i) {
        var style = sample.style;
          console.log(prop.svg, style[prop.html]);
        var val = style[prop.html];
        if (prop.html === 'width') {
          // val = parseInt(val) / 2 + 'px';
        }
        path.setAttribute(prop.svg, val);
      });
      // console.log(sample.style[properties[0].html]);
      // console.log(sample.style[properties[2].html]);
      // while (sample.style[i]) {
      //   var property = sample.style[i];
      //   path.setAttribute(
      //     convertProperties[property] || property,
      //     getComputedStyle(sample).getPropertyValue(property)
      //   );
      //   i++;
      // }
    } else {
      $.each(style, function(prop, value) {
        console.log(prop, value);
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

    if ($(el).is('path')) {
      var tmp = $(el).closest('.shape')[0];
      if (tmp === undefined) {
        tmp = $('#content')[0];
      }
      el = tmp;
    }

    var doc = el.ownerDocument;

    // console.log(el, doc);
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

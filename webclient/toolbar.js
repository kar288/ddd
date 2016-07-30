var settings = {
  'color': '#000000',
  'size': false
};

var mode = null;
var selected = null;

var isDownElement = null;
var isDown = false;
var isPinching = false;

var start = {};

var shape = null;
var firstPos = null;

var startDimensions = {'width': null, 'height': null};

var pressButtons = function(tmpSettings) {
  Object.keys(tmpSettings).forEach(function(setting) {
    if (setting === 'color') {
      $('#colorPicker').css('color', tmpSettings[setting]);
      return;
    }
    if (setting === 'size') {
      $('#textSizer').find('.setting').removeClass('pressed');
      $('#' + tmpSettings[setting]).addClass('pressed');
      return;
    }
    $('#' + setting).toggleClass('pressed', tmpSettings[setting]);
  });
};

var toolDrawShape = function(e, mode, pos, el) {
  // var pos = {};
  // var el = null;
  // if (e) {
  //   // pos = getPos(e, selected ? selected : $('.content')[0]);
  //   el = e.target;
  // }
  var result = drawShape(
    el,
    pos,
    mode,
    {'background-color': settings.color},
    shape,
    firstPos
  );
  shape = result.shape;
  firstPos = result.firstPos;
  return shape;
};

var toolbarGetPos = function(e) {
  var parent = $('.content')[0];
  if (isDownElement) {
    // console.log(isDownElement);
    return getPos(e, isDownElement);
  } else {
    // console.log('NO IS DOWN ELEMENT');
  }
  return getPos(e, parent);
};

var selectObject = function(object) {
  // $('svg').css('display', 'block');
  if (!object) {
    $('.shape').css('opacity', 1);
    $('path').css('opacity', 1);
    $('span').css('opacity', 1);
    $('img').css('opacity', 1);
    selected = null;
    log('selected', selected ? selected.id : null);
    return;
  }

  if (!$(object).parents('.content').length) {
    return;
  }

  var closestShape = $(object).closest('.shape');
  if (closestShape) {
    closestShape = closestShape[0];
  }
  if ($(object).hasClass('shape')) {
    closestShape = object;
  }

  $('path').css('opacity', 0.3);
  $('.shape').css('opacity', 0.3);
  $('span').css('opacity', 0.3);
  $('img').css('opacity', 0.3);
  if ($(object).is('path') ) {
    $(object).css('opacity', 1);
    selected = object;
    log('selected', selected ? selected.id : null);
  }

  if (closestShape) {
    // if ($(closestShape).find('img').length === 0 && closestShape === selected) {
      // $(closestShape).find('svg').css('display', 'none');
    // }

    $(closestShape).css('opacity', 1);

    if ($(object).is('img')) {
      $(object).css('opacity', 1);
      selected = closestShape;
      log('selected', selected ? selected.id : null);
    }

    if ($(object).is('div') || $(object).is('span')) {
      $(closestShape).find('span').css('opacity', 1);
      selected = closestShape;
      log('selected', selected ? selected.id : null);
    }
  }
};

var toolbarInit = function() {
  $(window).bind('beforeunload', function(e) {
    log();
  });

  preventContextMenu();
  drawCode();
  selectObject();
  // init settings
  settings.color = $('#colorPicker').css('color');
  settings.size = $('#size').text();
  $('#colorPicker').on('tap', function(e) {
    $('#colorPicker').find('#sub-instrument-container').toggleClass('hidden');
  });
  $('#colorPicker').find('.sub-instrument').on('tap', function() {
    var color = $(this).css('background-color');
    $('#colorPicker').css('color', color);
    settings.color = color;

    if (selected) {
      $(selected).css('background-color', color);
      $(selected).attr('stroke', color);
      $(selected).attr('fill', color);
      log('changed color', selected.id, color);
    } else {
      log('changed color', color);
    }
  });

  $('#clear').on(touch ? 'tap' : 'click', function() {
    selectObject();
    $('.action').removeClass('selected');
    mode = null;
    log('mode', mode);
  });

  //init mode
  var selectedMode = $('.selected');
  if (selectedMode.length) {
    mode = selectedMode[0].id;
    log('mode', mode);
  }

  // event listeners
  $('.action').on(touch ? 'tap' : 'click', function(e) {
    selectObject();
    if ($(this).hasClass('selected')) {
      $('.action').removeClass('selected');
      mode = null;
      log('mode', mode);
      return;
    }
    $('.action').removeClass('selected');
    $(this).toggleClass('selected');
    mode = this.id;
    log('mode', mode);
  });
  $('#delete').on('tap', function() {
    if (selected) {
      $(this).toggleClass('selected');
      cutCode(selected, null);
      $(this).toggleClass('selected');
      log('deleted', selected ? selected.id : null);
    }
  });
  $('#copy').on('tap', function() {
    if (selected) {
      $(this).toggleClass('selected');
      copyCode(selected, null);
      $(this).toggleClass('selected');
      log('copied', selected ? selected.id : null);
    }
    selectObject();
  });
  $('#paste').on('tap', function() {
    $(this).toggleClass('selected');
    if (selected) {
      pasteCode(selected, null);
    } else {
      if ($(selected).is('path')) {
        pasteCode($('svg')[0], null);
      } else {
        pasteCode($('.content')[0], null);
      }
    }
    $(this).toggleClass('selected');
    log('pasted', selected ? selected.id : null);
  });
  $('#cut').on('tap', function() {
    if (selected) {
      $(this).toggleClass('selected');
      cutCode(selected, null);
      $(this).toggleClass('selected');
      log('cut', selected ? selected.id : null);
    }
    selectObject();
  });
  $('.setting').on(touch ? 'tap' : 'click', function() {
    if (this.parentElement.id === 'textSizer') {
      var size = parseInt($('#size').text());
      if (this.id === 'more') {
        size += 1;
      } else {
        size -= 1;
      }
      if (size < 3 || size > 50) {
        return;
      }
      $('#size').text(size + 'px');
      settings.size  = size;
      if (selected) {
        if ($(selected).is('path')) {
          $(selected).attr('stroke-width', size);
          log('changed width', selected.id, size);
        }
      }
      return;
    }
    if (this.parentElement.id === 'colorPicker') {
      return;
    }
  });

/*******************************************************************************
                                MOUSEDOWN
*******************************************************************************/
var start = function(e) {
  var isContentElement = $(e.target).hasClass('content');
  if (!$(e.target).parents('.content').length && !isContentElement) {
    return;
  }

  var closestShape = $(e.target).closest('.shape');
  if (closestShape.length) {
    closestShape = closestShape[0];
  } else {
    closestShape = $('.content')[0];
  }

  if (!isPinching && selected) {
    if (closestShape.length) {
      closestShape = closestShape[0];
    } else {
      closestShape = $('.content')[0];
    }
    if ($(e.target).is('img')) {
      closestShape = $('.content')[0];
    }
    if (!isDownElement || !mode) {
      isDownElement = closestShape;
    }
    isDown = true;
  }

  if (mode === 'square' || mode === 'circle') {
    // toolDrawShape(e, mode);
    isDown = true;
    isDownElement = closestShape;
    return;
  }

  if (mode === 'draw') {
    isDown = true;
    isDownElement = closestShape;
    var width = settings.size;

    var pos = toolbarGetPos(e);
    // console.log(closestShape);
    log('draw', closestShape.id, pos);
    actOnElement(closestShape, pos, 'active', {
      'stroke-width': width + 'px',
      'stroke': settings.color,
      'fill': settings.color
    });
    return;
  }

  if (isContentElement) {
    selectObject(null);
    return;
  }

  selectObject(e.target);
};

if (!touch) {
  $(document).on('mousedown', start);
} else {
  $(document).on('touchstart', start);
}

/*******************************************************************************
                                MOUSEMOVE
*******************************************************************************/
var move = function(e) {
  // var isContentElement = $(e.target).hasClass('content');
  // if (!$(e.target).parents('.content').length && !isContentElement) {
  //   return;
  // }

  var pos = toolbarGetPos(e);
  var target = e.target;
  if ($(target).is('img')) {
    target = target.parentElement;
  }
  if (isDown && (mode === 'square' || mode === 'circle')) {
    var shape = toolDrawShape(e, mode, pos, target);
    selectObject(shape);
    return;
  }

  if (isDown && mode === 'draw') {
    actOnElement(target, pos, 'active', {});
    log('draw', target.id, pos);
    return;
  }

  if (isDown && !isPinching) {
    // console.log(selected);
    start = moverCodeInternal(selected, pos, start, '');
  }
};

if (!touch) {
  $(document).on('mousemove', move);
} else {
  $(document).on('touchmove', move);
}


/*******************************************************************************
                                MOUSEUP
*******************************************************************************/

var endFunction = function(e) {
  e.preventDefault();

  if ($(e.target).parents('#colorPicker').length === 0) {
    $('#colorPicker').find('#sub-instrument-container').addClass('hidden');
  }

  var tmpSettings = {};
  if ($(e.target).is('path')) {
    tmpSettings.color = $(e.target).attr('stroke');
    var strokeWidth = parseInt($(e.target).css('stroke-width'));
    if (strokeWidth <= 3 ) {
      tmpSettings.size = 'small';
    } else if (strokeWidth >= 27) {
      tmpSettings.size = 'large';
    } else {
      tmpSettings.size = 'medium';
    }
  }

  if ($(e.target).hasClass('content')) {
    pressButtons(settings);
  } else {
    pressButtons(tmpSettings);
  }

  if (isPinching) {
    isPinching = false;
    startDimensions = {'width': null, 'height': null};
  }

  if (mode === 'draw') {
    isDown = false;
    isDownElement = null;
    actOnElement(null, null, 'stop', {});
    return;
  }

  if (mode === 'square' || mode === 'circle') {
    toolDrawShape(null, mode);
    isDown = false;
    isDownElement = null;
    shape = selected;
    if (selected) {
      $('.selected').removeClass('selected');
      mode = null;
    }

    selectObject(shape);
    return;
  }

  if (isDown) {
    isDown = false;
    isDownElement = null;
    start = moverCodeInternal(null, {}, start, 'active', $('.container'));
    return;
  }
};

if (!touch) {
  $(document).on('mouseup', endFunction);
} else {
  $(document).on('touchend', endFunction);
}



/*******************************************************************************
                                  HAMMER
*******************************************************************************/
  var hammertime = new Hammer(
    document, { touchAction: 'auto', cssProps: { userSelect: true } }
  );
  var dimensionConversion = {
    'height': 'top',
    'width': 'left'
  };
  hammertime.get('pinch').set({enable: true});
  if (location.pathname.indexOf('toolbar')) {
    hammertime.on('pan swipe rotate pinch touchstart doubletouchstart press', function(e) {
      e.preventDefault();
      $('#event').text(e.type);
      if (e.type === 'pinch') {
        isPinching = true;
        if ($(selected).hasClass('shape')) {
          Object.keys(startDimensions).forEach(function(dimension) {
            var direction = e.scale > 1 ? 2 : -2;
            var dimensionVal = parseInt($(selected).css(dimension));
            var newVal = Math.max(dimensionVal + direction, 50);
            var offset =
              parseInt($(selected).css(dimensionConversion[dimension]));
            console.log('changing', dimensionConversion[dimension], $(selected).css(dimensionConversion[dimension]), offset + (direction / 2) + 'px');
            $(selected).css(
              dimensionConversion[dimension],
              offset - (direction / 2) + 'px'
            );
            $(selected).css(dimension, newVal + 'px');

            log('changed size', dimension, selected.id, newVal);
          });
        }
      } else if (e.type === 'press') {

      }
    });
  }
};

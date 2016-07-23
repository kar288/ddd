var settings = {
  'underline': false,
  'italic': false,
  'bold': false,
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

var setStyling = function() {
  // document.execCommand('styleWithCSS', true, null);
  // document.execCommand('foreColor', false, settings.color);
  // if (settings.bold) {
  //   document.execCommand('bold');
  // }
  // if (settings.italic) {
  //   document.execCommand('italic');
  // }
  // if (settings.underline) {
  //   document.execCommand('underline');
  // }
  // debugger;
  document.execCommand('styleWithCSS', true, null);
  // document.execCommand('removeFormat');
  document.execCommand('foreColor', false, $('#colorPicker').css('color'));
  if ($('#bold').hasClass('pressed')) {
    document.execCommand('bold');
  }
  if ($('#italic').hasClass('pressed')) {
    document.execCommand('italic');
  }
  if ($('#underline').hasClass('pressed')) {
    document.execCommand('underline');
  }
};

var selectObject = function(object) {
  if ($(object).attr('contenteditable') === 'true') {
    return;
  }
  $('.shape').attr('contenteditable', false);
  $('svg').css('display', 'block');
  if (!object) {
    $('.shape').css('opacity', 1);
    $('path').css('opacity', 1);
    $('span').css('opacity', 1);
    $('img').css('opacity', 1);
    selected = null;
    log('selected', selected ? selected.id : null);
    getSelection().removeAllRanges();
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
    if ($(closestShape).find('img').length === 0 && closestShape === selected) {
      $(closestShape).find('svg').css('display', 'none');

      //set selection?
      if (closestShape.innerText === '') {
        console.log("CHANGING RANGE");
        var range = rangy.createRange();
        range.selectNodeContents(selected);
        var sel = rangy.getSelection();
        sel.setSingleRange(range);
      }
      // console.log(document.getSelection(), settings);
      $(closestShape).attr('contenteditable', true);
      // setStyling();
    }

    $(closestShape).css('opacity', 1);

    if ($(object).is('img')) {
    // debugger;
      $(object).css('opacity', 1);
      selected = closestShape;
      // log('selected', selected ? selected.id : null);
    }

    if ($(object).is('div') || $(object).is('span')) {
      $(closestShape).find('span').css('opacity', 1);
      selected = closestShape;
      log('selected', selected ? selected.id : null);
    }
  }
};

var toolbarInit = function() {
  drawCode();
  selectObject();
  // init settings
  settings.color = $('#colorPicker').css('color');
  $('#textStyler').find('.setting').each(function(i, el) {
    settings[this.id] = $(this).hasClass('pressed');
  });
  settings.size = 'small';
  if ($('medium').hasClass('pressed')) {
    settings.size = 'medium';
  } else if ($('medium').hasClass('pressed')) {
    settings.size = 'large';
  }
  $('#colorPicker').on('tap', function(e) {
    $('#colorPicker').find('#sub-instrument-container').toggleClass('hidden');
  });
  $('#colorPicker').find('.sub-instrument').on('tap', function() {
    var color = this.id;
    $('#colorPicker').css('color', color);
    settings.color = color;

    document.execCommand('styleWithCSS', true, null);
    document.execCommand('foreColor', false, color);
    if (selected) {
      if (getSelection().type === 'Range' || $(selected).attr('contenteditable') === 'true') {
        document.execCommand('styleWithCSS', true, null);
        document.execCommand('foreColor', false, color);
        log('changed color', 'selection', color);
      } else {
        $(selected).css('background-color', color);
        $(selected).attr('stroke', color);
        $(selected).attr('fill', color);
        log('changed color', selected.id, color);
      }
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
  $('.action').on('tap', function(e) {
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
      $(selected).remove();
      selectObject();
      log('deleted', selected ? selected.id : null);
    }
  });
  $('#copy').on('tap', function() {
    if (selected) {
      copyCode(selected, null);
      log('copied', selected ? selected.id : null);
    }
    selectObject();
  });
  $('#paste').on('tap', function() {
    if (selected) {
      pasteCode(selected, null);
    } else {
      if ($(selected).is('path')) {
        pasteCode($('svg')[0], null);
      } else {
        pasteCode($('.content')[0], null);
      }
    }
    log('pasted', selected ? selected.id : null);
  });
  $('#cut').on('tap', function() {
    if (selected) {
      cutCode(selected, null);
      log('cut', selected ? selected.id : null);
    }
    selectObject();
  });
  $('.setting').on('tap', function() {
    if (this.parentElement.id === 'textSizer') {
      $('#textSizer').find('.setting').removeClass('pressed');
      $(this).addClass('pressed');
      settings.size  = this.id;
      var size = 2;
      var width = 3;
      if (this.id === 'medium') {
        size = 4;
        width = 9;
      } else if (this.id === 'large') {
        size = 6;
        width = 27;
      }
      if (selected) {
        if ($(selected).is('div')) {
          selected.setAttribute('contenteditable', true);
          document.execCommand('styleWithCSS', true, null);
          document.execCommand('fontsize', false, size);
          selected.setAttribute('contenteditable', false);
          selected.focus();
          log('changed size', 'selection', size);
        } else if ($(selected).is('path')) {
          $(selected).attr('stroke-width', width);
          log('changed width', selected.id, width);
        }
      }
      return;
    }
    if (this.parentElement.id === 'colorPicker') {
      return;
    }
    if (this.id === 'format-clear') {
      if (document.getSelection().type === 'Range') {
        // selected.setAttribute('contenteditable', true);
        document.execCommand('removeFormat');
        // selected.setAttribute('contenteditable', false);
        log('changed style', 'selection', 'format-clear');
      }
      $('.setting').removeClass('pressed');
      settings.underline = false;
      settings.italic = false;
      settings.bold = false;
      return;
    }
    var state = this.id;
    $(this).toggleClass('pressed');
    settings[this.id] = $(this).hasClass('pressed');

    // if (document.getSelection().type === 'Range') {
      // selected.setAttribute('contenteditable', true);
      document.execCommand('styleWithCSS', true, null);
      if (state === 'bold') {
        document.execCommand('bold');
      } else if (state === 'italic') {
        document.execCommand('italic');
      } else if (state === 'underline') {
        document.execCommand('underline');
      } else if (state === 'no-format') {
        document.execCommand('removeFormat');
      }
      // selected.setAttribute('contenteditable', false);
      // setStyling();
      log('changed style', 'selection', state);
    // }
    $('#format-clear').removeClass('pressed');
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

  if (mode === 'square' || mode === 'circle') {
    // toolDrawShape(e, mode);
    isDown = true;
    isDownElement = closestShape;
    return;
  }

  if (mode === 'draw') {
    isDown = true;
    isDownElement = closestShape;
    var width = 3;
    if (settings.size === 'medium') {
      width = 9;
    } else if (settings.size === 'large') {
      width = 27;
    }

    var pos = toolbarGetPos(e);
    // console.log(closestShape);
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
    toolDrawShape(e, mode, pos, target);
    return;
  }

  if (isDown && mode === 'draw') {
    actOnElement(target, pos, 'active', {});
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
  // console.log(e.target);
  var tmpSettings = {};
  // if ($(e.target).parents('.shape').length) {
    var selection = getSelection();
    if (selected && selected.innerText === '') {
      setStyling();
    }
    if (selection.rangeCount && selected && selected.innerText !== '') {
      // debugger;
      var end = selection.getRangeAt(0).endContainer;
      if (end.nodeType === Node.TEXT_NODE) {
        end = $(end).closest('span');
      }
      if ($(end).css('font-weight')) {
        tmpSettings.bold = $(end).css('font-weight') === 'bold';
      }
      if ($(end).css('font-style')) {
        tmpSettings.italic = $(end).css('font-style') === 'italic';
      }
      if ($(end).css('text-decoration')) {
        tmpSettings.underline = $(end).css('text-decoration') === 'underline';
      }
      var color = $(end).css('color') || 'black';
      if (color) {
        tmpSettings.color = color;
      }
      var fontSize = parseInt($(end).css('font-size'));
      if (fontSize <= 14 ) {
        tmpSettings.size = 'small';
      } else if (fontSize >= 32) {
        tmpSettings.size = 'large';
      } else {
        tmpSettings.size = 'medium';
      }
    }
  if ($(e.target).is('path')) {
  // } else if ($(e.target).is('path')) {
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
  hammertime.get('pinch').set({enable: true});
  hammertime.on('pan swipe rotate pinch touchstart doubletouchstart press', function(e) {
    e.preventDefault();
    $('#event').text(e.type);
    if (e.type === 'pinch') {
      isPinching = true;
      if ($(selected).hasClass('shape')) {
        Object.keys(startDimensions).forEach(function(dimension) {
          if (!startDimensions[dimension]) {
            startDimensions[dimension] = parseInt($(selected).css(dimension));
          }
          var newVal = Math.max(startDimensions[dimension] * e.scale, 200);
          $(selected).css(dimension, newVal + 'px');

          log('changed size', dimension, selected.id, newVal);
        });
      }
    } else if (e.type === 'press') {
      if (!isPinching) {
        var closestShape = $(e.target).parents('.shape');
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
    }
  });
};

var settings = {
  'underline': false,
  'italic': false,
  'bold': false,
  'color': '#000000',
  'size': false
};

var mode = null;
var selected = null;

var isDown = false;
var isPinching = false;

var start = {};

var shape = null;
var firstPos = null;

var startHeight = null;
var startWidth = null;

var toolDrawShape = function(e, mode) {
  var pos = {};
  var el = null;
  if (e) {
    pos = getPos(e);
    el = e.target;
  }
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

var selectObject = function(object) {
  if (!object) {
    $('.shape').css('opacity', 1);
    $('path').css('opacity', 1);
    selected = null;
    $('.shape').attr('contenteditable', false);
    return;
  }

  $('path').css('opacity', 0.3);
  $('.shape').css('opacity', 0.3);
  $(object).css('opacity', 1);
  selected = object;
};

var shapeListener = function() {
  $('.shape').on('dblclick', function() {
    console.log('DOUBLE CLICK');
    $(this).attr('contenteditable', true);
  });
  $('.shape').on('click', function(e) {
    if (mode) {
      return;
    }
    $(this).find('svg').css('display', 'block');
    if (selected === this) {
      $(this).attr('contenteditable', true);
      $(this).find('svg').css('display', 'none');
      // debugger;
    }
    console.log('change color', settings.color);
    if (document.getSelection().type !== 'Range') {
      // debugger;
      document.execCommand('styleWithCSS', true, null);
      document.execCommand('foreColor', false, settings.color);
    }
    selectObject(this);

  });
};

var pathListener = function() {
  $('path').on('click', function(e) {
    if (mode) {
      return;
    }
    selectObject(this);
  });
};

var toolbarInit = function() {
  drawCode();
  selectObject();
  // init settings
  settings.color = $('#colorPicker').css('color');
  $('.setting').each(function(i, el) {
    settings[this.id] = $(this).hasClass('pressed');
  });
  settings.size = $('select').find(':selected').text();
  $('#colorPicker').on('click', function() {
    $('#colorPicker').find('#sub-instrument-container').toggleClass('hidden');
  });
  $('#colorPicker').find('.sub-instrument').on('click', function() {
    var color = this.id;
    $('#colorPicker').css('color', color);
    settings.color = color;
    document.execCommand('styleWithCSS', true, null);
    document.execCommand('foreColor', false, color);
    if (selected) {
      if (document.getSelection().type === 'Range' || $(selected).attr('contenteditable') === 'true') {
        document.execCommand('styleWithCSS', true, null);
        document.execCommand('foreColor', false, color);
      } else {
        $(selected).css('background-color', color);
        $(selected).attr('stroke', color);
      }
    }
  });

  //init mode
  var selectedMode = $('.selected');
  if (selectedMode.length) {
    mode = selectedMode[0].id;
  }

  // event listeners
  shapeListener();
  pathListener();
  $('.action').on('click', function() {
    selectObject();
    if ($(this).hasClass('selected')) {
      $('.action').removeClass('selected');
      mode = null;
      return;
    }
    $('.action').removeClass('selected');
    $(this).toggleClass('selected');
    mode = this.id;
  });
  $('#delete').on('click', function() {
    if (selected) {
      $(selected).remove();
      selectObject();
    }
  });
  $('#copy').on('click', function() {
    if (selected) {
      copyCode(selected, null);
    }
    selectObject();
  });
  $('#paste').on('click', function() {
    if (selected) {
      pasteCode(selected, null);
    } else {
      if ($(selected).is('path')) {
        pasteCode($('svg')[0], null);
      } else {
        pasteCode($('.content')[0], null);
      }
    }
    shapeListener();
    pathListener();
  });
  $('#cut').on('click', function() {
    if (selected) {
      cutCode(selected, null);
    }
    selectObject();
  });
  $('.setting').on('click', function() {
    if (this.parentElement.id === 'size') {
      return;
    }
    if (this.parentElement.id === 'colorPicker') {
      return;
    }
    if (this.id === 'format-clear') {
      if (document.getSelection().type === 'Range') {
        selected.setAttribute('contenteditable', true);
        document.execCommand('removeFormat');
        selected.setAttribute('contenteditable', false);
      }
      $('.setting').removeClass('pressed');
      // $(this).toggleClass('pressed');
      settings.underline = false;
      settings.italic = false;
      settings.bold = false;
      return;
    }
    var state = this.id;
    $(this).toggleClass('pressed');
    settings[this.id] = $(this).hasClass('pressed');

    if (document.getSelection().type === 'Range') {
      selected.setAttribute('contenteditable', true);
      document.execCommand('styleWithCSS', true, null);
      if (state === 'bold') {
        document.execCommand('bold');
      } else if (state === 'italic') {
        document.execCommand('italic');
      } else if (state === 'underline') {
        document.execCommand('underline');
      } else if (state === 'no-format') {
        document.execCommand('removeFormat');
      } else if (state === 'verdana') {
        el.ownerDocument.execCommand('fontName', false, 'verdana');
      } else if (state === 'georgia') {
        el.ownerDocument.execCommand('fontName', false, 'georgia');
      }
      selected.setAttribute('contenteditable', false);
    }
    $('#format-clear').removeClass('pressed');
  });
  $('select').on('change', function() {
    settings.size = $(this).find(':selected').text();
    var size = 2;
    if (settings.size === 'Medium') {
      size = 4;
    } else if (settings.size === 'Large') {
      size = 6;
    }
    if (selected) {
      selected.setAttribute('contenteditable', true);
      document.execCommand('styleWithCSS', true, null);
      document.execCommand('fontsize', false, size);
      selected.setAttribute('contenteditable', false);
      selected.focus();
    }
  });

  $(document).on('mousedown touchstart', function(e) {
    if (!$(e.target).parents('.content').length && !$(e.target).hasClass('content')) {
      return;
    }
    if (mode === 'square' || mode === 'circle') {
      toolDrawShape(e, mode);
      if (shape) {
        // shape.setAttribute('contenteditable', true);
        shapeListener();
      }
      return;
    }
    if (mode === 'draw') {
      isDown = true;
      actOnElement(e.target, getPos(e), 'active',
        {'stroke-width': '10px', 'stroke': settings.color});
      return;
    }
    if (!selected) {
      selectObject(e.target);
      return;
    }
    var closestShape = $(e.target).closest('.shape');
    if (
      !isPinching &&
      (($(selected).is('path') && selected === e.target) ||
      (closestShape && selected === closestShape[0]))
    ) {
      isDown = true;
      // defaultOnMove(document, false);
      // $('.shape').attr('contenteditable', true);
      // start = moverCodeInternal(
      //   selected, getPos(e), start, 'active', $('.content')
      // );
    }
  });

  $(document).on('mousemove touchmove', function(e) {
    var closestShape = $(e.target).closest('.shape');
    if (
      $(selected).attr('contenteditable') !== 'true' &&
      isDown &&
      !isPinching
    ) {
      start = moverCodeInternal(
        selected, getPos(e), start, 'active', $('.content')
      );
    }
    if (!$(e.target).parents('.content').length && !$(e.target).hasClass('content')) {
      return;
    }
    if (firstPos && (mode === 'square' || mode === 'circle')) {
      toolDrawShape(e, mode);
      return;
    }
    if (isDown === true && mode === 'draw') {
      actOnElement(e.target, getPos(e), 'active',
        {'stroke-width': '10px', 'stroke': settings.color});
    }
  });

  $(document).on('mouseup touchend', function(e) {
    if ($(e.target).parents('.content').length && $(e.target).parents('.shape').length) {
      var range = getSelection().getRangeAt(0);
      var end = range.endContainer;
      if (end.nodeType === Node.TEXT_NODE) {
        end = $(end).closest('span');
      }
      console.log(end);
      // console.log($(start).css('font-weight'));
      // console.log($(end).css('font-weight'));
      // console.log($(end).css('font-style'));
      // console.log($(end).css('text-decoration'));
      // console.log($(end).css('color'));
      // console.log($(end).css('font-size'));
      // debugger;
      if ($(end).css('font-weight')) {
        $('#bold').toggleClass(
          'pressed', $(end).css('font-weight') === 'bold'
        );
        settings.bold = $(end).css('font-weight') === 'bold';
      }
      if ($(end).css('font-style')) {
        $('#italic').toggleClass(
          'pressed', $(end).css('font-style') === 'italic'
        );
        settings.italic = $(end).css('font-style') === 'italic';
      }
      if ($(end).css('text-decoration')) {
        $('#underline').toggleClass(
          'pressed', $(end).css('text-decoration') === 'underline'
        );
        settings.underline = $(end).css('text-decoration') === 'underline';
      }
      var color = $(end).css('color');
      if (color) {
        $('#colorPicker').css('color', color);
        settings.color = color;
      }
      var fontSize = parseInt($(end).css('font-size'));
      console.log(fontSize);
      if (fontSize <= 14 ) {
        $('select').val('Small');
      } else if (fontSize >= 32) {
        $('select').val('Large');
      } else {
        $('select').val('Medium');
      }
    }
    var closestShape = $(e.target).closest('.shape');
    $('svg').css('display', 'block');
    if (
      !isPinching &&
      (($(selected).is('path') && selected === e.target) ||
      (closestShape && selected === closestShape[0]))
    ) {
      // isDown = true;
      // defaultOnMove(document, false);
      $('.shape').attr('contenteditable', true);
      // start = moverCodeInternal(
      //   selected, getPos(e), start, 'active', $('.content')
      // );
    }
    if (isPinching) {
      isPinching = false;
      startHeight = null;
      startWidth = null;
    }
    if (mode === 'draw') {
      isDown = false;
      actOnElement(null, null, 'stop',
        {'stroke-width': '10px', 'stroke': settings.color});
      pathListener();
      return;
    }
    if (mode === 'square' || mode === 'circle') {
      toolDrawShape(null, mode);
      return;
    }

    if (isDown && selected) {
      // console.log('moving done');
      isDown = false;
      start = moverCodeInternal(null, {}, start, 'active');
      // $('svg').css('display', 'block');
      // selectObject();
      // defaultOnMove(document, true);
      // $('.shape').attr('contenteditable', true);
      return;
    }
    if (!$(e.target).parents('.content').length && !$(e.target).hasClass('content')) {
      return;
    }

    if (selected) {
      selectObject();
    }

    // $('svg').css('display', 'block');
    // selectObject();
  });

  var hammertime = new Hammer(
    document, {
      touchAction: 'auto',
      cssProps: {
        userSelect: true
      }
    }
  );
  hammertime.get('pinch').set({
    enable: true
  });
  // hammertime.on('swipe', function(ev) {
  //   console.log('swipe');
  // });
  hammertime.on("pan swipe rotate pinch tap doubletap press", function(ev) {
    $('#event').text(ev.type);
    if (ev.type == "pinch") {
      console.log(ev.scale, $(selected).hasClass('shape'));
      isPinching = true;
      var target = $(ev.target);
      if ($(selected).hasClass('shape')) {
        if (!startHeight || !startWidth) {
          startHeight = parseInt($(selected).css('height'));
          startWidth = parseInt($(selected).css('width'));
        }
        console.log(parseInt($(selected).css('height')), $(selected).css('width'));
        var height = Math.max(startHeight * ev.scale, 20);
        var width = Math.max(startWidth * ev.scale, 20);
        $(selected).css('height', height + 'px');
        $(selected).css('width', width + 'px');
      }
    }
  });

  hammertime.on('release', function(e) {
    console.log('ON RELEASE');
  });
};

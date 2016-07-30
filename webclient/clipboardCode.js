/*jshint esversion: 6 */

var copyCode = function(newEl, selection) {
  if ($(newEl).hasClass('content')) {
    return;
  }
  var elDoc = newEl.ownerDocument;
  var historyNode = document.createElement('div');
  var copy = null;
  if (newEl) {
    log('copied', newEl.id);
    copy = newEl.cloneNode(true);
    if ($(copy).is('path')) {
      $(copy).attr('transform', 'translate(0, 0)');
    } else {
      copy.style.top = 0;
      copy.style.left = 0;
    }
    copy.id += '-';
  } else if (selection && selection.type === 'Range') {
    copy = elDoc.createElement('p');
    copySelection.textContent = newSelection.toString();
    copySelection.id = 'selection-';
  }
  historyNode.style.position = 'relative';
  historyNode.style.height = copy.style.height;
  $(historyNode).append(copy);
  $('#history').prepend(historyNode);
};

var recursiveChangeIds = function(el, id) {
  el.id += id;
  $(el).children().each(function(i, el) {
    recursiveChangeIds(this, id);
  });
};

var pasteCode = function(newEl, selection) {
  var elDoc = newEl.ownerDocument;
  var toPaste = $('#history>.selected');
  if (!toPaste.length) {
    toPaste = document.getElementById('history').children[0];
  } else {
    toPaste = toPaste[0];
  }
  toPaste = toPaste.children[0];
  if (!toPaste) {
    return;
  }
  log('pasted', toPaste.id);
  var copyToPaste = toPaste.cloneNode(true);
  recursiveChangeIds(copyToPaste, randomTimeString());
  $(copyToPaste).removeClass('selected');
  if (copyToPaste.getBBox) {
    $(elDoc.body).find('svg').append(copyToPaste);
  } else {
    newEl.appendChild(copyToPaste);
  }
};

var cutCode = function(newEl, selection) {
  if ($(newEl).hasClass('content')) {
    return;
  }
  var historyNode = document.createElement('div');
  var copy = null;
  if (newEl) {
    log('cut', newEl.id);
    copy = newEl;
    if ($(copy).is('path')) {
      $(copy).attr('transform', 'translate(0, 0)');
    } else {
      copy.style.top = 0;
      copy.style.left = 0;
    }
  } else {
    copy = document.createElement('p');
    copy.innerHTML = selection.toString();
    deleteSelection(selection.anchorNode.ownerDocument.defaultView);
  }
  historyNode.style.position = 'relative';
  historyNode.style.height = copy.style.height;
  $(historyNode).prepend(copy);
  $('#history').prepend(historyNode);
};

var deleteCode = function(newEl, selection) {
  if ($(newEl).hasClass('content')) {
    return;
  }
  var historyNode = document.createElement('div');
  var copy = null;
  if (newEl) {
    copy = newEl;
    log('deleted', newEl.id);
    if ($(copy).is('path')) {
      $(copy).attr('transform', 'translate(0, 0)');
    } else {
      copy.style.top = 0;
      copy.style.left = 0;
    }
  } else {
    copy = document.createElement('p');
    copy.innerHTML = selection.toString();
    deleteSelection(selection.anchorNode.ownerDocument.defaultView);
  }
  historyNode.style.position = 'relative';
  historyNode.style.height = copy.style.height;
  $(historyNode).prepend(copy);
  $('#history').prepend(historyNode);
};

var clipboardCode = function() {
  var functions = {
    'copy': copyCode,
    'paste': pasteCode,
    'cut': cutCode,
    'delete': deleteCode
  };
  $('#history>*').on('click tap', function() {
    $('#history>*').removeClass('selected');
    $(this).toggleClass('selected');
  });
  var doc = '';
  var id = '';
  window.actOnElement = function(el, pos) {
    if ($(el).is('body')) {
      return;
    }

    if (el) {
      var selection = el.ownerDocument.getSelection();
      if (selection && selection.type === 'Range') {
        // setVariable('tmp', el.ownerDocument.body.id);
        doc = el.ownerDocument.body.id;
      } else {
        doc = el.ownerDocument.body.id;
        id = el.id;
        // setVariable('tmp', el.ownerDocument.body.id + ' ' + el.id);
      }
      return;
    }
    // debugger;
    // var tmp = getVariable('tmp');
    // if (!tmp) {
      // return;
    // }
    if (!doc && !id) {
      return;
    }

    // var [doc, id] = tmp.split(' ');
    // setVariable('tmp', '');
    var iframe = parent.document.getElementById('object-' + doc);
    if (!iframe) {
      doc = '';
      id = '';
      return;
    }
    var elDoc = iframe.contentDocument;
    var newEl = elDoc.getElementById(id);
    var state = $('.selected').attr('id');
    if (state === 'stop' || state === 'active') {
      doc = '';
      id = '';
      return;
    }

    var newSelection = elDoc.getSelection();
    if (state && (newEl || (newSelection && newSelection.type === 'Range'))) {
      functions[state](newEl, newSelection);
    }
    doc = '';
    id = '';
    return;

    // var isBody = $(el).is('body');
    // var inEditor = false;
    // var editorContainer = null;
    // if ($(el).is('body')) {
    //   if (isInEditor(el)) {
    //     inEditor = true;
    //     editorContainer = $(parent.document.body).find(
    //       '.editor-container[object=object-' + $(el).attr('id') + ']'
    //     );
    //   }
    // }
    // var selection = el.ownerDocument.getSelection();
    // if (state === 'copy') {
    //   if (selection && selection.type === 'Range') {
    //     // var copy = document.createElement('p');
    //     // copy.innerHTML = selection.anchorNode.data;
    //     // debugger;
    //     setVariable('tmp', selection.toString());
    //   } else if (!isBody) {
    //     var copy = el.cloneNode(true);
    //     copy.id += '-';
    //     $('#history').prepend(copy);
    //   } else {
    //     var editorContainerCopy = editorContainer[0].cloneNode(true);
    //     editorContainerCopy.id += '-';
    //     $('#history').prepend(editorContainerCopy);
    //   }
    //   return;
    // } else if (state === 'cut' && !isBody) {
    //   if (selection && selection.type === 'Range') {
    //     var copy = document.createElement('p');
    //     copy.innerHTML = selection.anchorNode;
    //     $('#history').prepend(copy);
    //   } else {
    //     $('#history').prepend(el);
    //   }
    // } else if (state === 'stop') {
    //   // $('#history').html('');
    // } else if (state === 'delete') {
    //   if (isBody) {
    //     if (selection && selection.type === 'Range') {
    //       deleteSelection(el.ownerDocument.defaultView);
    //     } else if (inEditor) {
    //       editorContainer.remove();
    //     } else {
    //       return;
    //       // var win = doc.defaultView || doc.parentWindow;
    //       // win.location.href = '/start';
    //     }
    //   } else {
    //     $('#history').html(el);
    //     // $('#history').html('');
    //   }
    // } else if (state === 'paste') {
    //   if (getVariable('tmp') === 'done') {
    //     return;
    //   }
    //   setVariable('tmp', 'done');
    //   // debugger;
    //   var toPaste = $('#history>.selected');
    //   if (!toPaste.length) {
    //     toPaste = document.getElementById('history').children[0];
    //   } else {
    //     toPaste = toPaste[0];
    //   }
    //   if (!toPaste) {
    //     return;
    //   }
    //   var copyToPaste = toPaste.cloneNode(true);
    //   copyToPaste.id += 'copy-' + randomTimeString();
    //   $(copyToPaste).removeClass('selected');
    //   if (copyToPaste.getBBox) {
    //     $(el.ownerDocument.body).find('svg').append(copyToPaste);
    //   } else {
    //     el.appendChild(copyToPaste);
    //   }
    //   // $('#tmp').html('');
    // }
  };

  instrumentCode();
};

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



var searchCode = function() {
  var docId = '';
  if (isInEditor(this)) {
    $('.sub-instrument#search').on(touch ? 'tap' : 'click', function(e) {
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
    $('#stop').on(touch ? 'tap' : 'click', function(e) {
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
  $('.sub-instrument#create').on(touch ? 'tap' : 'click', function(e) {
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
  var selected = new Set();
  var newEl = null;
  window.actOnElement = function(el, pos) {
    if (!el && newEl) {
      el = newEl;
      newEl = null;

      selected.add(el.ownerDocument.body.id + ' ' + el.id);
      $(el).find('svg').css('display', 'none');
      el.setAttribute('contenteditable', true);
      el.ownerDocument.execCommand('styleWithCSS', true, null);
      var sample = $('#sample').find('span')[0];
      // console.log($(sample).css('text-decoration'));
      if ($(sample).css('font-weight') === 'bold') {
        el.ownerDocument.execCommand('bold');
      }
      if ($(sample).css('font-style') === 'italic') {
        el.ownerDocument.execCommand('italic');
      }
      if ($(sample).css('text-decoration') === 'underline') {
        el.ownerDocument.execCommand('underline');
      }
      // console.log($(sample).css('color'));
      el.ownerDocument.execCommand('foreColor', false, $(sample).css('color'));
      // console.log($(sample).css('font-weight'));
      // console.log($(sample).css('font-style'));
      // console.log($(sample).css('font-size'));
      return;
    }

    if (el && !newEl) {
      newEl = el;
    }

    var state = getVariable('active');
    if (state === 'stop') {
      return;
    }

  };

  var clearContentEditable = function(docIds) {
      // var selected = getVariable('tmp');
      var keep = new Set();
      var remove = [];
      selected.forEach(function(selEl) {
        var parts = selEl.split(' ');
        var doc = parts[0];
        var id = parts[1];
        // var [doc, id] = selEl.split(' ');
        // if (docIds.indexOf(doc) >= 0) {
          remove.push(selEl);
        // } else {
          // keep.push(selEl);
        // }
      });
      remove.forEach(function(selEl) {
        var parts = selEl.split(' ');
        var doc = parts[0];
        var id = parts[1];
        // var [doc, id] = selEl.split(' ');
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

  $('#stop').on(touch ? 'tap' : 'click', function(e) {
    // var selected = getVariable('tmp');
    var docIds = [];
    selected.forEach(function(selEl) {
      var parts = selEl.split(' ');
      var doc = parts[0];
      var id = parts[1];
      // var [doc, id] = selEl.split(' ');
      docIds.push(doc);
    });
    clearContentEditable(docIds);
  });

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
          el.ownerDocument.execCommand('styleWithCSS', true, null);
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
          $(instrumentNode).on(touch ? 'tap' : 'click', function() {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          });
        } else if (document.body.id === 'opener') {
          $(instrumentNode).on(touch ? 'tap' : 'click', function() {
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
          $(node).on(touch ? 'tap' : 'click', function() {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          });
        } else if (document.body.id === 'opener') {
          $(node).on(touch ? 'tap' : 'click', function() {
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

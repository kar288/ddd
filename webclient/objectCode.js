function makeXPath(node, currentPath) {
  /* this should suffice in HTML documents for selectable nodes, XML with namespaces needs more code */
  currentPath = currentPath || '';
  switch (node.nodeType) {
    case 3:
    case 4:
      return makeXPath(
        node.parentNode,
        'text()[' + (document.evaluate(
          'preceding-sibling::text()',
          node,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        ).snapshotLength + 1) + ']'
      );
    case 1:
      return makeXPath(
        node.parentNode,
        node.nodeName + '[' + (document.evaluate(
            'preceding-sibling::' + node.nodeName,
            node,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          ).snapshotLength + 1) + ']' + (currentPath ? '/' + currentPath : '')
        );
    case 9:
      return '/' + currentPath;
    default:
      return '';
  }
}

function restoreSelection(selectionDetails) {
  if (!selectionDetails || isEmpty(selectionDetails)) {
    return;
  }
  var selection = rangy.getSelection();
  selection.removeAllRanges();
  try {
    var range = rangy.createRangyRange();
    range.setStart(
      document.evaluate(
        selectionDetails.startXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue,
      Number(selectionDetails.startOffset)
    );
    range.setEnd(
      document.evaluate(
        selectionDetails.endXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue,
      Number(selectionDetails.endOffset)
    );
    selection.addRange(range);
  }
  catch (e) {
    console.log(e);
    console.log('bad xpath');
  }
}

function getSelectionSimple() {
  var selection = rangy.getSelection();
  if (selection.type === 'None' || selection.rangeCount < 1) {
    return {};
  }
  var range = selection.getRangeAt(0);
  var selectObj = {
    'startXPath': makeXPath(range.startContainer),
    'startOffset': range.startOffset || 0,
    'endXPath': makeXPath(range.endContainer),
    'endOffset': range.endOffset || 0
  };

  return selectObj;
}


var objectCodeInternal = function() {
  // if (parent.document !== document) {
  //   parent.onloadIframe(document, null, 'active-object');
  // }
  pairingButtonListener();

  // var bodyHeight = $('body').height();
  // $('svg').height(bodyHeight);

  $(document).on('mousedown touchstart', function(e) {
    var target = e.target;
    if ($(target).is('img')) {
      target = $(target).closest('.shape')[0];
    }
    var nearest = $(target).closest('[id]')[0];
    if (nearest) {
      var id = nearest.getAttribute('id');
      if ($(nearest).hasClass('instrument-container')) {
        $(nearest).children().css('pointer-events', 'none');
      }

      setVariable('active-object', id);
      log('acted on', id);
    }

    var closestShape = $(target).closest('.shape');
    if (closestShape.length) {
      closestShape = closestShape[0];
    } else {
      closestShape = $('.content')[0];
    }
    setVariable('cursor', getPos(e, closestShape));

    if ($(target).hasClass('content')) {
      return;
    }

    closestShape = $(target).parents('.shape');
    if (closestShape.length) {
      closestShape = closestShape[0];
    } else {
      closestShape = $('.content')[0];
    }
    if ($(target.parentElement).is('body')) {
      closestShape = document.body;
    }

    setVariable('cursorMover', getPos(e, closestShape));
  });

  $(document).on('mousemove touchmove', function(e) {
    // e.preventDefault();
    if (!getVariable('active-object')) {
      return;
    }
    var activeObject =  $('#' + getVariable('active-object'));
    var closestShape = activeObject.closest('.shape');
    if (closestShape.length) {
      closestShape = closestShape[0];
    } else {
      closestShape = $('.content')[0];
    }
    setVariable('cursor', getPos(e, closestShape));
    if ($(activeObject).hasClass('content')) {
      return;
    }
    closestShape = activeObject.parents('.shape');
    if (closestShape.length) {
      closestShape = closestShape[0];
    } else {
      closestShape = $('.content')[0];
    }

    if ($(activeObject[0].parentElement).is('body')) {
      closestShape = document.body;
    }
    // console.log(activeObject, closestShape, getPos(e, closestShape));
    setVariable('cursorMover', getPos(e, closestShape));
  });

  $(document).on('mouseup touchend', function(e) {
    $('#' + getVariable('active-object'))
      .children()
      .css('pointer-events', 'auto');
    setVariable('active-object', '');
    setVariable('cursor', '');
    setVariable('selection', getSelectionSimple());
  });

  // $('body').on('click tap', function() {
  //   console.log('click tap');
  //   setVariable('selection', getSelectionSimple());
  // });

  $('#selection').bind('DOMSubtreeModified', function() {
    if (JSON.stringify(getSelectionSimple()) ===
    JSON.stringify(getVariable('selection'))) {
      return;
    }
    restoreSelection(getVariable('selection'));
  });
};

var objectCode = function() {
  $('document').ready(function() {
    objectCodeInternal();
  });
};

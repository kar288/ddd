

// var onloadIframe = function(d, instrumentID, objectID, actOnElement, turnOff) {

// var shortcutCode = function() {
  // var id = $(this).attr('object');
  // if ($('#' + id).css('display') === 'block') {
  //   $('#' + id).css('display', 'none');
  // } else {
  //   $('#' + id).css('display', 'block');
  // }
// };

// var updatedEditorCount = false;

// var updateEditorCount = function(newVal) {
//   // set which window of the editor this is
//   var editorCount = newVal || getVariable('editorCount') + 1;
//   setVariable('editorCount', editorCount);
//   var params = Object.assign(
//     getParams(location.search),
//     {editorCount: editorCount}
//   );
//   history.pushState(
//     '',
//     'Webstrates',
//     location.origin + location.pathname + stringFromParams(params)
//   );
// };

// var editorCountObserver = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     var val = getVariableFromUrl('editorCount') * 1;
//     var editorClosed = getVariable('editorClosed');
//     if (val > editorClosed) {
//       var params = getParams(location.search);
//       params.editorCount = val - 1;
//       history.pushState(
//         '',
//         'Webstrates',
//         location.origin + location.pathname + stringFromParams(params)
//       );
//     }
//   });
// });

// var editorCount = function() {
//   if (!$(document.body).hasClass('ddd_editor') ||
//     updatedEditorCount || document.readyState !== 'complete') {
//     return;
//   }
//
//   updateEditorCount();
//   $(window).bind('beforeunload', function(e) {
//     setVariable('editorCount', getVariable('editorCount') - 1);
//     setVariable('editorClosed', getVariableFromUrl('editorCount') * 1);
//   });
//
//   // change main editor when the main one is closed!
//   editorCountObserver.observe(
//     $('#editorClosed')[0],
//     {childList: true}
//   );
//   updatedEditorCount = true;
// };

// $('.shortcut').unbind('click', shortcutCode);
// $('.shortcut').on('click', shortcutCode);
// editorCount();
// $(window).load(editorCount);

/** START **/
var startCode = function() {
  var deleteSelectors = function() {
    var selector = $('.selector');
    if (selector.length) {
      selector.remove();
    }
  };
  deleteSelectors();
  $('#sessionOpener').submit(function(e) {
    e.preventDefault();
    deleteSelectors();
    var name = $('#sessionName').val();
    $.ajax('/api/names').done(function(response) {
      if (response.ids.indexOf(name) > -1) {
        var selector = document.createElement('div');
        document.body.appendChild(selector);
        selector.setAttribute('class', 'selector');

        var title = document.createElement('h5');
        title.innerText = 'Choose the elements to keep in this device:';
        selector.appendChild(title);

        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', '/' + name);
        selector.appendChild(iframe);

        var button = document.createElement('div');
        button.setAttribute('class', 'btn small');
        button.innerText = 'Go!';
        selector.appendChild(button);

        $(iframe).on('transcluded', function(e) {
          var iframeDocument = $('iframe')[0].contentDocument;

          if ($(iframeDocument).find('.editor-container').length < 1) {
            window.location.href = '/' + name;
          }

          var rules = [
            'iframe {display: none !important; }',
            '.shortcut { padding: 10px; cursor: pointer; }',
            '.selected { border: solid 2px red; }',
            '.editor-container { height: inherit important!; position: relative !important; display: block !important; }'
          ];
          insertRules(iframeDocument, rules);

          $(iframeDocument).find('.editor-container').on('click', function() {
            $(this).toggleClass('selected');
          });
          $(button).on('click', function() {
            var active = '?';
            var selected = $(iframeDocument).find('.selected');
            if (!selected.length) {
              return;
            }
            if (selected.length === 1) {
              window.location.href =
                '/' + $(selected[0]).attr('object').replace('object-', '');
              return;
            }
            selected.each(function(i, el) {
              active += 'active=' + $(el).attr('object') + '&';
            });
            window.location.href = '/' + name + active;
          });

          $(window).bind('beforeunload', function(e) {
            $(iframeDocument).find('.selected').each(function(i, el) {
              $(el).removeClass('selected');
            });
          });
        });
      } else {
        window.location.href = '/new?prototype=editorBase&id=' + name;
      }
    });
  });
};

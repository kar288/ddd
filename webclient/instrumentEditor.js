var instrumentEditor = function() {
  $('document').ready(function() {
    window.openInstrument = function() {
      var instrumentIframe = $('#instrument');
      var instrumentName = $('#instrumentName').val();
      instrumentIframe.attr('src', instrumentName);
      instrumentIframe.on('transcluded', function(el) {
        var instrumentDoc = event.target.contentWindow.document;
        var subInstruments = $.makeArray(
          instrumentDoc.getElementsByClassName('sub-instrument')
        );
        var ids = subInstruments.map(function(subInstrument) {
          return subInstrument.id;
        });
        $('#subinstruments').html(ids.join(' '));
        var style = instrumentDoc.getElementById('instrument-style');
        if (style) {
          $('#subinstruments-style').html(style.innerHTML);
        }
        var build = instrumentDoc.getElementById('sub-instrument-build');
        if (build) {
          $('#sub-instrument-build').html(build.innerHTML);
        }
      }.bind(this));
    };
    window.changeInstrument = function() {
      var instrumentDoc = $('#instrument')[0].contentDocument;
      var instrumentBase =
        $('#new_instrument')[0].contentDocument.body.cloneNode(true);
      var instrumentName = $('#instrumentName').val();
      instrumentBase.setAttribute('id', instrumentName);
      $(instrumentBase).find('#active')[0]
        .setAttribute('class', instrumentName);
      instrumentDoc.body = instrumentBase;

      var top = instrumentDoc.createElement('div');
      top.setAttribute('class', 'row');
      $(instrumentBase).prepend(top);

      var col1 = instrumentDoc.createElement('div');
      col1.setAttribute('class', 'col s6 m6');
      $(top).append(col1);

      var title = instrumentDoc.createElement('h5');
      title.innerHTML = instrumentName;
      $(col1).prepend(title);

      var col2 = instrumentDoc.createElement('div');
      col2.setAttribute('class', 'col s6 m6');
      $(top).append(col2);

      var subInstrumentContainer =
        $(instrumentDoc).find('#sub-instrument-container');
      subInstrumentContainer.attr('class', 'row');
      var subInstruments = $('#subinstruments').text().split(' ');
      $(subInstrumentContainer).html('');
      var subInstrumentBuild = $('#sub-instrument-build').text();
      instrumentDoc.getElementById('sub-instrument-build').innerText =
        subInstrumentBuild;
      subInstruments.forEach(function(subInstrument) {
        var el = document.createElement('div');
        el.setAttribute('class', 'sub-instrument col s4');
        el.setAttribute('id', subInstrument);
        eval(subInstrumentBuild);
        if (subInstrument === 'stop') {
          el.innerHTML = 'x';
        }
        $(subInstrumentContainer).append(el);
      });

      // STYLE
      var style = instrumentDoc.getElementById('instrument-style');
      if (!style) {
        style = instrumentDoc.createElement('style');
        style.setAttribute('id', 'instrument-style');
        instrumentDoc.body.appendChild(style);
      }
      style.innerHTML = $('#subinstruments-style')[0].innerText;
      var instrumentGeneralStyle =
        instrumentDoc.getElementById('instrument-general-style');
      if (instrumentGeneralStyle) {
        instrumentGeneralStyle.outerHTML = '';
      }
      instrumentGeneralStyle = $('#new_instrument')[0].contentDocument
        .getElementById('instrument-general-style').cloneNode(true);
      instrumentDoc.body.appendChild(instrumentGeneralStyle);

      // SCRIPT
      var script = $(instrumentDoc).find('#instrument-script')[0];
      if (!script) {
        script = instrumentDoc.createElement('script');
        script.setAttribute('id', 'instrument-script');
        script.innerText = instrumentName + 'Code();';
        if (sample) {
          script.innerText += 'objectCode();';
        }
        instrumentDoc.body.appendChild(script);
      }

      // SAMPLE
      var sample = $('<textarea />').html($('#sample').html()).text();
      if (sample) {
        var sampleNode = instrumentDoc.createElement('div');
        sampleNode.innerHTML = sample;
        $(col2).append(sampleNode);
      }

      appendPairingButton(instrumentDoc);
    };
  });
};

var appendPairingButton = function(doc) {
  var pairingButtonString =
    '<div id="menu" class="row">' +
      '<div id="pairing-button" class="col s6">' +
        '<div>.</div>' +
      '</div>' +
      '<div class="col s6" id="opener-button">' +
        'open...' +
      '</div>' +
    '</div>';
  var pairingButtonNode = doc.createElement('div');
  pairingButtonNode.innerHTML = pairingButtonString;
  $(doc.body).prepend(pairingButtonNode);
};

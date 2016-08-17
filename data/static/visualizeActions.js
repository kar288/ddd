var scale = 2;

var visualizeData = function(data, participantOrder) {
  data = JSON.parse(data);
  var cases = Object.keys(data);

  d3.select('.legend').selectAll('span')
    .data(instruments)
    .enter()
    .append('span')
    .text(function(d) {
      return d;
    })
    .style('background-color', function(d, i) {
      return colors[i];
    })
    .style('opacity', 0.5)
    .attr('class', function(d) {
      return d + ' instrument legend-text';
    });

  var pGroup = d3.select('svg').selectAll('.participant')
    .data(cases)
    .enter()
    .append('g')
    .attr('height', '150px')
    .attr('width', '200px')
    .attr('transform', function(d, i) {
      return 'translate(' + 0 + ',' + ((i) * scale * 100 + 100) + ')scale(' + scale + ')';
    });
  pGroup.append('text')
    .text(function(d) {
      return d;
    });
  var caseGroup = pGroup.selectAll('g')
    .data(function(d) {
      if (typeof participantOrder === 'object') {
        return participantOrder[d];
      }
      return ['A', 'B', 'C'];
    })
    .enter()
    .append('g')
    .attr('height', '50px')
    .attr('width', '100px')
    .attr('transform', function(d, i) {
      return 'translate(' + 50 + ',' + ((i) * 30) + ')';
    });

  caseGroup.append('text')
    .text(function(d) {
      return d;
    });

  var greys = ['#000', '#666', '#BBB'];

  caseGroup.append('rect')
    .attr('height', 25)
    .attr('width', function(d) {
      var participant = d3.select(this.parentNode.parentNode).datum();
      var switches = data[participant][d];
      var times = Object.keys(switches);
      return times.splice(times.length - 2, 1) / 50;
    })
    .attr('stroke-width', 1)
    .attr('stroke', function(d, i) {
      return greys[i];
    })
    .attr('fill', 'none')
    .attr('transform', 'translate( 20, -18.5)');

  var formatData = function(d) {
    var participant = d3.select(this.parentNode).datum();
    var switches = data[participant][d];
    var times = Object.keys(switches);
    times = times.sort(function(a, b) {
      return parseFloat(a) - parseFloat(b);
    });
    var newData = [];
    var start = 0;
    var prev = 0;
    var currentMode = '';
    var prevMode = '';
    var instrumentSwitch = 0;
    times.forEach(function(time) {
      var instrument = switches[time];
      if (prevMode !== instrument) {
        instrumentSwitch++;
      }
      prevMode = instrument;
      if (instrument === 'colorPicker' || instrument === 'clipboard') {
        newData.push({
          'length': 1,
          'color': colors[instruments.indexOf(instrument)],
          'start': time,
          'instrument': instrument,
          'participant': participant,
          'case': d
        });
        return;
      }
      if (currentMode === '') {
        currentMode = instrument;
        start = time;
        prev = time;
      } else if (currentMode === instrument && time - prev < 200) {
        prev = time;
      } else {
        newData.push({
          'length': prev - start,
          'color': colors[instruments.indexOf(currentMode)],
          'start': parseInt(start) ? parseInt(start) : 1,
          'instrument': currentMode,
          'participant': participant,
          'case': d
        });
        currentMode = '';
      }
    }, {participant: participant, c: d, switches: switches});
    newData.push({
      'length': prev - start,
      'color': colors[instruments.indexOf(currentMode)],
      'start': parseInt(start) ? parseInt(start) : 1,
      'instrument': currentMode,
      'participant': participant,
      'case': d
    });
    console.log(participant, d, instrumentSwitch, newData.length);
    return newData;
  };

  caseGroup.selectAll('.instrumentRect')
    .data(function(d) {
      var newData = formatData.bind(this)(d);
      return newData.filter(function(d) {
        return d.instrument !== 'colorPicker' && d.instrument !== 'clipboard';
      });
    })
    .enter()
    .append('rect')
    .attr('fill', function(d) {
      return d.color;
    })
    .attr('width', function(d) {
      return d.length / 50;
    })
    .attr('fill-opacity', 0.5)
    .attr('height', 20)
    .attr('transform', function(d, i) {
      return 'translate(' + (d.start / 50 + 20) + ',' + (-15) + ')';
    })
    .attr('class', function(d) {
      return d.instrument + ' instrument instrumentRect';
    });


    caseGroup.selectAll('circle')
      .data(function(d) {
        var newData = formatData.bind(this)(d);
        return newData.filter(function(d) {
          return d.instrument === 'colorPicker' || d.instrument === 'clipboard';
        });
      })
      .enter()
      .append('circle')
      .attr('fill', function(d) {
        return d.color;
      })
      .attr('r', function(d) {
        return 3;
      })
      .attr('fill-opacity', 0.5)
      .attr('cx', function(d, i) {
        return (d.start / 50 + 20);
      })
      .attr('cy',  -5)
      .attr('class', function(d) {
        return d.instrument + ' instrument';
      });

    instruments.forEach(function(instrument) {
      $('.' + instrument).on('mouseover', function(el) {
        $('.instrument').attr('fill-opacity', 0.5);
        $('.' + instrument).attr('fill-opacity', 1);
        $('.instrument').css('opacity', 0.5);
        $('.' + instrument).css('opacity', 1);
      });
      $('.' + instrument).on('mouseout', function(el) {
        $('.instrument').attr('fill-opacity', 0.5);
        $('.instrument').css('opacity', 0.5);
      });
    });
};

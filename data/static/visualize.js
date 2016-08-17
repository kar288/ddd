var visualizeData = function(data) {
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

  var pGroup = d3.select("svg").selectAll('.participant')
    .data(cases)
    .enter()
    .append("g")
    .attr('height', '150px')
    .attr('width', '200px')
    .attr('transform', function(d, i) {
      return 'translate(' + 0 + ',' + ((i) * 100 + 50) + ')';
    });
  pGroup.append('text')
    .text(function(d) {
      return d;
    });
  var caseGroup = pGroup.selectAll('g')
    .data(['A', 'B', 'C'])
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

  caseGroup.selectAll('rect')
    .data(function(d) {
      var participant = d3.select(this.parentNode).datum();
      var switches = data[participant][d];
      var times = Object.keys(switches);
      // .map(function(time) {
      //   return parseFloat(time);
      // });
      times = times.sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
      });
      var newData = [];
      var instrumentStarts = {};
      var prev = 0;
      instruments.forEach(function(instrument) {
        instrumentStarts[instrument] = null;
      });
      times.forEach(function(time) {
        var instrument = Object.keys(switches[time])[0];
        var status = switches[time][instrument];
        if (status === 'start') {
          instrumentStarts[instrument] = parseFloat(time);
          return;
        }
        if (isNaN(instrumentStarts[instrument])) {
          console.log('??');
          return;
        }
        newData.push({
          'length': time - instrumentStarts[instrument],
          'color': colors[instruments.indexOf(instrument)],
          'start': instrumentStarts[instrument],
          'instrument': instrument,
          'participant': participant,
          'case': d
        });
        instrumentStarts[instrument] = null;
        prev = time;
      }, {participant: participant, c: d, switches: switches});
      Object.keys(instrumentStarts).forEach(function(start) {
        if (instrumentStarts[start]) {
          var times = Object.keys(this.switches).sort(function(a, b) {
            return parseFloat(a) - parseFloat(b);
          });
          var lastTime = parseFloat(times.splice(times.length - 1, 1));
          newData.push({
            'length': lastTime - instrumentStarts[start],
            'color': colors[instruments.indexOf(start)],
            'start': instrumentStarts[start],
            'instrument': start,
          });
        }
      }, {participant: participant, c: d, switches: switches, times: times});
      console.log(participant, d, newData.length);
      return newData;
    })
    .enter()
    .append('rect')
    .attr('fill', function(d) {
      return d.color;
    })
    .attr('width', function(d) {
      return d.length * 2;
    })
    .attr('fill-opacity', 0.5)
    .attr('height', 20)
    .attr('transform', function(d, i) {
      return 'translate(' + (d.start * 2 + 20) + ',' + (-15) + ')';
    })
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

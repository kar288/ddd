var actionCounts = function(data, participantOrder) {
  var logScale = d3.scaleLog()
      .base(Math.E)
      .domain([1, 10000])
      .range([0, 200]);

  data = JSON.parse(data);
  var cases = Object.keys(data);

  d3.select('svg').selectAll('.legend-text')
    .data(instruments)
    .enter()
    .append('g')
    .attr('height', 50)
    .attr('width', 200)
    .attr('transform', function(d, i) {
      return 'translate(' + (i * 200 + 75)+ ', 20)';
    })
    .append('text')
    .text(function(d) {
      return d;
    })
    // .style('background-color', function(d, i) {
    //   return colors[i];
    // })
    // .style('opacity', 0.5)
    .attr('class', function(d) {
      return d + ' instrument legend-text';
    });

    d3.select('svg').selectAll('line')
      .data(instruments)
      .enter()
      .append('line')
      .attr('x1', function(d, i) {
        return (i * 200 + 75);
      })
      .attr('y1', 0)
      .attr('x2', function(d, i) {
        return (i * 200 + 75);
      })
      .attr('y2', 10000)
      .attr('stroke', 'black')
      .attr('stroke-width', '1');

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
  pGroup.append('line')
    .attr('y1', function(d, i) {
      return -25;
    })
    .attr('x1', 0)
    .attr('y2', function(d, i) {
      return -25;
    })
    .attr('x2', 10000)
    .attr('stroke', 'black')
    .attr('stroke-width', '1');
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

  var max = 0;

  var formatData = function(d) {
    var participant = d3.select(this.parentNode).datum();
    var switches = data[participant][d];
    var times = Object.keys(switches);
    times = times.sort(function(a, b) {
      return parseFloat(a) - parseFloat(b);
    });
    var counts = {};
    instruments.forEach(function(instrument) {
      counts[instrument] = 0;
    });
    times.forEach(function(time) {
      var instrument = switches[time];
      counts[instrument] += 1;
    });
    return instruments.map(function(instrument, i) {
      max = Math.max(counts[instrument]);
      // console.log(max);
      return {
        instrument: instrument,
        length: counts[instrument],
        // length: logScale(counts[instrument] + 1),
        color: colors[i]
      };
    });
  };
  console.log(max);

  caseGroup.selectAll('rect')
    .data(function(d) {
      return formatData.bind(this)(d);
    })
    .enter()
    .append('rect')
    .attr('fill', function(d) {
      return d.color;
    })
    .attr('width', function(d) {
      return logScale(d.length + 1);
    })
    .attr('fill-opacity', 0.5)
    .attr('height', 20)
    .attr('transform', function(d, i) {
      return 'translate(' + (200 * i + 35) + ' ,' + (-17.5) + ')';
    })
    .attr('class', function(d) {
      return d.instrument + ' instrument';
    })
    .on('mouseover', function(d,i) {
      console.log(d.length);
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

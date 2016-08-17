var scale = 2;

var allCases = ['A', 'B', 'C'];

var height = 1500;
var logScale = d3.scaleLog()
    .base(Math.E)
    .domain([1, 1062])
    .range([0, height]);

var visualizeData = function(data, participantOrder) {
  data = JSON.parse(data);
  var cases = Object.keys(data);

  var points = [];
  var maxY = 0;
  var minY = Infinity;

  Object.keys(data).forEach(function(participant) {
    Object.keys(data[participant]).forEach(function(c) {
      var switches = data[participant][c];
      var times = Object.keys(switches);
      times = times.sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
      });

      var prevMode = '';
      var instrumentSwitch = 0;
      times.forEach(function(time) {
        var instrument = switches[time];
        if (prevMode !== instrument) {
          instrumentSwitch++;
        }
        prevMode = instrument;
      });
      maxY = Math.max(maxY, instrumentSwitch);
      minY = Math.min(minY, instrumentSwitch);
      points.push({
        participant: participant,
        case: c,
        x: allCases.indexOf(c),
        y: logScale(instrumentSwitch),
        xAlternative: participantOrder[participant].indexOf(c)
      });
    });
  });

  // add the tooltip area to the webpage
  var tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  d3.select('svg').selectAll('circle')
    .data(points)
    .enter()
    .append('circle')
    .attr('class', function(d) {
      return 'p' + d.participant;
    })
    .attr('cx', function(d) {
      return 200 + 200 * d.x - Math.random() * 50;
    })
    .attr('cy', function(d) {
      return logScale(maxY) - d.y + 50 - Math.random() * 50;
    })
    .attr('r', 5)
    .attr('fill-opacity', 0.5)
    .attr('fill', function(d) {
      return colors[d.xAlternative];
    })
    .on('mouseover', function(d) {
        tooltip.transition()
             .duration(200)
             .style('opacity', 0.9);
        tooltip.html(d.participant + ' ' + d.case + ' ' + (d.xAlternative + 1))
             .style('left', (d3.event.pageX + 5) + 'px')
             .style('top', (d3.event.pageY - 28) + 'px');
        $('.p' + d.participant)
          .attr('fill-opacity', 1)
          .attr('r', 20);
    })
    .on('mouseout', function(d) {
        tooltip.transition()
             .duration(500)
             .style('opacity', 0);

        $('.p' + d.participant)
          .attr('fill-opacity', 0.5)
          .attr('r', 5);
    });
  d3.select('svg')
    .append('line')
    .attr('y1', logScale(maxY) - logScale(minY) + 50)
    .attr('x1', 100)
    .attr('y2', logScale(maxY) - logScale(maxY))
    .attr('x2', 100)
    .attr('stroke', 'black')
    .attr('stroke-width', '1');
  d3.select('svg')
    .append('line')
    .attr('y1', logScale(maxY) - logScale(minY) + 50)
    .attr('x1', 100)
    .attr('y2', logScale(maxY) - logScale(minY) + 50)
    .attr('x2', 800)
    .attr('stroke', 'black')
    .attr('stroke-width', '1');
  d3.select('svg').append('g')
    .attr('transform', 'translate(0, ' + (logScale(maxY) - logScale(minY) + 70) + ')')
    .selectAll('text')
    .data(allCases)
    .enter()
    .append('text')
    .text(function (d) {return d;})
    .attr('transform', function(d, i) {
      return 'translate(' + (200 + 200 * i) + ', 0)';
    });


};

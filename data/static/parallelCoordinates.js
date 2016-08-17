var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var allCases = ['A', 'B', 'C'];


var logScale = d3.scale.log()
    .base(Math.E)
    .domain([1, 1062])
    .range([0, height]);

var visualizeData = function(data, participantOrder) {
  data = JSON.parse(data);
  var cases = Object.keys(data);

  var points = [];
  var parallelCoordinatePoints = [];
  var instrumentCount = [];

  Object.keys(data).forEach(function(participant) {
    parallelCoordinatePoints.push({});
    instrumentCount.push({});
  });
  Object.keys(data).forEach(function(participant) {
    Object.keys(data[participant]).forEach(function(c) {
      var switches = data[participant][c];
      var times = Object.keys(switches);
      times = times.sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
      });

      var prevMode = '';
      var instrumentSwitch = 0;
      var singleSwitch = 0;
      times.forEach(function(time) {
        var instrument = switches[time];
        if (prevMode !== instrument) {
          instrumentSwitch++;
        }
        if (instrument === 'clipboard') {
          singleSwitch++;
        }
        prevMode = instrument;
      });
      console.log(participant, c, instrumentSwitch);
      parallelCoordinatePoints[parseInt(participant) - 1][c] =
        logScale(instrumentSwitch);
      instrumentCount[parseInt(participant) - 1][c] = logScale(singleSwitch);
    });
  });
  parallelCoordinatePoints.push({'A': 150, 'B': 150, 'C': 150});
  parallelCoordinatePoints.push({'A': 500, 'B': 500, 'C': 500});
  parallelCoordinates(false, parallelCoordinatePoints);
  instrumentCount.push({'A': 0, 'B': 0, 'C': 0});
  instrumentCount.push({'A': 500, 'B': 500, 'C': 500});
  parallelCoordinates(false, instrumentCount);
};


var parallelCoordinates = function(error, cars) {


  var x = d3.scale.ordinal().rangePoints([0, width], 1),
      y = {},
      dragging = {};

  var line = d3.svg.line(),
      axis = d3.svg.axis().orient('left'),
      background,
      foreground;
  var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
    return d != 'name' && (y[d] = d3.scale.linear()
        .domain(d3.extent(cars, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append('g')
      .attr('class', 'background')
    .selectAll('path')
      .data(cars)
    .enter().append('path')
      .attr('d', path);

  // Add blue foreground lines for focus.
  foreground = svg.append('g')
      .attr('class', 'foreground')
    .selectAll('path')
      .data(cars)
    .enter().append('path')
      .attr('class', function(d, i) {
        return 'p' + i;
      })
      .on('mouseover', function(d, i) {
        console.log(d, i);
        d3.selectAll('.p' + i).style('stroke', 'red');
      })
      .on('mouseout', function(d, i) {
        // console.log(d, i);
        d3.selectAll('.p' + i).style('stroke', 'steelblue');
      })
      .attr('d', path);

  // Add a group element for each dimension.
  var g = svg.selectAll('.dimension')
      .data(dimensions)
    .enter().append('g')
      .attr('class', 'dimension')
      .attr('transform', function(d) { return 'translate(' + x(d) + ')'; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on('dragstart', function(d) {
          dragging[d] = x(d);
          background.attr('visibility', 'hidden');
        })
        .on('drag', function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr('d', path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr('transform', function(d) {
            return 'translate(' + position(d) + ')';
          });
        })
        .on('dragend', function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr('transform', 'translate(' + x(d) + ')');
          transition(foreground).attr('d', path);
          background
              .attr('d', path)
            .transition()
              .delay(500)
              .duration(0)
              .attr('visibility', null);
        }));

  // Add an axis and title.
  g.append('g')
      .attr('class', 'axis')
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append('text')
      .style('text-anchor', 'middle')
      .attr('y', -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append('g')
    .attr('class', 'brush')
    .each(function(d) {
      d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on('brushstart', brushstart).on('brush', brush));
    })
  .selectAll('rect')
    .attr('x', -8)
    .attr('width', 16);



    function position(d) {
      var v = dragging[d];
      return v === null || v === undefined ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
      return line(
        dimensions.map(function(p) {
          return [position(p), y[p](d[p])];
        })
      );
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
          extents = actives.map(function(p) { return y[p].brush.extent(); });
      foreground.style('display', function(d, i) {
        var val = actives.every(function(p, i) {
          return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        });
        if (val) {
          $('.p' + i).css('display', 'block');
          return null;
        } else {
          $('.p' + i).css('display', 'none');
          return 'none';
        }
      });
    }
};

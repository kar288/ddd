var scale = 2;

var visualizeData = function(data) {
  data = JSON.parse(data);
  d3.select('body')
    .append('div')
    .attr('class', 'dimensions')
    .style('position', 'fixed')
    .style('top', '0')
    .style('width', '100%')
    .style('background-color', 'white')
    .selectAll('div')
    .data(dimensions)
    .enter()
    .append('div')
    .style('float', 'left')
    .style('padding', '20px 0')
    .style('width', 100 / 6 + '%')
    .style('float', 'left')
    .text(function(d) {
      return d;
    });

  var caseBlock = d3.select('body').selectAll('line')
    .data(Object.keys(data))
    .enter()
    .append('div');
  caseBlock.append('hr');
  caseBlock
    .selectAll('div')
    .data(function(d) {
      return Object.keys(data[d]);
    })
    .enter()
      .append('div')
      .selectAll('div')
      .data(function(d) {
        var parentData = d3.select(this.parentNode).datum();
        return data[parentData][d];
      })
      .enter()
      .append('div')
      .style('padding', '20px 0')
      .style('width', 100 / 6 + '%')
      .style('float', 'left')
      .text(function(d) {
        return d;
      });
};

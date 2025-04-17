console.log('Started plotting.js:')
// const d3 = require('d3');
// 
// Function to plot timeseries data
function plotTimeseries(data, selector, delay) {
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 500 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.time; }))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return Math.max(d.p1, d.p2, d.p3); })])
    .range([height, 0]);

  const line = d3.line()
    .x(function(d) { return xScale(d.time); })
    .y(function(d) { return yScale(d.p1); });

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', line);

  // Animate the plot
  svg.transition()
    .duration(3000)
    .ease(d3.easeLinear)
    .delay(delay)
    .attr('transform', 'translate(' + margin.left + ',' + (margin.top + height) + ')');

  // Update the line to plot p2
  line.y(function(d) { return yScale(d.p2); });
  svg.select('path')
    .transition()
    .duration(3000)
    .ease(d3.easeLinear)
    .delay(delay + 3000)
    .attr('d', line);

  // Update the line to plot p3
  line.y(function(d) { return yScale(d.p3); });
  svg.select('path')
    .transition()
    .duration(3000)
    .ease(d3.easeLinear)
    .delay(delay + 6000)
    .attr('d', line);
}

 
// Load data from CSV file
function loadAndPlot(dataFile) {
 // Load data from CSV file
  d3.csv(dataFile).then(function(data) {
    // Convert time to numbers and p1, p2, p3 to numbers
    data.forEach(function(d) {
      d.time = +d.time;
      d.p1 = +d.p1;
      d.p2 = +d.p2;
      d.p3 = +d.p3;
    });

    // Plot p1
    plotTimeseries(data, '#plot', 0);
  }).catch(function(error) {
    console.error(error);
  });
}
console.log('Started plotting.js:')

// function createPlotly(selector, x_domain, y_domain) {
//   console.log("created plotly")
//   const margin = { top: 10, right: 30, bottom: 30, left: 60 },
//     width = 380 - margin.left - margin.right,
//     height = 150 - margin.top - margin.bottom;

//   // Create a new Plotly figure
//   const fig = {
//     data: [],
//     layout: {
//       title: '',
//       xaxis: {
//         title: 'Years',
//         range: x_domain,
//         type: 'linear'
//       },
//       yaxis: {
//         title: '% of the population infected',
//         range: y_domain,
//         type: 'linear'
//       },
//       margin: margin,
//       width: width,
//       height: height
//     }
//   };

//   // Add the plot to the HTML element
//   Plotly.newPlot(selector, fig);

//   // // Add X axis label
//   // const xLabel = document.createElement('div');
//   // xLabel.style.position = 'absolute';
//   // xLabel.style.top = `${height + margin.top * 2.8}px`;
//   // xLabel.style.left = `${width / 2.5}px`;
//   // xLabel.style.fontSize = '12px';
//   // xLabel.style.fontWeight = 'normal';
//   // xLabel.textContent = 'Years';
//   // document.body.appendChild(xLabel);

//   // // Add Y axis label
//   // const yLabel = document.createElement('div');
//   // yLabel.style.position = 'absolute';
//   // yLabel.style.top = `${-height / 0.8}px`;
//   // yLabel.style.left = `${-margin.left / 1.6}px`;
//   // yLabel.style.fontSize = '12px';
//   // yLabel.style.fontWeight = 'normal';
//   // yLabel.style.transform = 'rotate(-90)';
//   // yLabel.textContent = '% of the population infected';
//   // document.body.appendChild(yLabel);

//   return fig;
// }

// function plotTimeseries(fig, data, color, opacity = 1, transition = 100) {
//   console.log("log")
//   // Add the line
//   const line = {
//     x: data.map(d => d.t),
//     y: data.map(d => d.I),
//     mode: 'lines',
//     line: {
//       color: color,
//       width: 1.5,
//       opacity: opacity
//     }
//   };
//   fig.data.push(line);
//   // Plotly.relayout(fig, { xaxis: { range: [d3.min(data, d => d.t), d3.max(data, d => d.t)] } });
//   return line;
// }
// Function to plot timeseries data

function createsvg(selector, x_domain, y_domain, margin, width, height, xlabel = 'x', ylabel = 'y') {
  console.log("created svg")

  // append the svg object to the body of the page
  const svg = d3.select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add X axis
  const x = d3.scaleLinear()
    .domain(x_domain)
    .range([0, width]);
  const x_axis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .attr("class", "x_axis");

  // Add Y axis

  const y = d3.scaleLinear().range([height, 0]).domain(y_domain);
  const y_axis = d3.axisLeft().scale(y);
  svg.append("g")
    .attr("class", "myYaxis")
    .call(y_axis)

  return [svg, x, x_axis, y, y_axis];
}

function plotTimeseries(svg, x, y, data, color, opacity = 1) {
  console.log("log")
  // Add the line
  const line = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .attr("opacity", opacity) // Set the initial opacity to 0
    .attr("d", d3.line()
      .x(d => x(d.t))
      .y(d => y(d.I))
    )
  return line;
}

// Load data from CSV file and plot a timeseries
async function loadAndPlotScrollableTimeseries(dataFile, selector, color, t1 = null, t2 = null, x_domain = "auto", y_domain = "auto") {
  // Load data from CSV file
  const data = await d3.csv(dataFile);
  // Convert t and I to numbers
  data.forEach(function (d) {
    d.t = +d.t;
    d.I = +d.I;
  });

  if (x_domain == "auto") {
    x_domain = d3.extent(data, d => d.t)
  }
  if (y_domain == "auto") {
    y_domain = d3.extent(data, d => d.I)
  }

  // Plot
  const [svg, x, y] = createsvg(selector, data, x_domain, y_domain);

  // Plot the first part of the data up to t1
  const firstPartData = data.filter(d => d.t <= t1);
  plotTimeseries(svg, x, y, firstPartData, color);

  // Add a scroll event listener to the html element
  // const htmlElement = document.querySelector(selector);
  const maxT = d3.max(firstPartData, d => d.t);
  let secondPartData = data.filter(d => d.t >= maxT && d.t <= t2);
  let secondline = plotTimeseries(svg, x, y, secondPartData, color, opacity = 0);
  let secondPartPlotted = false;
  output = document.querySelector("p#output");
  element = document.getElementById("content");

  element.addEventListener("scroll", (event) => {
    const pos = element.scrollTop / (element.scrollHeight - element.clientHeight);
    if (!secondPartPlotted && pos >= 0.8) {
      secondPartPlotted = true;
      console.log("added!")
      secondline.transition()
        .duration(1000)
        .attr("opacity", 1);
    }
    else if (secondPartPlotted && pos < 0.8) {
      console.log("removed!")
      // Remove the second part of the data from the plot
      secondPartPlotted = false;
      secondline.transition()
        .duration(1000)
        .attr("opacity", 0);
    }
    console.log("scroll!", pos)
  });
}


// // Load data from CSV file and plot a timeseries
// async function loadAndPlotTimeseries(dataFile, selector, color, x_domain = "auto", y_domain = "auto") {
//   // Load data from CSV file
//   try {
//     const data = await d3.csv(dataFile);
//     // Convert t and I to numbers
//     data.forEach(function (d) {
//       d.t = +d.t;
//       d.I = +d.I;
//     });

//     if (x_domain == "auto") {
//       x_domain = d3.extent(data, d => d.t)
//     }
//     if (y_domain == "auto") {
//       y_domain = d3.extent(data, d => d.I)
//     }

//     // Plot
//     const [svg, x, y] = createsvg(selector, x_domain, y_domain);
//     plotTimeseries(svg, x, y, data, color);
//     return { svg, x, y };
//   } catch (error) {
//     console.error(error);
//     throw error; // Re-throw the error
//   }
// }

// function addToPlot(svg, x, y, dataFile, color) {
//   console.log("test")
//   // Load data from CSV file
//   d3.csv(dataFile).then(function (data) {
//     // Convert t and I to numbers
//     data.forEach(function (d) {
//       d.t = +d.t;
//       d.I = +d.I;
//     });

//     // Plot
//     plotTimeseries(svg, x, y, data, color);
//     return [svg, x, y];
//   }).catch(function (error) {
//     console.error(error);
//   });
// }

// // Function to plot timeseries data
// function plotTimeseries(data, selector) {
//   // set the dimensions and margins of the graph
// const margin = { top: 10, right: 30, bottom: 30, left: 60 },
//   width = 380 - margin.left - margin.right,
//   height = 150 - margin.top - margin.bottom;

// // append the svg object to the body of the page
// const svg = d3.select(selector)
//   .append("svg")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform", `translate(${margin.left},${margin.top})`);

// // Add X axis
// const x = d3.scaleLinear()
//   .domain(d3.extent(data, d => d.t))
//   .range([0, width]);
// svg.append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.axisBottom(x));
// // Add Y axis
// const y = d3.scaleLinear()
//   .domain(d3.extent(data, d => d.I))
//   .range([height, 0]);
// svg.append("g")
//   .call(d3.axisLeft(y));
// // Add the line
// svg.append("path")
//   .datum(data)
//   .attr("fill", "none")
//   .attr("stroke", "#69b3a2")
//   .attr("stroke-width", 1.5)
//   .attr("d", d3.line()
//     .x(d => x(d.t))
//     .y(d => y(d.I))
//   )
// }


// // Load data from CSV file and plot a timeseries
// function loadAndPlotTimeseries(dataFile, selector, color) {
//   // Load data from CSV file
//   d3.csv(dataFile).then(function (data) {
//     // Convert t and I to numbers
//     data.forEach(function (d) {
//       d.t = +d.t;
//       d.I = +d.I;
//     });

//     // Plot
//     plotTimeseries(data, selector, color);
//   }).catch(function (error) {
//     console.error(error);
//   });
// }


console.log('Started plotting.js:')

function createsvg(selector, x_domain, y_domain, margin, width, height, x_scale = "linear", y_scale = "linear", shorten_x_format = false) { // console.log("created svg")

    // append the svg object to the body of the page
    const svgEffectiveWidth = width + margin.left + margin.right;
    const svgEffectiveHeight = height + margin.top + margin.bottom;
    const svgElement = d3.select(selector)
        .append("svg")
        .attr("width", svgEffectiveWidth)
        .attr("height", svgEffectiveHeight)
        .attr("viewBox", `0 0 ${svgEffectiveWidth} ${svgEffectiveHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    const svg = svgElement.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    let x, x_axis;
    if (x_scale === "linear") {
        x = d3.scaleLinear()
            .domain(x_domain)
            .range([0, width]);
        x_axis = d3.axisBottom(x).ticks(4).tickSizeOuter(0);
    } else {
        x = d3.scaleTime()
            .domain(x_domain)
            .range([0, width]);
        x_axis = d3.axisBottom(x).ticks(4).tickSizeOuter(0).tickFormat(function (date) {
            if (d3.timeYear(date) < date) {
                return d3.timeFormat('%b')(date);
            } else {
                return d3.timeFormat('%Y')(date);
            }
        });
    }
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis)
        .attr("class", "x-axis");

    // Add Y axis
    let y, y_axis;
    if (y_scale == "linear") {
        y = d3.scaleLinear().range([height, 0]).domain(y_domain);
        y_axis = d3.axisLeft(y).ticks(4).tickSizeOuter(0);
        svg.append("g")
            .attr("class", "y-axis")
            .call(y_axis)
    } else {
        y = d3.scaleLog().range([height, 0]).domain(y_domain);
        y_axis = d3.axisLeft(y).ticks(4).tickSizeOuter(0);
        svg.append("g")
            .attr("class", "y-axis")
            .call(y_axis);
    }
    return { svg: svg, x: x, x_axis: x_axis, y: y, y_axis: y_axis, svg_element: svgElement };
}

function lineplot(plot, data, x_field, y_field, color, opacity = 1) { // Add the line
    const line = plot.svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("opacity", opacity) // Set the initial opacity to 0
        .attr("d", d3.line()
            .x(d => plot.x(d[x_field]))
            .y(d => plot.y(d[y_field]))
        )
    return line;
}

// ----------------- //
// Utility functions //
// ----------------- //
async function add_scrollable_lineplot_from_path(filepath, color, plot, x_field, y_field, x_range = 'all', y_domain = 'auto', initial_opacity = 0) {
    const data = await d3.csv(filepath);
    return add_scrollable_lineplot(data, color, plot, x_field, y_field, x_range, y_domain, initial_opacity);
}
function add_scrollable_lineplot(data, color, plot, x_field, y_field, x_range = 'all', y_domain = 'auto', initial_opacity = 0) {

    if (x_range != 'all') {
        data = data.filter(d => (d[x_field] >= x_range[0]) && (d[x_field] <= x_range[1]));
    }
    let x_domain = d3.extent(data, d => d[x_field]);
    let y_domain_data;
    if (y_domain == 'auto') {
        y_domain_data = d3.extent(data, d => d[y_field]);
    } else {
        y_domain_data = y_domain;
    }
    plot.y.domain(y_domain_data);

    // plot.y.domain(y_domain_data) // This was potentially problematic if plot.y was shared.
    // The y-domain should be set when the specific line is made active/visible by the scroll listener.
    // For now, let's assume the initial y_domain passed to createsvg is broad enough or is updated.

    // Plot
    let line = lineplot(plot, data, x_field, y_field, color, opacity = initial_opacity);

    return { line: line, x_domain: x_domain, y_domain: y_domain_data };
}
function transition_opacity(line, opacity, transition_time) {
    line.transition()
        .duration(transition_time)
        .attr("opacity", opacity);
}
function transition_domain(plot, new_domain, transition_time) {
    plot.y.domain(new_domain)
    plot.svg.selectAll(".y-axis")
        .transition()
        .duration(transition_time)
        .call(plot.y_axis);
}
function move(marker, plot, new_x, new_y, transition_time) {
    marker.transition()
        .duration(transition_time) // duration of the transition in milliseconds
        .attr("cx", plot.x(new_x)) // new x-coordinate
        .attr("cy", plot.y(new_y)); // new y-coordinate
}
function convertFieldsToNumber(data) {
    data.forEach(function (d) {
        const fields = Object.keys(d);
        fields.forEach(function (field) {
            d[field] = +d[field];
        });
    });
    return data;
}
// Function to fade in the markers one by one
function fadeInMarkers(markers, transition_time, transition_delay) {
    markers.each(function (d, i) {
        d3.select(this)
            .transition()
            .delay(i * transition_delay) // delay each marker
            .duration(transition_time)
            .attr("opacity", 1);
    });
}

// setting up SVG
var svgWidth = 850;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var firstXAxis = "poverty";

// Function used to update x-scale variable on click on xaxis label
function xScale(stateData, firstXAxis) {
  // Creates scale 
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[firstXAxis]) * 0.8,
      d3.max(stateData, d => d[firstXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };

  // function used for updating circles group with a transition to
  // new circles
function renderCircles(circlesGroup, newXScale, firstXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[firstXAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(firstXAxis, circlesGroup) {

  if (firstXAxis === "poverty") {
    var label = "Poverty:";
  }
  else {
    var label = "Obesity:";
  }
    
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .attr("text-align", "center")
    .attr("position", "absolute")
    .offset([50, -50])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[firstXAxis]}`);
    });

  // create tooltip in chartGroup
  chartGroup.call(toolTip);

  // create mouseover event 
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
    toolTip.style("display", "block");
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });
    
  return circlesGroup;
}

// Retrieve data from the CSV file 
dataset = d3.csv("stateData.csv").then(function(stateData) {
  // Parse
  stateData.map(function(data) {
    // Unary 
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });


  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, firstXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(stateData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .classed("y-axis",)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[firstXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 7)
    .attr("fill", "blue")
    .attr("opacity", ".8");

  // // append state abbreviations to circles
  // chartGroup.append("text")
  //   .style("font-size", "10px")
  //   .style("text-anchor", "middle")
  //   .style("fill", "white")
  //   .selectAll("tspan")
  //   .data(stateData)
  //   .enter()
  //   .append("tspan")
  //     .text(d.abbr);

  // Create group for 3 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 35)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Household Income (Median)");

  // append y axis label
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(firstXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== firstXAxis) {

        // replaces Xaxis with chosen value
        firstXAxis = value;
            
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, firstXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, firstXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(firstXAxis, circlesGroup);

        // changes classes to change bold text
        if (firstXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (firstXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}); 


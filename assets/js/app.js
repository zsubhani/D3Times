// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// select the "scatter" div id from index.html 
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis] * 0.8),
    	d3.max(censusData, d => d[chosenYAxis] * 1.1)
		])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on x-axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to new circles
// pass in newXScale, chosenXAxis, newYScale, and chosenYAxis
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
	  .attr("cy", d => newYScale(d[chosenYAxis]));
	

  return circlesGroup;
}

// function used for updating state abbreviation text group with a transition
// pass in newXScale, chosenXaxis, newYScale, and chosenYAxis
function renderStates(statesGroup, newXScale, chosenXaxis, newYScale, chosenYAxis) {

  statesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
    .text(function (d) {
      console.log('Value of d is now: ', d);
      return d.abbr;
  })
	

  return statesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // first x-axis label is poverty
  if (chosenXAxis === "poverty") {
    var x_label = "Poverty:";
  }
  // next x-axis label is age
  else if (chosenXAxis === "age") {
	  var x_label = "Age:";
  }
  // last x-axis label is income
  else {
    var x_label = "Household Income:";
  }
  
  // first y-axis label is healthcare
  if (chosenYAxis === "healthcare") {
    var y_label = "Healthcare:";
  }
  // next y-axis label is smokes
  else if (chosenYAxis === "smokes") {
	  var y_label = "Smokes:";
  }
  // last y-axis label is obesity
  else {
    var y_label = "Obesity:";
  }

  // use the d3-tip class from d3Style.css for the look of toolTip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${x_label} ${d[chosenXAxis]}<br>${y_label} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
var file = "/assets/data/data.csv"
d3.csv(file).then(successHandle, errorHandle);

function errorHandle(error){
  throw error;
}

function successHandle(censusData) {

  // parse data
  // get numbers for poverty, healthcare, age, smokes, income, and obesity
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
	data.smokes = +data.smokes;
	data.income = +data.income;
	data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create yLinearScale function from above csv import  
  var yLinearScale = yScale(censusData, chosenYAxis); //zsubhani11012018

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);
  
  // append initial circles
  // use class "stateCircle" from d3Style.css
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle", true)


  // append initial state abbreviation text labels
  // use class "stateText" from d3Style.css
  var statesGroup = chartGroup.selectAll(null)
  .data(censusData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .text(function (d) {
      console.log('Value of d is now: ', d);
      return d.abbr;
  })
  .attr("dy",".35em")
  .attr("class", "stateText");

    
  // Create group for 3 x-axis labels
  var x_labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // first x-axis label shown is poverty
  var povertyLabel = x_labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  // next x-axis label shown is age
  var ageLabel = x_labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
	
  // last x-axis label shown is income
  var incomeLabel = x_labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for 3 y-axis labels
  // rotate -90 degrees
  var y_labelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
  
  // first y-axis label shown is healthcare
  var healthcareLabel = y_labelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left + 60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  // next y-axis label shown is smokes
  var smokesLabel = y_labelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left + 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");
	
  // last y-axis label shown is obesity
  var obeseLabel = y_labelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left + 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function above csv import with chosenXAxis and chosenYAxis
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  x_labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
		
		   // updates y scale for new data
	    	yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
		
		   // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // update state abbreviation text labels
        statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text by having class "active" true for x-axis labels
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
		  incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
		else if (chosenXAxis === "age") {
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
        else if (chosenXAxis === "income") {
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
	
  // y axis labels event listener
  y_labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
		
	    	// updates y scale for new data
	    	yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
		
	    	// updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates state abbreviation text labels
        statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text by having class "active" true for y-axis labels
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
		  obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
		else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
		  obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
		  smokesLabel
		    .classed("active", false)
			.classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
	
}
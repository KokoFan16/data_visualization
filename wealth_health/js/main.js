var fdata; // The formatted data is a global variable
var rendered_year = 0;
var playing = false;

// Setting margin for svg
var margin = 
{
	top: 50,
	right: 100, 
	bottom: 100,
	left: 100
}

// Setting height cand width
var size = 
{
	height: 800,
	width: 1200,
	inner_height: 800 - (margin.top + margin.bottom),
	inner_width: 1200 - (margin.left + margin.right)
}

// Setting the Y axis
var yAxis = d3.scaleLinear()
	.domain([0, 90])
	.range([size.inner_height, 0])

// Setting the X axis
var xAxis = d3.scaleLog()
	.base(10)
	.range([0, size.inner_width])
	.domain([99, 150000])

var area = d3.scaleLinear()
	.range([25 * Math.PI, 1500 * Math.PI])
	.domain([2000, 1400000000]);

// Color options
var continentColor = d3.scaleOrdinal(["#F1C40F", "#C0392B", "#2ECC71", "#3498DB"]);

// container
var svg = d3.select("#svg_chart").append("svg")
	.attr("width", size.width)
	.attr("height", size.height)
	.style("background", "#E5EDB5")

// container group 
var container_group = svg.append("g")
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// setting x axis values (gdp)
var x_axis = d3.axisBottom(xAxis)
	.tickValues([1, 10, 100, 1000, 10000, 100000])
	.tickFormat(d3.format("$"));

// setting y axis values (life expectancy)
var y_axis = d3.axisLeft(yAxis)
	.tickFormat(function(d) {return +d});

// add property for x axis
container_group.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0 " + size.inner_height + ")")
	.attr("text-anchor", "middle")
	.call(x_axis)
	.selectAll("text");

// add property for y axis
container_group.append("g")
	.call(y_axis)
	.attr("class", "axis");

// add label for x axis
container_group.append("text")
	.attr("class", "axis_label")
	.attr("x", size.inner_width/2)
	.attr("y", size.inner_height + 50)
	.attr("text-anchor", "middle")
	.text("GDP per Capita");

// add label for y axis
container_group.append("text")
	.attr("class", "axis_label")
	.attr("x", -(size.inner_height/2))
	.attr("y", -50)
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy");

// add label for year
var year_label = container_group.append("text")
	.attr("class", "year_label")
	.attr("x", size.inner_width * 0.8)
	.attr("y", size.inner_height - 50)
	.attr("text-anchor", "middle");

// legend data
var continents = ["europe", "asia", "americas", "africa"];

// legend group
var continent_group = svg.append("g")
	.attr("transform", "translate(" + (size.inner_width + 150) + "," + 25 + ")");

// contient legend
continents.forEach(function(item, index)
{
	var continent = continent_group.append("g")
		.attr("transform", "translate(0, " + (index * 25) + ")");

	continent.append("rect")
		.attr("width", 20)
		.attr("height", 20)
		.attr("fill", continentColor(item));

	continent.append("text")
		.text(item)
		.attr("x", -10)
		.attr("y", 17)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.style("font-size", "20px")
});

// drop down 
var drop_down_change;

// options for drop down list
var options = ["all", "europe", "asia", "americas", "africa"];

// drop down options
var dorp_down = d3.select("#drop_down")
	.selectAll("options")
	.data(options)
	.enter()
	.append("option")
	.attr("value", function(d) {return d;})
	.property("selected", function(d){return d === options[0]})
	.text(function(d)
	{
		return d[0].toUpperCase() + d.slice(1, d.length);
	});

// drop down event
d3.select("#drop_down").on("change", function(d) {
  	//reset the valut of slider
    document.getElementById('slider').value = 0;
    rendered_year = 0;
    draw_circles(0);
})

// Reading the input data
d3.json("data/data.json").then(function (data) {

	// Cleanup data
	fdata = data.map(function (year_data) {
		// retain the countries for which both the income and life_exp is specified
		return year_data["countries"].filter(function (country) {
			var existing_data = (country.income && country.life_exp);
			return existing_data
		}).map(function (country) {
			// convert income and life_exp into integers (everything read from a file defaults to an string)
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		})
	});

	// invoke the circle that draws the scatterplot
	// the argument corresponds to the year
	draw_circles(0);
})

//filter data based on the selected continent
function filterContinent(data, continent)
{
	continent_data = data.map(function(d){
		return d.filter(function(item){
			var cdate = (item.continent == continent);
			return cdate;
		});
	});

	return continent_data;
}

// setting the callback function when the slider changes
d3.select("#slider").on("input", render);

// callback function to render the scene when the slider changes
function render() {

	// extracting the value of slider
	var slider_val = d3.select("#slider").property("value");
	
	// rendered_year is the global variable that stores the current year
	// get the rendered_year from the slider (+ converts into integer type)
	rendered_year = +slider_val

	// Call rendering function
	draw_circles(rendered_year)
}

// tooltip for mouseover
var tip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


function draw_circles(year) {

	// selected options
	var selectedOption = d3.select("#drop_down").property("value")

    var data = fdata;

    // filter data based on selected continent
    if (selectedOption != "all")
    {
    	var continent_data = filterContinent(fdata, selectedOption);
		data = continent_data;
    }

    // circle data
	var circle_update = container_group.selectAll("circle")
		.data(data[year], function(d)
			{
				return d.country;
			});

	var trans = d3.transition().duration(100);

	// Exit 
	circle_update.exit().attr("class", "exit")
		.remove();

	// Enter
	circle_update.enter()
		.append("circle")
		.attr("fill", function(d)
		{
			return continentColor(d.continent);
		})
		.merge(circle_update)
		// show country name and population when mouse over a circle
		.on("mouseover", function(d){
			d3.select(this).style("stroke-width", "3px")

			tip.transition()
				.duration(200)
			tip.style("opacity", .8);
			tip.html(d.country + "<br/>"  + "Population: " + d.population)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 30) + "px");
		})
		// disappear when mouse move out
		.on("mouseout", function(d){
			d3.select(this).style("stroke-width", "1px")

            tip.transition()		
                .duration(500)		
                .style("opacity", 0);	
		})
		.transition(trans)
		.attr("class", "circle")
		// circle settings
		.attr("cx", function(d)
		{
			return xAxis(d.income);
		})
		.attr("cy", function(d)
		{
			return yAxis(d.life_exp);
		})
		.attr("r", function(d)
		{
			return Math.sqrt(area(d.population/Math.PI));
		});

	// show year in real time
	year_label.text(1800 + year);		
    
    // this variable gets set only through the button 
	// therefore step is called in a loop only when play is pressed
	// step is not called when slider is changed
	if (playing)
        setTimeout(step, 50)
}


// callback function when the button is pressed
function play() {
	
	if (d3.select("button").property("value") == "Play") {
		d3.select("button").text("Pause")
        d3.select("button").property("value", "Pause")
        playing = true
        step()
	}
	else {
		d3.select("button").text("Play")
        d3.select("button").property("value", "Play")
        playing = false
	}
}

// callback function when the button is pressed (to play the scene)
function step() {
	
	// At the end of our data, loop back
	rendered_year = (rendered_year < 214) ? rendered_year + 1 : 0
	document.getElementById('slider').value = rendered_year;
	draw_circles(rendered_year)
}

// reset function
function reset()
{
    window.location.reload();
}

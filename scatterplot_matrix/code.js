
var data_location = '/data/iris.data'
var iris_data;
d3.csv(data_location).then(function(data){
  data.forEach(function(d){
    // convert string to number
    d.sepal_length = +d.sepal_length;
    d.sepal_width = +d.sepal_width;
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
  });
  iris_data = data;
  console.log(iris_data);
  draw_scatterpoints();
  assign_brush_events();
});

const padding = 30
const scatterplot_size = 600
const scatterpoint_radius = 5
const svg_width = scatterplot_size * 2 + padding * 6
const svg_height = scatterplot_size + padding * 5

// draw svg canvas
var svg = d3.select('#svg_chart').append('svg')
  .attr('width', svg_width)
  .attr('height', svg_height);

// draw scatterplot borders
svg.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', padding*2)
  .attr('y', padding*3)
  .attr('width', scatterplot_size)
  .attr('height', scatterplot_size);
svg.append('rect')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('x', scatterplot_size + padding * 4)
  .attr('y', padding*3)
  .attr('width', scatterplot_size)
  .attr('height', scatterplot_size);

// useful scales for mapping cx and cy for scatter points
var sepal_length_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([4.3, 8.0]);

var sepal_width_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([2.0, 4.4]);

var petal_length_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([1.0, 7.0]);

var petal_width_scale = d3.scaleLinear()
  .range([scatterpoint_radius, scatterplot_size-scatterpoint_radius])
  .domain([0.1, 2.5]);

// legend color
var legendColor = d3.scaleOrdinal(["#F1C40F", "#C0392B", "#2ECC71"]);
var legends = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"];

var legend_group = svg.append("g")
  .attr("transform", "translate(" + (scatterplot_size - padding) + "," + padding + ")");

var class_color = d3.scaleOrdinal(d3.schemePastel1)

// make scatterplot point groups
var sepal_scatterplot = svg.append('g')
  .attr('class', 'sepal_group')
  .attr('transform', `translate(${padding*2}, ${padding*3})`);

var petal_scatterplot = svg.append('g')
  .attr('class', 'petal_group')
  .attr('transform', `translate(${scatterplot_size + padding*4}, ${padding*3})`);

// draw legends
legends.forEach(function(item, index)
{
  var legend = legend_group.append("g")
  .attr("transform", "translate(" + (index * 200) + ", 0)");

  legend.append("rect")
  .attr("width", 20)
  .attr("height", 20)
  .attr("fill", legendColor(item));

  legend.append("text")
  .text(item)
  .attr("x", -10)
  .attr("y", 17)
  .attr("text-anchor", "end")
  .style("font-size", "20px")
});


function draw_scatterpoints(){

  // draw x axis
  var sepal_x_axis = d3.axisBottom()
  .scale(sepal_length_scale);

  // draw y axis
  var sepal_y_axis = d3.axisLeft()
  .scale(sepal_width_scale);

  // draw x axis
  var petal_x_axis = d3.axisBottom()
  .scale(petal_length_scale);

  // draw y axis
  var petal_y_axis = d3.axisLeft()
  .scale(petal_width_scale);

  svg.append('g')
  .attr('class', 'x_axis')
  .attr('transform', `translate(${padding*2},${scatterplot_size + padding*3})`)
  .call(sepal_x_axis);

  svg.append('g')
  .attr('class', 'y_axis')
  .attr('transform', `translate(${padding*2},${padding*3})`)
  .call(sepal_y_axis);

  svg.append('g')
  .attr('class', 'x_axis')
  .attr('transform', `translate(${scatterplot_size + 4*padding},${scatterplot_size + 3*padding})`)
  .call(petal_x_axis);

  svg.append('g')
  .attr('class', 'y_axis')
  .attr('transform', `translate(${scatterplot_size + 4*padding},${3*padding})`)
  .call(petal_y_axis);

  var sepal_points = sepal_scatterplot.selectAll('circle').data(iris_data);
  var petal_points = petal_scatterplot.selectAll('circle').data(iris_data);

  // draw sepal points
  sepal_points.enter()
  .append("circle")
  .attr("fill", function(d)
  {
    return legendColor(d.class);
  })
  .merge(sepal_points)
  .attr("cx", function(d)
  {
    return sepal_length_scale(d.sepal_length);
  })
  .attr("cy", function(d)
  {
    return sepal_width_scale(d.sepal_width);
  })
  .attr("r", scatterpoint_radius);

  // draw petal points
  petal_points.enter()
  .append("circle")
  .attr("fill", function(d)
  {
    return legendColor(d.class);
  })
  .merge(petal_points)
  .attr("cx", function(d)
  {
    return petal_length_scale(d.petal_length);
  })
  .attr("cy", function(d)
  {
    return petal_width_scale(d.petal_width);
  })
  .attr("r", scatterpoint_radius);
}


function assign_brush_events(){
  var circles = svg.selectAll('circle');
  var brush = d3.brush()
    .extent([[0, 0], [scatterplot_size, scatterplot_size]])
    .on('start', brushstarted)
    .on('brush', brushed)
    .on('end', brushend);
  sepal_scatterplot.call(brush);
  petal_scatterplot.call(brush);

  var selecting_scatterplot;

  function brushstarted(){
    if (selecting_scatterplot !== this) 
    {
      d3.select(selecting_scatterplot).call(brush.move, null);
    }
    selecting_scatterplot = this;
  }

  function brushed(){
    if (d3.event.selection === null) return;
    var [[x0, y0], [x1, y1]] = d3.event.selection;

    if (selecting_scatterplot.attributes['class'].value=='sepal_group')
    {
        circles.classed("hidden", function(d)
        {
          return x0 > sepal_length_scale(d.sepal_length)
          || x1 < sepal_length_scale(d.sepal_length)
          || y0 > sepal_width_scale(d.sepal_width) 
          || y1 < sepal_width_scale(d.sepal_width);
        })
    }
    
    if (selecting_scatterplot.attributes['class'].value=='petal_group')
    {
        circles.classed("hidden", function(d)
        {
          return x0 > petal_length_scale(d.petal_length)
          || x1 < petal_length_scale(d.petal_length)
          || y0 > petal_width_scale(d.petal_width) 
          || y1 < petal_width_scale(d.petal_width);
        })
    }
  }

  function brushend(){
    if (d3.event.selection !== null) return;
    circles.classed("hidden", false);
  }
}

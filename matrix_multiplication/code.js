
const padding = 30;
const matrix_point_radius = 5;
const matrix_selected_radius = 10;
const inner_size = 350 - padding
const matrix_size = 350 + 2*matrix_point_radius;
const memory_line = 40;
const memory_padding = 10;
const svg_width = matrix_size*4 + padding*6;
const svg_height = matrix_size + padding*3 + memory_line *3 + memory_padding*4;
const memory_width = svg_width-padding*2;
const circle_selected_color = 'red';
const circle_deselected_color = 'black';

var n;
var m;
var p;
var data_a;
var data_b;
var data_c;
var memory_data;
var naive_data;
var trans_data;
var tile_data;
var index_1 = 0; 
var index_2 = 0;
var index_3 = 0;
var playing = false;
var naive = true;

// draw svg canvas
var svg = d3.select('#svg_chart').append('svg')
  .attr('width', svg_width)
  .attr('height', svg_height)
  .style("background", "#E5EDB5");

// draw input matrix A 
var matrix_1 = svg.append('rect')
  .attr('fill', '#e5d8d2')
  .attr('stroke', 'black')
  .attr('x', padding)
  .attr('y', padding)
  .attr('width', matrix_size)
  .attr('height', matrix_size);

// draw input matrix B
var matrix_2 = svg.append('rect')
  .attr('fill', '#90c890')
  .attr('stroke', 'black')
  .attr('x', matrix_size + padding*2)
  .attr('y', padding)
  .attr('width', matrix_size)
  .attr('height', matrix_size);

// draw output matrix C
var matrix_3 = svg.append('rect')
  .attr('fill', '#9ad3be')
  .attr('stroke', 'black')
  .attr('x', matrix_size*2 + padding*3)
  .attr('y', padding)
  .attr('width', matrix_size)
  .attr('height', matrix_size);

// draw line graph
var line_graph = svg.append('rect')
.attr('fill', 'none')
.attr('stroke', 'black')
.attr('x', matrix_size*3 + padding*5)
.attr('y', padding)
.attr('width', matrix_size)
.attr('height', matrix_size);

var memory_group = svg.append("g")
  .attr("transform", "translate(" + padding + ", " + (matrix_size + padding*3) + ")");

// draw memory view of matrix A
var memory_1 = memory_group.append('rect')
  .attr('fill', '#e5d8d2')
  .attr('stroke', 'black')
  .attr('width', memory_width)
  .attr('height', memory_line);

// draw memory view of matrix B
var memory_2 = memory_group.append('rect')
  .attr('fill', '#90c890')
  .attr('stroke', 'black')
  .attr('y', memory_line + memory_padding)
  .attr('width', memory_width)
  .attr('height', memory_line);

// draw memory view of matrix C
var memory_3 = memory_group.append('rect')
  .attr('fill', '#9ad3be')
  .attr('stroke', 'black')
  .attr('y', memory_line*2 + memory_padding*2)
  .attr('width', memory_width)
  .attr('height', memory_line);

// the group of matrix title
var name_group = svg.append("g")
  .attr("transform", "translate(0, " + padding*2/3 + ")");

// add title of matrix A 
var matrix_a_name =  name_group.append("text")
  .attr("class", "matrix_name")
  .attr("x", matrix_size/2 + padding);

// add title of matrix B
var matrix_b_name = name_group.append("text")
  .attr("class", "matrix_name")
  .attr("x", matrix_size*3/2 + padding*2);

// add title of matrix C
var matrix_c_name = name_group.append("text")
  .attr("class", "matrix_name")
  .attr("x", matrix_size*5/2 + padding*3);

name_group.append("text")
  .attr("class", "matrix_name")
  .attr("x", matrix_size*7/2 + padding*5)
  .text("Graph View");

svg.append("text")
  .attr("class", "symbol")
  .attr("x", matrix_size + padding*3/2)
  .attr("y", matrix_size/2 + padding)
  .text("X");

svg.append("text")
  .attr("class", "symbol")
  .attr("x", matrix_size*2 + padding*5/2)
  .attr("y", matrix_size/2 + padding)
  .text("=");

svg.append("text")
  .attr("class", "matrix_name")
  .attr("x", matrix_size*2 + padding*2)
  .attr("y", matrix_size + padding*5/2)
  .text("Memory View");

//  the group of memory name
var memory_name = svg.append("g")
  .attr("transform", "translate( " + padding/2 + ", " + (matrix_size + padding*4) + ")");

memory_name.append("text")
  .attr("class", "mem_name")
  .text("A:");

memory_name.append("text")
  .attr("class", "mem_name")
  .attr("y", memory_line + memory_padding)
  .text("B:");

memory_name.append("text")
  .attr("class", "mem_name")
  .attr("y", memory_line*2 + memory_padding*2)
  .text("C:");

// matrix A canvas
var matrix_A_plot = svg.append('g')
  .attr('class', 'matrix_a')
  .attr('transform', `translate(${padding*3/2 + matrix_point_radius}, ${padding*3/2 + matrix_point_radius})`);

// matrix B canvas
var matrix_B_plot = svg.append('g')
.attr('class', 'matrix_b')
.attr('transform', `translate(${padding*5/2 + matrix_point_radius + matrix_size}, ${padding*3/2 + matrix_point_radius})`);

// matrix C canvas
var matrix_C_plot = svg.append('g')
.attr('class', 'matrix_c')
.attr('transform', `translate(${padding*7/2 + matrix_point_radius + matrix_size*2}, ${padding*3/2 + matrix_point_radius})`);


var memory_a_plot = svg.append('g')
  .attr('class', 'memory_plot')
  .attr('transform', `translate(${padding}, ${matrix_size + padding*3})`);

var memory_b_plot = svg.append('g')
  .attr('class', 'memory_plot')
  .attr('transform', `translate(${padding}, ${matrix_size + padding*3 + memory_line + memory_padding})`);

var memory_c_plot = svg.append('g')
  .attr('class', 'memory_plot')
  .attr('transform', `translate(${padding}, ${matrix_size + padding*3 + memory_line*2 + memory_padding*2})`);

var options = ["naive", "transpose"];

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

  var value = d3.select("#drop_down").property("value");
  if (value == "naive")
  {
    naive = true;
    naive_line.attr("stroke-width", 8);
    trans_line.attr("stroke-width", 3);
  }
  else
  {
    naive = false;
    naive_line.attr("stroke-width", 3);
    trans_line.attr("stroke-width", 8);
    // draw_path(trans_data, "red");
    // draw_line_points(trans_data, "red");
  }

  matrix_dimension();
});

// Show initial data
matrix_dimension();
var n_max = d3.select("#slider_a").property("max");
var m_max = d3.select("#slider_b").property("max");
var p_max = d3.select("#slider_c").property("max");

memory_data = genetate_memory_data(Math.max(n_max, m_max), Math.max(m_max, p_max));

draw_rects(memory_a_plot, memory_data);
draw_rects(memory_b_plot, memory_data);
draw_rects(memory_c_plot, memory_data);

naive_data = [{n: 8, t: 0.000002}, {n: 16, t: 0.000005}, {n: 32, t: 0.000027},
{n: 64, t: 0.000290}, {n: 128, t: 0.002940}, {n: 256, t: 0.022553},
{n: 512, t: 0.230215}, {n: 1024, t: 2.554016}];

trans_data = [{n: 8, t: 0.000002}, {n: 16, t: 0.000004}, {n: 32, t: 0.000020},
{n: 64, t: 0.000181}, {n: 128, t: 0.001196}, {n: 256, t: 0.009720},
{n: 512, t: 0.054822}, {n: 1024, t: 0.466939}];

tile_data = [{n: 8, t: 0.000002}, {n: 16, t: 0.000005}, {n: 32, t: 0.000021},
{n: 64, t: 0.000202}, {n: 128, t: 0.001385}, {n: 256, t: 0.009276},
{n: 512, t: 0.062605}, {n: 1024, t: 0.580777}];

var line_options = ["naive", "transpose", "tile"];
var legendColor = d3.scaleOrdinal(["blue", "red", "green"]);

// legend group
var legend_group = svg.append("g")
  .attr("transform", "translate(" + (matrix_size*3 + padding*6) + "," + padding*2 + ")");

// contient legend
line_options.forEach(function(item, index)
{
  var legends = legend_group.append("g")
    .attr("transform", "translate(0, " + (index * 20) + ")");

  legends.append("text")
  .text(item)
  .attr("x", 20)
  .attr("y", 10)
  .attr("text-anchor", "start")
  .style("text-transform", "capitalize")
  .style("font-size", "15px")

  legends.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", legendColor(item));
});

// generate matrix data
function genetate_matrix(row, column)
{
  var mattix_points = [];
  var row_step = inner_size/(row-1);
  var column_step = inner_size/(column-1);
  for(var i = 0; i < row; i++)
  {
     for(var j = 0; j < column; j++)
     {
        mattix_points.push({x: j*column_step, y: i*row_step});
     }
  }
  return mattix_points;
}

// generate matrix data
function genetate_memory_data(row, column)
{
  var memory_data = [];
  var step = memory_width/(row*column);
  for(var i = 0; i < row*column; i++)
  {
    memory_data.push({x: i*step, width: step});
  }

  return memory_data;
}

var x_scale = d3.scaleLog()
  .base(2)
  .domain([7, 1300])
  .range([0, matrix_size]);

var y_scale = d3.scaleLinear()
  .domain([0, 2.560000])
  .range([matrix_size, 0]);

var x_axis = d3.axisBottom(x_scale)
  .tickValues([8, 16, 32, 64, 128, 256, 512, 1024]);

// setting y axis values (life expectancy)
var y_axis = d3.axisLeft(y_scale)
  .tickFormat(function(d) {return +d});

var graph_group = svg.append('g')
  .attr('transform', `translate(${matrix_size*3 + padding*5}, ${padding})`);

graph_group.append('g')
  .attr("class", "axis")
  .attr("text-anchor", "middle")
  .attr("transform", "translate(0 " + matrix_size + ")")
  .call(x_axis)
  .selectAll("text");

graph_group.append('g')
  .call(y_axis)
  .attr("class", "axis");

graph_group.append("text")
  .attr("class", "axis_label")
  .attr("x", matrix_size/2)
  .attr("y", matrix_size + padding)
  .attr("text-anchor", "middle")
  .text("Matrix size(N)");

graph_group.append("text")
  .attr("class", "axis_label")
  .attr("x", -(matrix_size/2))
  .attr("y", -(padding))
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Time(s)");


var tip = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);


function draw_bars(d, color, bar_x)
{
  var points_update = graph_group.selectAll('circle').data(d);

  points_update.enter()
    .append("rect")
    .merge(points_update)
    .attr("x", function(d) { return x_scale(d.n) + bar_x; })
    .attr("y", function(d) { return y_scale(d.t); })
    .attr("width", 10)
    .attr("height", function(d) { return matrix_size - y_scale(d.t); })
    .attr("fill", color)
    .on("mouseover", function(d)
      {
        d3.select(this).style("stroke", "black")
        .style("stroke-width", "5px");

        tip.transition()
          .duration(200)
        tip.style("opacity", .8);
        tip.html("N: " + d.n + "<br/>" + "Time: " + d.t)
          .style("left", (d3.event.pageX -120) + "px")
          .style("top", (d3.event.pageY - 30) + "px");

      })
    .on("mouseout", function(d){
      d3.select(this).style("stroke-width", "0px")

      tip.transition()    
        .duration(500)    
        .style("opacity", 0); 
    });
}

draw_bars(trans_data, "red", -15);
draw_bars(tile_data, "green", -5);
draw_bars(naive_data, "blue", 5);

var line_1 = d3.line()
    .x(function(d) { return x_scale(d.n) - 10; }) 
    .y(function(d) { return y_scale(d.t); }) 
    .curve(d3.curveMonotoneX); 

var line_2 = d3.line()
    .x(function(d) { return x_scale(d.n) + 5; }) 
    .y(function(d) { return y_scale(d.t); }) 
    .curve(d3.curveMonotoneX); 

var trans_line = graph_group.append("path")
  .attr("d", line_1(trans_data))
  .attr("stroke", "black")
  .attr("stroke-width", 3)
  .attr("fill", "none")
  .on("mouseover", function(d)
  {
    tip.transition()
          .duration(200)
        tip.style("opacity", .8);
        tip.html("Transpose Method")
          .style("left", (d3.event.pageX -120) + "px")
          .style("top", (d3.event.pageY - 30) + "px");
  })
  .on("mouseout", function(d){

    tip.transition()    
      .duration(500)    
      .style("opacity", 0); 
  });

var naive_line = graph_group.append("path")
  .attr("d", line_2(naive_data))
  .attr("stroke", "black")
  .attr("stroke-width", 8)
  .attr("fill", "none")
  .on("mouseover", function(d)
  {
    tip.transition()
          .duration(200)
        tip.style("opacity", .8);
        tip.html("Naive Method")
          .style("left", (d3.event.pageX -120) + "px")
          .style("top", (d3.event.pageY - 30) + "px");
  })
  .on("mouseout", function(d){
    tip.transition()    
      .duration(500)    
      .style("opacity", 0); 
  });


// draw circles of matrixes
function draw_points(plot_group, data)
{
  var points_update = plot_group.selectAll('circle').data(data);
  var trans = d3.transition().duration(300);

  // Exit 
  points_update.exit().attr("class", "exit")
    .remove();

  // Enter
  points_update.enter()
    .append("circle")
    .merge(points_update)
    .attr("fill", circle_deselected_color)
    .attr('stroke', 'black')
    .transition(trans)
    .attr("class", "circle")
    .attr("cx", function(d)
    {
      return d.x;
    })
    .attr("cy", function(d)
    {
      return d.y;
    })
    .attr("r", matrix_point_radius);
}

function draw_rects(plot_group, data)
{
  var rect_update = plot_group.selectAll('rect').data(data);
  var trans = d3.transition().duration(300);

  // Exit 
  rect_update.exit().attr("class", "exit")
    .remove();

  rect_update.enter()
    .append("rect")
    .merge(rect_update)
    .transition(trans)
    .attr("fill", "none")
    .attr('stroke', 'black')
    .attr('x', function(d)
    {
      return d.x;
    })
    .attr('width', function(d)
    {
      return d.width;
    })
    .attr('height', memory_line);
}

// sliders for n, m, p
d3.select("#slider_a").on("input", matrix_dimension);
d3.select("#slider_b").on("input", matrix_dimension);
d3.select("#slider_c").on("input", matrix_dimension);

// change dimension while changing the n, m, p
function matrix_dimension()
{
  n = d3.select("#slider_a").property("value");
  m = d3.select("#slider_b").property("value");
  p = d3.select("#slider_c").property("value");

  index_1 = 0;
  index_2 = 0;
  index_3 = 0;

  data_a = genetate_matrix(n, m);
  if (naive)
  {
    data_b = genetate_matrix(m, p);
    matrix_b_name.text("Matrix B: (M x P): [ " + m + " x " + p + " ]");
  }
  else
  {
    data_b = genetate_matrix(p, m);
    matrix_b_name.text("Transpose Matrix B: (P x M): [ " + p + " x " + m + " ]");
  }
  
  data_c = genetate_matrix(n, p);

  draw_points(matrix_A_plot, data_a);
  draw_points(matrix_B_plot, data_b);
  draw_points(matrix_C_plot, data_c);
 
  matrix_a_name.text("Matrix A: (N x M): [ " + n + " x " + m + " ]");
  matrix_c_name.text("Matrix C: (N x P): [ " + n + " x " + p + " ]");

  memory_c_plot.selectAll('rect')
  .transition().duration(300)
  .attr("fill", "none");
}

function play()
{
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

function step()
{ 
  if (playing)
    setTimeout(step, 800);

  flash();
  index_3 = (index_3 < (n*p)-1) ? index_3 + 1 : 0;
  index_2 = (index_2 < (p-1)) ? index_2 + 1 : 0;
  
  if(index_2 == 0)
  {
    index_1 = (index_1 < (n-1)) ? index_1 + 1 : 0; 
  }

  if (index_3 == 0)
  {
    matrix_C_plot.selectAll('circle')
    .transition().delay(300)
    .attr("fill", circle_deselected_color)
    .attr("r", matrix_point_radius);

    memory_c_plot.selectAll('rect')
    .transition().delay(300)
    .attr("fill", "none");
  }
}

function flash()
{
  var trans = d3.transition().duration(300);

  var circles_a = matrix_A_plot.selectAll('circle');
  var circles_b = matrix_B_plot.selectAll('circle');
  var circles_c = matrix_C_plot.selectAll('circle');

  var rects_a = memory_a_plot.selectAll('rect');
  var rects_b = memory_b_plot.selectAll('rect');
  var rects_c = memory_c_plot.selectAll('rect');

  filter_shape(circles_a, circles_b, 0);

  circles_c.filter(function(d, i)
  {
    return i == index_3;
  })
  .transition(trans)
  .attr("fill", "green")
  .attr("r", matrix_selected_radius)

  filter_shape(rects_a, rects_b, 1);

  rects_c.filter(function(d, i)
  {
    return i == index_3;
  })
  .transition(trans)
  .attr("fill", "green")
}

function filter_shape(shape_1, shape_2, flag)
{
  var s1 = shape_1.filter(function(d, i)
  {
    return (Math.floor(i/m)) == index_1;
  });

  var s2 = shape_2.filter(function(d, i)
  {
    if (naive)
    {
      return (Math.floor(i%p)) == index_2 && i < m*p;
    }
    else
    {
      return (Math.floor(i/m)) == index_2;
    }
  });

  if (flag == 0)
  {
    point_flash(s1);
    point_flash(s2);
  }
  else
  {
    rect_flash(s1);
    rect_flash(s2);
  }
}

function point_flash(circle)
{
  var trans = d3.transition().duration(300);

  circle.transition(trans)
  .attr("fill", circle_selected_color)
  .attr("r", matrix_selected_radius)
  .transition(trans)
  .attr("fill", circle_deselected_color)
  .attr("r", matrix_point_radius);
}

function rect_flash(rects)
{
  var trans = d3.transition().duration(300);
  rects.transition(trans)
  .attr("fill", circle_selected_color)
  .transition(trans)
  .attr("fill", "none");
}

// reset function
function reset()
{
    window.location.reload();
}

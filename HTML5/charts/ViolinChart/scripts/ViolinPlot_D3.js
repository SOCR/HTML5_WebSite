
PLOT_COUNT= 0;
var chart = {w:0};
var pNum = 0; 
data =[];
function chartData(){

  updateCoord();
  var seriesData = ViolinData();
var series = [];
for(var i =0; i<seriesData.series.length;i++){
  data[i] = seriesData.series[i];
}

PLOT_COUNT = data.length;
var tWidth = $('td#dataTd').width();
chart.rowWidth = (chart.rowWidth==undefined) ? tWidth/chart.totalCols : chart.rowWidth;
chart.w = $(window).width() - chart.rowWidth*(chart.totalCols+1) -80;
chart.w /=PLOT_COUNT;
chart.h = $(window).height()-80;
chart.minX = seriesData.minX;
chart.minY = seriesData.minY;
chart.maxX = seriesData.maxX;
chart.maxY = seriesData.maxY;
chart.rangeX  = seriesData.maxX - seriesData.minX;
chart.m = [30, 80, 30, 80];//m[1] is for left, m[3] is for right, m[0] is for top, m[2] is for bottom

}
function initVPlot(){
chartData();
var m = chart.m;
var xRDom = chart.maxX+chart.rangeX*(PLOT_COUNT-1);
chart.x = d3.scale.linear()
.domain([chart.minX, xRDom])
.range([0, chart.w*PLOT_COUNT]);

chart.y = d3.scale.linear()
.domain([chart.minY, chart.maxY])
.range([chart.h, 0]);

chart.line = d3.svg.line()
.x(function(d,i) {
return chart.x(d[1] + chart.rangeX*pNum);
})
.y(function(d,i) {
return chart.y(d[0]);
})
chart.graph = d3.select("#graph").append("svg:svg")
.attr("width", (chart.w*PLOT_COUNT + m[1] + m[3]))
.attr("height", chart.h + m[0] + m[2])
.append("svg:g")
.attr("transform", "translate(" + m[3] + "," + m[0] + ")");
var divWid = $('div#graph').width();
chart.path = [];
chart.yAxisLeft = d3.svg.axis().scale(chart.y).tickSize(-divWid+m[1]).ticks(4).orient("left");

var xTicks = [];
var dPos =0;
for(var i =0;i<PLOT_COUNT;i++){
  dPos = 3*i;
  xTicks[dPos] = chart.minX+ chart.rangeX*i;
  xTicks[dPos+1] = chart.rangeX*i;
  xTicks[dPos+2] = chart.maxX+ chart.rangeX*i;
}
chart.xAxis  = d3.svg.axis().scale(chart.x).tickSize(-chart.h).tickValues(xTicks);

	chart.graph.append("svg:g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + chart.h + ")")
	.call(chart.xAxis);

// Add the y-axis to the left
chart.graph.append("svg:g")
.attr("class", "y axis")
.attr("transform", "translate(-25,0)")
.call(chart.yAxisLeft);

chart.graph.append("rect")
    .attr("width", divWid-m[1])
    .attr("height", chart.h)
    .attr("transform", "translate(-25,0)");
	
  for(var i =0; i<cols.length; i++){

	chart.path[i] = chart.graph.append("svg:path").attr("d", chart.line(data[i]));
		pNum++;
	}

var tPos = $('div#graph').width();

$('#dataTd').css('left',tPos);
$('#dataTd').css('position', 'absolute');
PLOT_COUNT = pNum;

chart.meanSyb =[];
chart.medSyb = [];
chart.qtile1Syb =[];
chart.qtile3Syb = [];

var sdPos = [];
for(var i =0; i<chart.mean.length;i++){
  sdPos[i] = chart.mean[i] + 2*chart.sd[i];

  chart.meanSyb[i] =
  chart.graph.append("svg:path")
    .attr("class", "mean")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.mean[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('cross'));
  
  chart.qtile3Syb[i] =
  chart.graph.append("svg:path")
    .attr("class", "qtile3")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.qtile3[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('triangle-up'));

  chart.qtile1Syb[i] =
    chart.graph.append("svg:path")
    .attr("class", "qtile1")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.qtile1[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('triangle-down'));

  chart.medSyb[i] =
    chart.graph.append("svg:path")
    .attr("class", "qtile1")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.med[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('square'));
  }
}

function redraw(update){
  pNum =0;
    chart.path = [];
  var nCols = 0;
   $('svg').remove();
  if(typeof(update) != 'undefined'){
    chartData();
    nCols = cols.length;
  }
  else{
    nCols = PLOT_COUNT;
  }
  PLOT_COUNT = nCols;
  var tWidth = $('td#dataTd').width();
  chart.rowWidth = (chart.rowWidth==undefined) ? tWidth/chart.totalCols : chart.rowWidth;
  chart.w = $(window).width() - chart.rowWidth*(chart.totalCols+1) -80;
   chart.w /=PLOT_COUNT;
   chart.h = $(window).height()-80;
   var tRangeX = (seriesData.maxX+chart.rangeX*(nCols-1));
var m = chart.m;
var xRDom = chart.maxX+chart.rangeX*(PLOT_COUNT-1);
chart.x = d3.scale.linear()
.domain([chart.minX, xRDom])
.range([0, chart.w*PLOT_COUNT]);

chart.y = d3.scale.linear()
.domain([chart.minY, chart.maxY])
.range([chart.h, 0]);

chart.line = d3.svg.line()
.x(function(d,i) {
return chart.x(d[1] + chart.rangeX*pNum);
})
.y(function(d,i) {
return chart.y(d[0]);
})

chart.graph = d3.select("#graph").append("svg:svg")
.attr("width", (chart.w*PLOT_COUNT + m[1] + m[3]))
.attr("height", chart.h + m[0] + m[2])
.append("svg:g")
.attr("transform", "translate(" + m[3] + "," + m[0] + ")");
var divWid = $('div#graph').width();
chart.path = [];
chart.yAxisLeft = d3.svg.axis().scale(chart.y).tickSize(-divWid+m[1]).ticks(4).orient("left");


var xTicks = [];
var dPos =0;
for(var i =0;i<PLOT_COUNT;i++){
  dPos = 3*i;
  xTicks[dPos] = chart.minX+ chart.rangeX*i;
  xTicks[dPos+1] = chart.rangeX*i;
  xTicks[dPos+2] = chart.maxX+ chart.rangeX*i;
}
chart.xAxis  = d3.svg.axis().scale(chart.x).tickSize(-chart.h).tickValues(xTicks);

  chart.graph.append("svg:g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + chart.h + ")")
  .call(chart.xAxis);

// Add the y-axis to the left
chart.graph.append("svg:g")
.attr("class", "y axis")
.attr("transform", "translate(-25,0)")
.call(chart.yAxisLeft);

chart.graph.append("rect")
    .attr("width", divWid-m[1])
    .attr("height", chart.h)
    .attr("transform", "translate(-25,0)");

   // Add the line by appending an svg:path element with the data line we created above
// do this AFTER the axes above so that the line is above the tick-lines
  
  for(var i =0; i<cols.length; i++){

  chart.path[i] = chart.graph.append("svg:path").attr("d", chart.line(data[i]));
    pNum++;
  }
  
var tPos = $('div#graph').width();

$('#dataTd').css('left',tPos);
$('#dataTd').css('position', 'absolute');
PLOT_COUNT = pNum;

chart.meanSyb =[];
chart.medSyb = [];
chart.qtile1Syb =[];
chart.qtile3Syb = [];

var sdPos = [];
for(var i =0; i<chart.mean.length;i++){
  sdPos[i] = chart.mean[i] + 2*chart.sd[i];

  chart.meanSyb[i] =
  chart.graph.append("svg:path")
    .attr("class", "mean")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.mean[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('cross'));
  
  chart.qtile3Syb[i] =
  chart.graph.append("svg:path")
    .attr("class", "qtile3")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.qtile3[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('triangle-up'));

  chart.qtile1Syb[i] =
    chart.graph.append("svg:path")
    .attr("class", "qtile1")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.qtile1[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('triangle-down'));

  chart.medSyb[i] =
    chart.graph.append("svg:path")
    .attr("class", "qtile1")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.med[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('square'));
  }

}

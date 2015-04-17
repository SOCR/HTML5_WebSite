
PLOT_COUNT= 0;//number of plots global. updated less frequently than pNum
var chart = {w:0};
var pNum = 0; //number of plots currently present
data =[];
function chartData(){
  //var val = $('#updateCol').value();
  updateCoord();
  var seriesData = ViolinData(chart);
//var max = seriesData.max,
//var min = seriesData.min;
var series = [];//seriesData.series[0];
data =[];
for(var i =0; i<seriesData.series.length;i++){
  data[i] = seriesData.series[i];
}

PLOT_COUNT = data.length;
chart.tWidth = $('td#dataTd').width();
var bWidth = $('td#updateColTd').width();
chart.tWidth = (chart.tWidth > bWidth) ? chart.tWidth : bWidth; 
//doesnt work********
chart.w = $(window).width() - chart.tWidth -80;
chart.w /=PLOT_COUNT;
chart.h = $(window).height()-80;
chart.minX = seriesData.minX;
chart.minY = seriesData.minY;
chart.maxX = seriesData.maxX;
chart.maxY = seriesData.maxY;
chart.rangeX  = seriesData.maxX - seriesData.minX;
chart.m = [30, 80, 30, 80];//1 is for left, 3 is for right, 0 is for top, 2 is for bottom

}
function initVPlot(){
chartData();
var m = chart.m;//[80, 80, 80, 80];
var xRDom = chart.maxX+chart.rangeX*(PLOT_COUNT-1);
chart.x = d3.scale.linear()
.domain([chart.minX, xRDom])
.range([0, chart.w*PLOT_COUNT]);

chart.y = d3.scale.linear()
.domain([chart.minY, chart.maxY])
.range([chart.h, 0]);

// create a line function that can convert data[] into x and y points
chart.line = d3.svg.line()
// assign the X function to plot our line as we wish
.x(function(d,i) {

return chart.x(d[1] + chart.rangeX*pNum);
})
.y(function(d,i) {

return chart.y(d[0]);
})

chart.graph = d3.select("#graph")
  .append("svg:svg")
  .attr("width", (chart.w*PLOT_COUNT + m[1] + m[3]))
  .attr("height", chart.h + m[0] + m[2])
    //.attr("pointer-events", "all")
 // .append('svg:g')
  //  .call(d3.behavior.zoom().on("zoom", resize))
  .append('svg:g')
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

var divWid = $('div#graph').width();
chart.path = [];
chart.yAxisLeft = d3.svg.axis().scale(chart.y).tickSize(-divWid+m[1]).ticks(4).orient("left");

// create yAxis
// get leth of array cols to get length of loop;
var xTicks = [];
var dPos =0;
for(var i =0;i<PLOT_COUNT;i++){
//[chart.minX,chart.rangeX*,chart.maxX,chart.minY,30,chart.maxX]
  dPos = 3*i;
  xTicks[dPos] = chart.minX+ chart.rangeX*i;
  xTicks[dPos+1] = chart.rangeX*i;
  xTicks[dPos+2] = chart.maxX+ chart.rangeX*i;
}
chart.xAxisGen  = d3.svg.axis().scale(chart.x).tickSize(-chart.h).tickValues(xTicks);

chart.xAxis =	chart.graph.append("svg:g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + chart.h + ")")
	.call(chart.xAxisGen);

// create left yAxis

// Add the y-axis to the left
chart.yAxis =
chart.graph.append("svg:g")
.attr("class", "y axis")
.attr("transform", "translate(-25,0)")
.call(chart.yAxisLeft);

chart.rect = 
chart.graph.append("rect")
    .attr("width", divWid-m[1])
    .attr("height", chart.h)
    .attr('fill', 'white')
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
var first =true;
function resize(){
  var trans = d3.event.translate;
  if(first){
  trans[0]+=chart.m[3];
  trans[1]+=chart.m[0];
  first =false;
  }
  chart.graph.attr("transform",
      "translate(" + trans+ ")"
      + " scale(" + d3.event.scale + ")");
}
function redraw(update){

  pNum =0;
   // chart.path = [];
  var nCols = 0;
   //$('svg').remove();
   var oldPCount = PLOT_COUNT;
  if(typeof(update) != 'undefined'){
    chartData();
    nCols = cols.length;
  }
  else{

    nCols = PLOT_COUNT;
  }
  chart.tWidth = $('td#dataTd').width();
  var bWidth = $('td#updateColTd').width();
  chart.tWidth = (chart.tWidth > bWidth) ? chart.tWidth : bWidth; 
  chart.w = $(window).width() - chart.tWidth -80;
   chart.w /=PLOT_COUNT;
   chart.h = $(window).height()-80;
   var tRangeX = (seriesData.maxX+chart.rangeX*(nCols-1));
//chartData();
var m = chart.m;//[80, 80, 80, 80];
var xRDom = chart.maxX+chart.rangeX*(PLOT_COUNT-1);
chart.x = d3.scale.linear()
.domain([chart.minX, xRDom])
.range([0, chart.w*PLOT_COUNT]);

chart.y = d3.scale.linear()
.domain([chart.minY, chart.maxY])
.range([chart.h, 0]);

// create a line function that can convert data[] into x and y points
chart.line = d3.svg.line()
// assign the X function to plot our line as we wish
.x(function(d,i) {

return chart.x(d[1] + chart.rangeX*pNum);
})
.y(function(d,i) {

return chart.y(d[0]);
})

/*chart.graph 
  .transition()
  .attr("width", (chart.w*PLOT_COUNT + m[1] + m[3]))
  .attr("height", chart.h + m[0] + m[2])
 //   .attr("pointer-events", "all")
 // .append('svg:g')
   // .call(d3.behavior.zoom().on("zoom", resize))
  //.append('svg:g')
  .transition()
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
  */

  $('svg').width(chart.w*PLOT_COUNT + m[1] + m[3]);
  $('svg').height(chart.h + m[0] + m[2]);

var divWid = $('div#graph').width();
//chart.path = [];
chart.yAxisLeft = d3.svg.axis().scale(chart.y).tickSize(-divWid+m[1]).ticks(4).orient("left");

// create yAxis
// get leth of array cols to get length of loop;
var xTicks = [];
var dPos =0;
for(var i =0;i<PLOT_COUNT;i++){
//[chart.minX,chart.rangeX*,chart.maxX,chart.minY,30,chart.maxX]
  dPos = 3*i;
  xTicks[dPos] = chart.minX+ chart.rangeX*i;
  xTicks[dPos+1] = chart.rangeX*i;
  xTicks[dPos+2] = chart.maxX+ chart.rangeX*i;
}
chart.xAxisGen  = d3.svg.axis().scale(chart.x).tickSize(-chart.h).tickValues(xTicks);

  chart.xAxis
  .transition()
  .attr("class", "x axis")
  .attr("transform", "translate(0," + chart.h + ")")
  .call(chart.xAxisGen);

// create left yAxis

// Add the y-axis to the left
chart.yAxis
.transition()
.attr("class", "y axis")
.attr("transform", "translate(-25,0)")
.call(chart.yAxisLeft);

chart.rect
    .transition()
    .attr("width", divWid-m[1])
    .attr("height", chart.h)
    .attr("transform", "translate(-25,0)");

  for(var i =0; i<cols.length; i++){

  chart.path[i]
    .transition()
    .attr("d", chart.line(data[i]));
    pNum++;
  }
   
if(cols.length < oldPCount){
/*  for(var i =0; i<cols.length; i++){

  chart.path[i]
    .transition()
    .attr("d", chart.line(data[i]));
    pNum++;
  }*/
  for(var i =cols.length; i<oldPCount;i++){
    chart.path[i].remove();
  }
}/*
else if(cols.length > oldPCount){
  for(var i =0; i<oldPCount; i++){

  chart.path[i]
    .transition()
    .attr("d", chart.line(data[i]));
    pNum++;
  }
  for(var i =oldPCount-1;i<cols.length){
    chart.path[i] = chart.graph.append("svg:path")
                    .attr("d", chart.line(data[i]));
    pNum++;
  }

}
else if(cols.length == oldPCount){*/
  for(var i =0; i<cols.length; i++){

  chart.path[i]
    .transition()
    .attr("d", chart.line(data[i]));
    pNum++;
  }
//}
var tPos = $('div#graph').width();

$('#dataTd').css('left',tPos);
$('#dataTd').css('position', 'absolute');
PLOT_COUNT = pNum;
for(var i =0; i<chart.mean.length;i++){


  chart.meanSyb[i]
    .transition()
    .attr("class", "mean")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.mean[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('cross'));
  
  chart.qtile3Syb[i]
    .transition()
    .attr("class", "qtile3")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.qtile3[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('triangle-up'));

    chart.qtile1Syb[i]
    .transition()
    .attr("class", "qtile1")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.qtile1[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('triangle-down'));

    chart.medSyb[i]
    .transition()
    .attr("class", "qtile1")
    .attr("transform", "translate(" + chart.x(chart.rangeX*i) + "," + chart.y(chart.med[i]) + ")")
    .attr("d", d3.svg.symbol()
    .type('square'));
  }


}

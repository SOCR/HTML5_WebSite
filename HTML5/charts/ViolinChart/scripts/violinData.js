var cols =[];
   
function getSeries(input_data){
//getSeries - returns the ordered pairs for the outline of the violin plot.
//@param input_data - 1d array of one column of the data input by the user
var kde = science.stats.kde().sample(input_data);
var normalization_value = 5;
var normalization_factor = 300;

var normalize_kde = function(input_kde, factor) {
  var output = [];
  $.each(input_kde.sort(), function(index, value) {
    output[index] = [value[0], value[1] * factor]
  });
  return output;
};
var output_kde = normalize_kde(kde(input_data), normalization_factor);
var test_invert = function(array) {
  var output = new Array();
  var size = array.length - 1;
  $.each(array, function(i, value) {
    output[size-i] = [value[0], -value[1]] 
  })
  return output;
}

var out2_kde = test_invert(output_kde)
out2_kde.push(output_kde[0]);
var outSeries = output_kde.concat(out2_kde);
outData =outSeries;
return outData;
}


function updateCoord(val){
//updateCoords - updates the array which holds the colimns needed to be graphed
  if(val == undefined){
    val = $('input#updateCol').val();
  }
  var tmp = val.split(/[\s,]+/);
  var tmp2 =[];
  var j =0;
  for(var i =0; i<tmp.length;i++){
  if(tmp[i] == '' || isNaN(tmp[i]*1)){
    tmp[i]= tmp[i]*1;
  }
  else{
    tmp2[j] = tmp[i]*1;
    j++;
  }
  }
  cols = tmp2;
}


function ViolinData(graph){
//ViolinData - gives all data needed to graph plot
	updateCoord(); 
	var gridObj = $('#example1grid');
  //data from table
	tmpData = gridObj.handsontable('getData');
  chart.totalCols = tmpData[0].length;
	var dataArray = []; //set of 1d array af cols from table
	for(var i = 0; i<cols.length; i++){
		dataArray[i] = [];
	}
	var x =0;
	var y = 0;
  var setY = false;
	var size = tmpData.length;
	 series = [];
   sum = [];
  chart.mean = [];
	for(var j=0; j<cols.length; j++){
    sum[j] =0;
    var dArrInd =0;
		for(var i=0;i<size;i++){

      if(!isNaN(tmpData[i][cols[j]]*1) && tmpData[i][cols[j]]!=''){
				dataArray[j][dArrInd] = 1*tmpData[i][cols[j]];
        sum[j]+=1*tmpData[i][cols[j]];
        dArrInd++;
			}    
		}
    chart.mean[j] = sum[j]/dataArray[j].length;
	}
	for(var i = 0; i<dataArray.length; i++){
		series[i] = getSeries(dataArray[i]);
	}
  chart.sd = [];
  
  for(var i = 0;i<cols.length;i++){
    chart.sd[i] = 0;
    for(var j = 0; j<dataArray[i].length;j++){
      chart.sd[i] += (dataArray[i][j] - chart.mean[i])*(dataArray[i][j] - chart.mean[i]);
    }
    chart.sd[i]/=dataArray[i].length;
    chart.sd[i] = Math.sqrt(chart.sd[i]);
    
  }
  var maxYInd = Math.round(series[0].length/2);
  var minX = series[0][0][1];
  var maxX = minX*-1;
  var minY = series[0][0][0];
  var maxY = series[0][maxYInd][0];
  
  for(j=0;j<series.length;j++){
    for(var i=0; i<series[j].length;i++){
      if(series[j][i][1] != undefined){
        if(series[j][i][1] < minX){
        minX = series[j][i][1];
        }
      }
      if(series[j][i][0]!= undefined){
        if(series[j][i][0] < minY){
        minY = series[j][i][0];
        }
        if(series[j][i][0]>maxY){
          maxY = series[j][i][0];
        }
      }  
    }
    maxX = minX*-1;
  }

  chart.qtile1 = [];
  chart.qtile3 = [];
  chart.med =[];
  var qtileIndx = 0;

for(var i =0; i<cols.length;i++){
  qtileIndx = Math.round(dataArray[i].length/4);
  chart.qtile1[i] = series[i][qtileIndx][0];
  chart.qtile3[i] = series[i][3*qtileIndx][0];
  chart.med[i] = series[i][2*qtileIndx][0];
}


  var buf = (maxY-minY)*.2;
  maxY = Math.round((maxY + buf)/5)*5;
  minY = Math.round((minY - buf)/5)*5;

  buf = (maxX-minX)*.2;
  maxX = Math.round((maxX + buf)/5)*5;
  minX = Math.round((minX - buf)/5)*5;

  seriesData = {series:series, minX:minX,maxX:maxX,minY:minY,maxY:maxY};

	return seriesData;
}


goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.mesh');
goog.require('X.matrix');
goog.require('X.volume');
goog.require('X.cube');

function initializeRenderers(){
 
  switched = false; 
  if (ren3d) {
    // do this only once
    return;
  }
  
  // create the XTK renderers
  ren3d = new X.renderer3D();
  ren3d.container = '3d';
  ren3d.init();    
  
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();
  
  sliceY = new X.renderer2D();
  sliceY.container = 'sliceY';
  sliceY.orientation = 'Y';
  sliceY.init();  
  
  sliceZ = new X.renderer2D();
  sliceZ.container = 'sliceZ';
  sliceZ.orientation = 'Z';
  sliceZ.init();  

  ren3d.onShowtime = function() {
    
    window.console.log('Loading completed.');
    
// TODO changed    
/*
    window.console.log(volume.labelmap.image);
    
    var k;
						var oned = new Array();
						for (k=0; k<101; k++) {
							oned[k] = 182;
						}
						var twod = new Array();
						for (k=0; k<117; k++) {
							twod[k] = oned;
						}
						var threed = new Array();
						for (k=0; k<106; k++) {
							threed[k] = twod;
						}
    volume.labelmap.image = threed;
    //volume.labelmap.image = null;
    //volume.modified(true);
    //volume.volumeRendering = true;
    //volume.labelmap.modified;
    window.console.log(volume.labelmap.image);
*/
    
    if (_data.volume.file != null) {
      
      // show any volume also in 2d
      sliceX.add(volume);
      sliceY.add(volume);
      sliceZ.add(volume);
      sliceX.render();
      sliceY.render();
      sliceZ.render();
      
    }
    
    setupUi();
    configurator();
    
    // render();
    
  };
  
  ren3d.onRender = function() {
  	
  };
  
  //
  // LINK THE RENDERERS
  //
  // link the 2d renderers to the 3d one by setting the onScroll
  // method. this means, once you scroll in 2d, it upates 3d as well
  var _updateThreeDX = function() {
    if (_data.volume.file != null) {
      jQuery('#yellow_slider').slider("option", "value",volume.indexX);
    }
  };
  
  var _updateThreeDY = function() {
    if (_data.volume.file != null) {
      jQuery('#red_slider').slider("option", "value",volume.indexY);
    }
  };
  var _updateThreeDZ = function() {
    if (_data.volume.file != null) {
      jQuery('#green_slider').slider("option", "value",volume.indexZ);
    }
  };
  
  sliceX.onScroll = _updateThreeDX;
  sliceY.onScroll = _updateThreeDY;
  sliceZ.onScroll = _updateThreeDZ;  
  
};

function createData() {
  

  // we support here max. 1 of the following
  //
  // volume (.nrrd,.mgz,.mgh)
  // labelmap (.nrrd,.mgz,.mgh)
  // colortable (.txt,.lut)
  // mesh (.stl,.vtk,.fsm,.smoothwm,.inflated,.sphere,.pial,.orig)
  // scalars (.crv)
  // fibers (.trk)
  
  //
  // the data holder for the scene
  // includes the file object, file data and valid extensions for each object
  _data = {
   'volume': {
     'file': null,
     'filedata': null,
     'extensions': ['NRRD', 'MGZ', 'MGH', 'NII', 'GZ', 'IMG']
   },
   'volhdr': {
     'file': null,
     'filedata': null,
     'extensions': ['HDR']
   },
   'labelmap': {
     'file': null,
     'filedata': null,
     'extensions': ['NRRD', 'MGZ', 'MGH']
   },
   'colortable': {
     'file': null,
     'filedata': null,
     'extensions': ['TXT', 'LUT']
   },
   'mesh': {
     'file': null,
     'filedata': null,
     'extensions': ['STL', 'VTK', 'FSM', 'SMOOTHWM', 'INFLATED', 'SPHERE',
                    'PIAL', 'ORIG', 'DX']
   },
   'scalars': {
     'file': null,
     'filedata': null,
     'extensions': ['CRV']
   },
   'fibers': {
     'file': null,
     'filedata': null,
     'extensions': ['TRK']
   },
  };  
  
}

//
// Reading files using the HTML5 FileReader.
//
function read(files) {
    
  createData();
  
  for ( var i = 0; i < files.length; i++) {
   
   var f = files[i];
   var _fileName = f.name;
   var _fileExtension = _fileName.split('.').pop().toUpperCase();
   var _fileSize = f.size;
   
   // check which type of file it is
   if (_data['volume']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this can be either the volume or the labelmap
     
     // if we already have a volume, check if the current one is smaller
     // then, set it as a label map, else wise switch them
     if (_data['volume']['file']) {
       
       if (_data['volume']['file'].size < _fileSize) {
         // switcharoo
         _data['labelmap']['file'] = _data['volume']['file'];
         _data['volume']['file'] = f;
         
       } else {
         
         _data['labelmap']['file'] = f;
         
       }
       
     } else {
       
       // no volume yet
       _data['volume']['file'] = f;
       
     }
     
  
   } else if (_data['volhdr']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a scalars file
     _data['volhdr']['file'] = f;
     
   } else if (_data['colortable']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a color table
     _data['colortable']['file'] = f;
     
   } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a mesh
     _data['mesh']['file'] = f;
     
   } else if (_data['scalars']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a scalars file
     _data['scalars']['file'] = f;
     
   } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a fibers file
     _data['fibers']['file'] = f;
     
   }
   
  }

  // we now have the following data structure for the scene
  window.console.log('New data', _data);
  
  var _types = Object.keys(_data);
  
  // number of total files
  var _numberOfFiles = files.length;
  var _numberRead = 0;
  window.console.log('Total new files:', _numberOfFiles);
  
  //
  // the HTML5 File Reader callbacks
  //
  
  // setup callback for errors during reading
  var errorHandler = function(e) {
  
   console.log('Error:' + e.target.error.code);
   
  };
  
  // setup callback after reading
  var loadHandler = function(type) {
  
   return function(e) {
  
     // reading complete
     var data = e.target.result;
     /*
     var base64StartIndex = data.indexOf(',') + 1;
     data = window.atob(data.substring(base64StartIndex));
*/
     
     // attach the data to our scene
     _data[type]['filedata'] = data;
     
     if (type == "mesh") {
     window.console.log(data.toString());
     }
     
     _numberRead++;
     if (_numberRead == _numberOfFiles) {
       
       // all done, start the parsing
       parse(_data);
       
     }
   };
  };


  //
  // start reading
  //
  _types.forEach(function(v) {
  
   if (_data[v]['file']) {
     
     var reader = new FileReader();
     
     reader.onerror = errorHandler;
     reader.onload = (loadHandler)(v); // bind the current type
     
     // start reading this file
     reader.readAsArrayBuffer(_data[v]['file']);
   }
   
  });

};

//
// Parse file data and setup X.objects
//
function parse(data) {
  
  // initialize renderers
  initializeRenderers();
  
  if (data['volume']['file']) {
   
   // we have a volume
   volume = new X.volume();
   volume.file = data['volume']['file'].name;
   volume.filedata = data['volume']['filedata'];
   
   if (data['volhdr']['file']) {
   	 volume.hdrfile = data['volhdr']['file'].name;
   	 volume.hdrfiledata = data['volhdr']['filedata'];
   }
   
   var colortableParent = volume;
   
   if (data['labelmap']['file']) {
     
     // we have a label map
     volume.labelmap.file = data['labelmap']['file'].name;
     volume.labelmap.filedata = data['labelmap']['filedata'];
     colortableParent = volume.labelmap;
     
   } else {
   	 //volume.labelmap.file = 'data/label_blank.nii.gz'; 
   	 ren3d._needsBlankLabel = true;
   }
   
   if (data['colortable']['file']) {
     
     // we have a color table
     colortableParent.colortable.file = data['colortable']['file'].name;
     colortableParent.colortable.filedata = data['colortable']['filedata'];
     
   } else {
   	 //volume.labelmap.colortable.file = 'data/colormap.txt';
   }
   
   // add the volume
   ren3d.add(volume);
    
    
   ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
   
  }
  
  if (data['mesh']['file']) {
   
   // we have a mesh
   mesh = new X.mesh();
   mesh.file = data['mesh']['file'].name;
   mesh.filedata = data['mesh']['filedata'];
   
   mesh.transform.matrix = new X.matrix(
	  [[1, 0, 0, -103], [0, 1, 0, -115],
	  [0, 0, 1, -100], [0, 0, 0, 1]]);
	  
   if (data['scalars']['file']) {
     
     // we have scalars
     mesh.scalars.file = data['scalars']['file'].name;
     mesh.scalars.filedata = data['scalars']['filedata'];
     
   }
   
   // add the mesh
   ren3d.add(mesh);
    
   ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
   
  }
  
  if (data['fibers']['file']) {
   
   // we have fibers
   fibers = new X.fibers();
   fibers.file = data['fibers']['file'].name;
   fibers.filedata = data['fibers']['filedata'];
   /*
fibers.transform.matrix = new X.matrix(
	  [[1, 0, 0, -130], [0, 6.123031769111886e-17, 1, -130],
	  [0, -1, 6.123031769111886e-17, 130], [0, 0, 0, 1]]);
*/
   fibers.modified();

   // add the fibers
   ren3d.add(fibers);
   
/*
ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
*/
   
  }
  
  //ren3d.resetRender();
  
  ren3d.render();
  
  ren3d.onShowtime = function() {
  	window.console.log('Loading completed.');
    
    if (_data.volume.file != null) {
      
      // show any volume also in 2d
      sliceX.add(volume);
      sliceY.add(volume);
      sliceZ.add(volume);
      sliceX.render();
      sliceY.render();
      sliceZ.render();
      
    }
    
    setupUi();

  }

};



function updateMeshMatrix() {
   
   var matrix11 = parseFloat(jQuery('#matrix11').val());
   var matrix12 = parseFloat(jQuery('#matrix12').val());
   var matrix13 = parseFloat(jQuery('#matrix13').val());
   var matrix14 = parseFloat(jQuery('#matrix14').val());
   var matrix21 = parseFloat(jQuery('#matrix21').val());
   var matrix22 = parseFloat(jQuery('#matrix22').val());
   var matrix23 = parseFloat(jQuery('#matrix23').val());
   var matrix24 = parseFloat(jQuery('#matrix24').val());
   var matrix31 = parseFloat(jQuery('#matrix31').val());
   var matrix32 = parseFloat(jQuery('#matrix32').val());
   var matrix33 = parseFloat(jQuery('#matrix33').val());
   var matrix34 = parseFloat(jQuery('#matrix34').val());
   var matrix41 = parseFloat(jQuery('#matrix41').val());
   var matrix42 = parseFloat(jQuery('#matrix42').val());
   var matrix43 = parseFloat(jQuery('#matrix43').val());
   var matrix44 = parseFloat(jQuery('#matrix44').val());
   
   mesh.transform.matrix = new X.matrix(
	  [[matrix11, matrix12, matrix13, matrix14], [matrix21, matrix22, matrix23, matrix24],
	  [matrix31, matrix32, matrix33, matrix34], [matrix41, matrix42, matrix43, matrix44]]);
   mesh.modified();
   
}


function updateMeshMatrixDialog() {

   var matrix = jQuery('#matrix-content').val().split(/[\n]+/);
   var m1 = matrix[0].split(/[\s]+/);
   var matrix11 = parseFloat(m1[0]); jQuery('#matrix11').val(matrix11);
   var matrix12 = parseFloat(m1[1]); jQuery('#matrix12').val(matrix12);
   var matrix13 = parseFloat(m1[2]); jQuery('#matrix13').val(matrix13);
   var matrix14 = parseFloat(m1[3]); jQuery('#matrix14').val(matrix14);
   var m2 = matrix[1].split(/[\s]+/);
   var matrix21 = parseFloat(m2[0]); jQuery('#matrix21').val(matrix21);
   var matrix22 = parseFloat(m2[1]); jQuery('#matrix22').val(matrix22);
   var matrix23 = parseFloat(m2[2]); jQuery('#matrix23').val(matrix23);
   var matrix24 = parseFloat(m2[3]); jQuery('#matrix24').val(matrix24);
   var m3 = matrix[2].split(/[\s]+/);
   var matrix31 = parseFloat(m3[0]); jQuery('#matrix31').val(matrix31);
   var matrix32 = parseFloat(m3[1]); jQuery('#matrix32').val(matrix32);
   var matrix33 = parseFloat(m3[2]); jQuery('#matrix33').val(matrix33);
   var matrix34 = parseFloat(m3[3]); jQuery('#matrix34').val(matrix34);
   var m4 = matrix[3].split(/[\s]+/);
   var matrix41 = parseFloat(m4[0]); jQuery('#matrix41').val(matrix41);
   var matrix42 = parseFloat(m4[1]); jQuery('#matrix42').val(matrix42);
   var matrix43 = parseFloat(m4[2]); jQuery('#matrix43').val(matrix43);
   var matrix44 = parseFloat(m4[3]); jQuery('#matrix44').val(matrix44);
   
   mesh.transform.matrix = new X.matrix(
	  [[matrix11, matrix12, matrix13, matrix14], [matrix21, matrix22, matrix23, matrix24],
	  [matrix31, matrix32, matrix33, matrix34], [matrix41, matrix42, matrix43, matrix44]]);
   mesh.modified();
   
   jQuery("#dialog-modal").dialog('close');
}




function exportMeshMatrix() {

   var matrix11 = parseFloat(jQuery('#matrix11').val());
   var matrix12 = parseFloat(jQuery('#matrix12').val());
   var matrix13 = parseFloat(jQuery('#matrix13').val());
   var matrix14 = parseFloat(jQuery('#matrix14').val());
   var matrix21 = parseFloat(jQuery('#matrix21').val());
   var matrix22 = parseFloat(jQuery('#matrix22').val());
   var matrix23 = parseFloat(jQuery('#matrix23').val());
   var matrix24 = parseFloat(jQuery('#matrix24').val());
   var matrix31 = parseFloat(jQuery('#matrix31').val());
   var matrix32 = parseFloat(jQuery('#matrix32').val());
   var matrix33 = parseFloat(jQuery('#matrix33').val());
   var matrix34 = parseFloat(jQuery('#matrix34').val());
   var matrix41 = parseFloat(jQuery('#matrix41').val());
   var matrix42 = parseFloat(jQuery('#matrix42').val());
   var matrix43 = parseFloat(jQuery('#matrix43').val());
   var matrix44 = parseFloat(jQuery('#matrix44').val());
   
   var output = matrix11 + " " + matrix12 + " " + matrix13 + " " + matrix14 + "\n";
   output += matrix21 + " " + matrix22 + " " + matrix23 + " " + matrix24 + "\n";
   output += matrix31 + " " + matrix32 + " " + matrix33 + " " + matrix34 + "\n";
   output += matrix41 + " " + matrix42 + " " + matrix43 + " " + matrix44;
   
   jQuery("#matrix-content").val(output);
   
   jQuery("#dialog-modal" ).dialog({
		height: 220,
		modal: true
   });
      
}

var isAnimate = false;

function rotateAnimateStart() {
	var rotate_direction = parseInt(jQuery('#rotate-direction').val());
	var rotate_rate = jQuery('#rotate-rate').slider("value");
	ren3d.animateRotateDirection = rotate_direction;
	ren3d.animateRotateRate = rotate_rate;
	isAnimate = true;
	jQuery('#animateStartButton').hide();
	jQuery('#animateStopButton').show();
}

function rotateAnimateRate(event, ui) {
	if (!isAnimate) {
		return;
	}
	var rotate_rate = ui.value;
	ren3d.animateRotateRate = rotate_rate;
}

function rotateAnimateDirection() {
	if (!isAnimate) {
		return;
	}
	var rotate_direction = parseInt(jQuery('#rotate-direction').val());
	ren3d.animateRotateDirection = rotate_direction;
}

function rotateAnimateStop() {
	ren3d.animateRotateRate = 0;
	isAnimate = false;
	jQuery('#animateStartButton').show();
	jQuery('#animateStopButton').hide();
}


var isSaving = false;
function saveFile() {
	if (volume.file == null || isSaving) {
		return;
	}
	isSaving = true;
	
//	//Data is located in 4 places. It should always be consistent. If it isn't, there is a flaw in the program that needs to be de-bugged
//	if (!losp_checkimage (volume._labelmap)) {
//		jQuery("#saveFileInfo").html("ERROR: Data Not Consistent, please report this program error");
//		return;
//	}
	
	jQuery("#saveFileInfo").html("Preparing file...<img src=\"gfx/ajax-loader.gif\">");
	
	var fileinfo = getFileInfo();
	
	window.console.log(fileinfo);
	
	jQuery.post("http://users.loni.usc.edu/~pipeline/viewer/download.php",  fileinfo, function(data) {
  		window.console.log(data);
  		isSaving = false;
		jQuery("#saveFileInfo").html(data);
	}).error(function() { 
  		isSaving = false;
		jQuery("#saveFileInfo").html("Error");
	});
	
}

function saveFileNode() {
	if (volume.file == null) {
		return;
	}
	
	jQuery("#saveFileNodeButton").attr("disabled", "disabled");
	jQuery("#saveFileInfo").html("Preparing file...<img src=\"gfx/ajax-loader.gif\">");
	
	var fileinfo = getFileInfo();
	
	jQuery.post("http://ec2-184-73-98-217.compute-1.amazonaws.com:8001/downloadNII", fileinfo, function(data) {
  		window.console.log(data);
  		
		jQuery("#saveFileNodeButton").removeAttr("disabled");
		jQuery("#saveFileInfo").html(data);
	}).error(function() { 
		jQuery("#saveFileNodeButton").removeAttr("disabled");
		jQuery("#saveFileInfo").html("Error");
	});
	
}

function getFileInfo() {
	// image file info
	var z = volume.image.length;
	var y = volume.image[0].length;
	var x = volume.image[0][0].length;
	var pixx = volume.spacing[0];
	var pixy = volume.spacing[1];
	var pixz = volume.spacing[2];
	// color map info
	var colormap_key = volume._labelmap._colortable._map.keys_;
	var array_count = colormap_key.length;
	var colormap_name = new Array(array_count);
	var colormap_r = new Array(array_count);
	var colormap_g = new Array(array_count);
	var colormap_b = new Array(array_count);
	var colormap_a = new Array(array_count);
	
	for (var i=0; i < array_count; ++i) {
		if (!volume._labelmap._colortable._map.containsKey(i)) {
			window.console.log('Error, non valid color id');
			return -1; //error
		}
		//look up red, blue, green from colormapping
		var colors = volume._labelmap._colortable._map.get(i);
		colormap_name[i] = colors[0];
		colormap_r[i] = colors[1]*255.0;
		colormap_g[i] = colors[2]*255.0;
		colormap_b[i] = colors[3]*255.0;
		colormap_a[i] = colors[4]*255.0;		
	}
	
	// file data in 1D array
	// each element is a slice
    // each string between semicolon is a row
    // each number between comma is a dot/intensity
    // if everyone in a row has value 0, it can be represented as a single 0 
	var myarr = new Array();
	for (var i = 0; i < z; i++) {
		var image2 = volume._labelmap.image[i];
		var myarr2 = "";
		for (var j = 0; j < y; j++) {
			var image3 = image2[j];
			var mystr = "";
			var all_zero = true;
			for (var k = 0; k < x; k++) {
				mystr += image3[k] + ",";
				if (all_zero && image3[k] != 0) {
					all_zero = false;
				}
			}
			if (all_zero) {
				myarr2 += "0;";
			} else {
				myarr2 += mystr+";";
			}
		}
		myarr.push(myarr2);
	}
	
	return { 'x': x, 'y': y, 'z':z, 'pixx': pixx, 'pixy': pixy, 'pixz':pixz, 'data': myarr, 
		'colormap_key': colormap_key, 'colormap_name': colormap_name, 'colormap_r': colormap_r, 
		'colormap_g': colormap_g, 'colormap_b': colormap_b, 'colormap_a': colormap_a};
}



// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

function closeDialog() {
	jQuery("#dialog-modal").dialog('close');
}

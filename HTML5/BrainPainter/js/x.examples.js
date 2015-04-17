goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.mesh');
goog.require('X.matrix');
goog.require('X.volume');
goog.require('X.cube');

// load all examples

function loadVol() {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // now the fun part, arrrr
  volume = new X.volume();
  volume.file = 'data/original.mgh';
  _data.volume.file = volume.file;
  
  ren3d.add(volume);
  
  ren3d.render();
  
  configurator = function() {
	ren3d.camera.view = new X.matrix(
	    [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	     [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	     [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
	     [0, 0, 0, 1]]);

  };
  
}


function loadShape(isRandom) {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();

  var region = ['Left superior frontal gyrus', 'Right middle frontal gyrus', 'Right precuneus', 'Cerebellum', 'Left angular gyrus', 'Right cingulate gyrus', 'Left middle temporal gyrus', 'Right lingual gyrus', 'Left superior temporal gyrus', 'Left fusiform gyrus', 'Right superior parietal gyrus', 'Right inferior occipital gyrus', 'Left parahippocampal gyrus', 'Right caudate', 'Left inferior temporal gyrus', 'Brainstem', 'Left superior parietal gyrus', 'Right precentral gyrus', 'Left middle frontal gyrus', 'Left lingual gyrus', 'Left postcentral gyrus', 'Right inferior temporal gyrus', 'Left putamen', 'Right inferior frontal gyrus', 'Right insular cortex', 'Left inferior frontal gyrus', 'Right supramarginal gyrus', 'Right gyrus rectus', 'Left inferior occipital gyrus', 'Right putamen', 'Left superior occipital gyrus', 'Right middle orbitofrontal gyrus', 'Right postcentral gyrus', 'Left precentral gyrus', 'Right lateral orbitofrontal gyrus', 'Left cingulate gyrus', 'Left lateral orbitofrontal gyrus', 'Right fusiform gyrus', 'Left supramarginal gyrus', 'Right parahippocampal gyrus', 'Right superior frontal gyrus', 'Left middle orbitofrontal gyrus', 'Right cuneus', 'Right superior occipital gyrus', 'Left gyrus rectus', 'Right angular gyrus', 'Right middle occipital gyrus', 'Right middle temporal gyrus', 'Left precuneus', 'Left cuneus', 'Left caudate', 'Left hippocampus', 'Right hippocampus', 'Right superior temporal gyrus', 'Left middle occipital gyrus', 'Left insular cortex'];
  
  // now the fun part, yahoooo
  for (i=1; i<=56; i++) {
	  mesh = new X.mesh();
	  mesh.file = 'http://users.loni.ucla.edu/~pipeline/viewer/data/fsm/i'+i+'_QEM_SubDiv.fsm';
	  mesh.color = [Math.random(),Math.random(),Math.random()];
	  mesh.caption = region[i-1];
	  _data.mesh.file = mesh.file;
	  if (isRandom) {
	  	mesh.transform.matrix = new X.matrix(
	  	[[1, 0, 0, -300*Math.random()], [0, 1, 0, -300*Math.random()],
	  	[0, 0, 1, -300*Math.random()], [0, 0, 0, 1]]);
	  }
	  ren3d.add(mesh);
  }
  
  
  ren3d.render();
  
  configurator = function() {

    var zoom = -380;
    if (isRandom) {
    	zoom = -600;
    }
  	
  	ren3d.camera.view = new X.matrix(
	    [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	     [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	     [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, zoom],
	     [0, 0, 0, 1]]);
  };
}

function loadShapeSimple(isRandom) {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();

  var region = ['Left caudate', 'Right caudate', 'Cerebellum', 'Left insular cortex', 'Right insular cortex', 'Occipital lobe', 'Parietal lobe', 'Right putamen', 'Left putamen', 'Left temporal lobe', 'Right temporal lobe', 'Thalamus', 'Frontal lobe'];
  var region_simple = ['Caudate', 'Caudate', 'Cerebellum', 'Insular cortex', 'Insular cortex', 'Occipital lobe', 'Parietal lobe', 'Putamen', 'Putamen', 'Temporal lobe', 'Temporal lobe', 'Thalamus', 'Frontal lobe']; 
  var index = [21, 22, 181, 43, 44, 163, 102, 61, 62, 67, 68, 161, 81];
  
  // now the fun part, yahoooo
  for (i=0; i<13; i++) {
	  mesh = new X.mesh();
	  mesh.file = 'http://users.loni.ucla.edu/~pipeline/viewer/data/fsm2/'+index[i]+'_QEM_SubDiv.fsm';
	  mesh.color = [Math.random(),Math.random(),Math.random()];
	  mesh.caption = region[i];
	  _data.mesh.file = mesh.file;
	  if (isRandom) {
	  	mesh.transform.matrix = new X.matrix(
	  	[[1, 0, 0, -300*Math.random()], [0, 1, 0, -300*Math.random()],
	  	[0, 0, 1, -300*Math.random()], [0, 0, 0, 1]]);
	  }
	  ren3d.add(mesh);
  }
  
  
  ren3d.render();
  
  configurator = function() {

    var zoom = -380;
    if (isRandom) {
    	zoom = -600;
    }
  	
  	ren3d.camera.view = new X.matrix(
	    [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	     [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	     [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, zoom],
	     [0, 0, 0, 1]]);
  };
}


function loadFibers() {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // it's a fibers thingie
  fibers = new X.fibers();
  fibers.file = 'data/fibers.trk';
  fibers.transform.matrix = new X.matrix(
	   [[1, 0, 0, -130], [0, 6.123031769111886e-17, 1, -130],
	   [0, -1, 6.123031769111886e-17, 130], [0, 0, 0, 1]]);
  fibers.modified();
  _data.fibers.file = fibers.file;
  
  // now the fun part, arrrr
  volume = new X.volume();
  volume.file = 'data/original.mgh';
  volume.labelmap.file = 'data/label.mgz';
  volume.labelmap.colortable.file = 'data/colormap.txt';
  _data.volume.file = volume.file;
  _data.labelmap.file = volume.labelmap.file;
  
  ren3d.add(volume);
  ren3d.add(fibers);
	    
  ren3d.render();
  
  configurator = function() {
  	
    volume.volumeRendering = true;
    jQuery('#slicing').removeClass('ui-state-active');
    jQuery('#volumerendering').addClass('ui-state-active');
    jQuery('#windowlevel-label').hide();
    jQuery('#windowlevel-volume').hide();
    jQuery('#opacity-label').show();
    jQuery('#opacity-volume').show();
    
  	ren3d.camera.view = new X.matrix(
	    [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	     [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	     [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
	     [0, 0, 0, 1]]);

  };
  
}

function loadLabelMaps() {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // now the fun part, arrrr
  volume = new X.volume();
  volume.file = 'data/original.mgh';
  volume.labelmap.file = 'data/label_blank_original.nii.gz';
  volume.labelmap.colortable.file = 'data/colormap.txt';
  _data.volume.file = volume.file;
  _data.labelmap.file = volume.labelmap.file;
  
  ren3d.add(volume);
  
  ren3d.render();

  configurator = function() {
	ren3d.camera.view = new X.matrix(
	    [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	     [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	     [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -370],
	     [0, 0, 0, 1]]);

	ratio = ren3d._container.clientWidth/ren3d._container.clientHeight;
	ren3d.camera._perspective = new Float32Array(ren3d._camera.calculatePerspective_(ren3d._camera._fieldOfView,1/ratio, 1, 10000).flatten());
  };
  
}

function loadFile(file) {

  // now switch to the viewer
  switchToViewer();
  
  jQuery('#blacklogo').hide();
  
  // init renderers
  initializeRenderers();
  createData();
  
  var _fileExtension = file.split('.').pop().toUpperCase();
  
  // check which type of file it is
  if (_data['volume']['extensions'].indexOf(_fileExtension) >= 0) {
    
    // it's a volume
    volume = new X.volume();
    volume.file = file;
    _data.volume.file = volume.file;
    ren3d.add(volume);
    
    
  } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {
    
    // it's a mesh
    mesh = new X.mesh();
    mesh.file = file;
    _data.mesh.file = mesh.file;
    ren3d.add(mesh);
    
  } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {
    
    // it's a fibers thingie
    fibers = new X.fibers();
    fibers.file = file;
    fibers.transform.matrix = new X.matrix(
	   [[1, 0, 0, -130], [0, 6.123031769111886e-17, 1, -130],
	   [0, -1, 6.123031769111886e-17, 130], [0, 0, 0, 1]]);
    fibers.modified();
    _data.fibers.file = fibers.file;
    ren3d.add(fibers);
    
  } else {
    
    throw new Error('Unsupported file type!');
    
  }
  
  ren3d.render();
  
  configurator = function() {
    ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);

  };
  
}

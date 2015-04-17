/**
 * The main handler for drag'n'drop and also for file selection. The XTK scene
 * gets created here and the viewer gets activated. Inspired by
 * http://imgscalr.com
 */

jQuery(document).ready(function() {

  initBrowserWarning();
  initDnD();
  initExamples();
  
  ren3d = null;
  
  has_volume = false;
  has_fibers = false;
  has_mesh = false;
  
  configurator = function() {
	
  };
  
  
  jQuery('.matrix').change(function() {
	updateMeshMatrix();
  });
  
  if ($_GET('iframe')) {
    document.getElementById('pagetitle').style.display = 'none';
  }
  
  var _example = $_GET('');
  var _file = $_GET('file');
  // parse the url for variables which trigger demos immediately
  if (_example || _file) {
    
    document.getElementById('blacklogo').style.display = 'none';
    
    if (_example == 'labelmap') {
      
      loadLabelMaps();
      
    } else if (_example == 'mri') {
      
      loadVol();
      
    } else if (_example == 'bp_start') {
      
      loadShape(true);
      
    } else if (_example == 'bp_goal') {
      
      loadShape(false);
      
    } else if (_example == 'bp2_start') {
      
      loadShapeSimple(true);
      
    } else if (_example == 'bp2_goal') {
      
      loadShapeSimple(false);
      
    } else if (_file) {
      
      loadFile(_file);
      
    }
    
  }
  
});

var _current_3d_content = null;
var _current_X_content = null;
var _current_Y_content = null;
var _current_Z_content = null;
function $_GET(variable) { 
	var query = window.location.search.substring(1); 
	var vars = query.split("&"); 
	for (var i = 0; i < vars.length; i++) { 
		if (vars[i].indexOf("=") == -1 && variable == "") {
			return vars[i];
		}
		var pair = vars[i].split("="); 
		if (pair[0] == variable) { 
			return unescape(pair[1]); 
		} 
	} 
	return false; 
}

function initExamples() {

  jQuery('.examples img').bind('mouseenter', function() {

    jQuery('.examples img').removeClass('selectexample');
    jQuery(this).addClass('selectexample');
    jQuery('.examples div').hide();
    var currentExample = jQuery(this).attr('id').replace('Image', '');
    jQuery('#' + currentExample).show();
    
  });
  
  jQuery('#egvolImage').click(function() {

    loadVol();
  });
  jQuery('#egvollink').click(function() {

    loadVol();
  });
  
  jQuery('#egshapeImage').click(function() {

    loadShape(false);
  });
  jQuery('#egshapelink').click(function() {

    loadShape(false);
  });
  
  jQuery('#egfibersImage').click(function() {

    loadFibers();
  });
  jQuery('#egfiberslink').click(function() {

    loadFibers();
  });
  
  jQuery('#eglabelmapImage').click(function() {

    loadLabelMaps();
  });
  jQuery('#eglabelmaplink').click(function() {

    loadLabelMaps();
  });
  
}

function initBrowserWarning() {

  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  if (!isChrome && !isFirefox) {
  	jQuery("#browser-dialog").dialog({
			modal: true
		});
  }
};

function initDnD() {

  // Add drag handling to target elements
  document.getElementById("body").addEventListener("dragenter", onDragEnter,
      false);
  document.getElementById("drop-box-overlay").addEventListener("dragleave",
      onDragLeave, false);
  document.getElementById("drop-box-overlay").addEventListener("dragover",
      noopHandler, false);
  
  // Add drop handling
  document.getElementById("drop-box-overlay").addEventListener("drop", onDrop,
      false);
  
};

function noopHandler(evt) {

  evt.stopPropagation();
  evt.preventDefault();
};

function onDragEnter(evt) {

  jQuery("#drop-box-overlay").fadeIn(125);
  jQuery("#drop-box-prompt").fadeIn(125);
};

function onDragLeave(evt) {

  /*
   * We have to double-check the 'leave' event state because this event stupidly
   * gets fired by JavaScript when you mouse over the child of a parent element;
   * instead of firing a subsequent enter event for the child, JavaScript first
   * fires a LEAVE event for the parent then an ENTER event for the child even
   * though the mouse is still technically inside the parent bounds. If we trust
   * the dragenter/dragleave events as-delivered, it leads to "flickering" when
   * a child element (drop prompt) is hovered over as it becomes invisible, then
   * visible then invisible again as that continually triggers the enter/leave
   * events back to back. Instead, we use a 10px buffer around the window frame
   * to capture the mouse leaving the window manually instead. (using 1px didn't
   * work as the mouse can skip out of the window before hitting 1px with high
   * enough acceleration).
   */
  if (evt.pageX < 10 || evt.pageY < 10 ||
      jQuery(window).width() - evt.pageX < 10 ||
      jQuery(window).height - evt.pageY < 10) {
    jQuery("#drop-box-overlay").fadeOut(125);
    jQuery("#drop-box-prompt").fadeOut(125);
  }
};

function onDrop(evt) {

  // Consume the event.
  noopHandler(evt);
  
  // Hide overlay
  jQuery("#drop-box-overlay").fadeOut(0);
  jQuery("#drop-box-prompt").fadeOut(0);
  
  // Get the dropped files.
  var files = evt.dataTransfer.files;
  
  // If anything is wrong with the dropped files, exit.
  if (typeof files == "undefined" || files.length == 0) {
    return;
  }
  
  selectfiles(files);
  
};

function switchToViewer() {

  jQuery('#body').addClass('viewerBody');
  jQuery('#frontpage').hide();
  jQuery('#viewer').show();
  
	twodwidth = Math.floor(jQuery(window).height()*0.38);
	jQuery('.twoDRenderer').css("width", twodwidth+"px");
	jQuery('.threeDRenderer').css("left", twodwidth+parseInt(200)+"px");
	
	threedwidth = jQuery(window).width() - twodwidth - 200;
	threedheight = jQuery(window).height();
	
	margin = 0;
	if(threedheight < threedwidth){
		threedwidth = threedheight;
		margin = jQuery(window).width() - twodwidth - 200 - threedwidth;
		jQuery('.threeDRenderer').css("margin-left", margin/2+"px");
		jQuery('.threeDRenderer').css("margin-right", margin/2+"px");
	}
	else if(threedheight > threedwidth) {
		threedheight = threedwidth;
		margin = jQuery(window).height() - threedheight;
		jQuery('.threeDRenderer').css("margin-top", margin/2+"px");
		jQuery('.threeDRenderer').css("margin-bottom", margin/2+"px");
	}
			
	jQuery('.threeDRenderer').css("height", threedheight+"px");
	jQuery('.threeDRenderer').css("width", threedwidth+"px");

	var barright = Math.floor(threedwidth/2);
	jQuery('.xtk-progress-bar').css("right", barright+"px");
	jQuery('.xtk-progress-bar').css("top", "50%");
	jQuery('.xtk-progress-bar').css("position", "absolute");
  
};

function selectfiles(files) {

  // now switch to the viewer
  switchToViewer();
  
  // .. and start the file reading
  read(files);
  
  
};

function showLarge(el2) {
	
  // jump out if the renderers were not set up
  if (!_current_3d_content || !_current_X_content || !_current_Y_content ||
      !_current_Z_content) {

  console.log('nothing to do');
  return;
  }

  // from Stackoverflow http://stackoverflow.com/a/6391857/1183453

  var el1 = jQuery('#3d');
  el1.prepend('<div/>'); // drop a marker in place
  var tag1 = jQuery(el1.children()[0]);
  var old_content = tag1.nextAll();
  tag1.replaceWith(el2.children('canvas'));
  
  el2.prepend('<div/>');
  var tag2 = jQuery(el2.children()[0]);
  tag2.replaceWith(old_content);

  // adjust the XTK containers

  var _2dcontainerId = el2.attr('id');
  var _orientation = _2dcontainerId.substr(-1);
  if (_orientation == 'd') {
    return;
  }

  var _old_2d_content = eval('_current_' + _orientation + '_content');
  var _old_3d_content = _current_3d_content;

  _current_3d_content.container = document.getElementById(_2dcontainerId);
  _old_2d_content.container = document.getElementById('3d');

  // .. and update the layout
  _current_3d_content = _old_2d_content;
  eval('_current_' + _orientation + '_content = _old_3d_content');
  eval('var _current_2d_content = _current_' + _orientation + '_content');
 
  var container, canvas;
  eval('var _current_2d_content = _current_' + _orientation + '_content');
  
  if(_current_3d_content instanceof X.renderer2D) {
  	
  	//enlarge 2d image to fit 3d container
  	container = goog.dom.getElement(_current_3d_content._container);
  	_current_3d_content._width = container.clientWidth;
  	_current_3d_content._height = container.clientHeight;
   
  	// propagate it to the canvas
   	canvas = goog.dom.getElement(_current_3d_content._canvas);
   	canvas.width = _current_3d_content._width;
  	canvas.height = _current_3d_content._height;
  
    _current_3d_content._camera = new X.camera2D(_current_3d_content._container.clientWidth,_current_3d_content._container.clientWidth)
   	_current_3d_content.resetViewAndRender();
 	
 	//shrink 3d image to fit 2d container
   	container = goog.dom.getElement(_current_2d_content._container);
  	_current_2d_content._width = container.clientWidth;
  	_current_2d_content._height = container.clientHeight;
   
  	// propagate it to the canvas
   	canvas = goog.dom.getElement(_current_2d_content._canvas);
   	canvas.width = _current_2d_content._width;
  	canvas.height = _current_2d_content._height;
  	
  	_old_perspective = _current_2d_content._camera._perspective;
  	ratio = _current_2d_content._container.clientWidth/_current_2d_content._container.clientHeight;
  	_new_perspective = new Float32Array(_current_2d_content._camera.calculatePerspective_(_current_2d_content._camera._fieldOfView, ratio, 1, 10000).flatten());
  	_current_2d_content._camera._perspective = _new_perspective;
  	
  	ren3d.camera.view = new X.matrix(
	[[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	[0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	[-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -270],
	[0, 0, 0, 1]]);
  	
  	_current_2d_content.render();
  }
  
  if(_current_2d_content instanceof X.renderer2D) {
   
    //shrink 2d image to fit 2d container
  	container = goog.dom.getElement(_current_2d_content._container);
  	_current_2d_content._width = container.clientWidth;
  	_current_2d_content._height = container.clientHeight;
   
  	// propagate it to the canvas
   	canvas = goog.dom.getElement(_current_2d_content._canvas);
   	canvas.width = _current_2d_content._width;
  	canvas.height = _current_2d_content._height;
  	
   	_current_2d_content.resetViewAndRender();
   	
   	//enlarge 3d image to fit 3d container
   	container = goog.dom.getElement(_current_3d_content._container);
  	_current_3d_content._width = container.clientWidth;
  	_current_3d_content._height = container.clientHeight;
   
  	// propagate it to the canvas
   	var canvas = goog.dom.getElement(_current_3d_content._canvas);
   	canvas.width = _current_3d_content._width;
  	canvas.height = _current_3d_content._height;
  
   	_current_3d_content._camera._perspective = _old_perspective;
   	
   	ren3d.camera.view = new X.matrix(
	[[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
	[0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
	[-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -370],
	[0, 0, 0, 1]]);
   	
   	_current_3d_content.render();
  }
  eval('_current_' + _orientation + '_content = _current_2d_content');
};

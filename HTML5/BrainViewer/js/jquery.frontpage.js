/*

    .----.                    _..._                                                     .-'''-.                           
   / .--./    .---.        .-'_..._''.                          _______                '   _    \                         
  ' '         |   |.--.  .' .'      '.\     __.....__           \  ___ `'.           /   /` '.   \_________   _...._      
  \ \         |   ||__| / .'            .-''         '.    ,.--. ' |--.\  \         .   |     \  '\        |.'      '-.   
   `.`'--.    |   |.--.. '             /     .-''"'-.  `. //    \| |    \  ' .-,.--.|   '      |  '\        .'```'.    '. 
     `'-. `.  |   ||  || |            /     /________\   \\\    /| |     |  '|  .-. \    \     / /  \      |       \     \
         `. \ |   ||  || |            |                  | `'--' | |     |  || |  | |`.   ` ..' /    |     |        |    |
           \ '|   ||  |. '            \    .-------------' ,.--. | |     ' .'| |  | |   '-...-'`     |      \      /    . 
            | |   ||  | \ '.          .\    '-.____...---.//    \| |___.' /' | |  '-                 |     |\`'-.-'   .'  
            | |   ||__|  '. `._____.-'/ `.             .' \\    /_______.'/  | |                     |     | '-....-'`    
           / /'---'        `-.______ /    `''-...... -'    `'--'\_______|/   | |                    .'     '.             
     /...-'.'                       `                                        |_|                  '-----------'           
    /--...-'                                                                                                              
    
    Slice:Drop - Instantly view scientific and medical imaging data in 3D.
    
     http://slicedrop.com
     
    Copyright (c) 2012 The Slice:Drop and X Toolkit Developers <dev@goXTK.com>
    
    Slice:Drop is licensed under the MIT License:
      http://www.opensource.org/licenses/mit-license.php    
      
    CREDITS: http://slicedrop.com/LICENSE
     
*/

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
    //document.getElementByClass('dropzone').style.display = 'none';
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
  
};

function selectfiles(files) {

  // now switch to the viewer
  switchToViewer();
  
  // .. and start the file reading
  read(files);
  
  
};

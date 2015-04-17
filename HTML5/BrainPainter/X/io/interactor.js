/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

goog.provide('X.interactor');

// requires
goog.require('X.base');
goog.require('X.event');
goog.require('X.event.HoverEvent');
goog.require('X.event.HoverEndEvent');
goog.require('X.event.RotateEvent');
goog.require('X.event.PanEvent');
goog.require('X.event.ResetViewEvent');
goog.require('X.event.ZoomEvent');
goog.require('X.labelmap');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math.Vec2');



/**
 * Create an interactor for a given element in the DOM tree.
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @extends X.base
 */
X.interactor = function(element) {

  // check if we have a valid element
  if (!goog.isDefAndNotNull(element) || !(element instanceof Element)) {
    
    throw new Error('Could not add interactor to the given element.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'interactor';
  
  /**
   * The observed DOM element of this interactor.
   * 
   * @type {!Element}
   * @protected
   */
  this._element = element;
  
  /**
   * The listener id for mouse wheel observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseWheelListener = null;
  
  /**
   * The listener id for mouse down observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseDownListener = null;
  
  /**
   * The listener id for mouse up observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseUpListener = null;
  
  /**
   * The listener id for mouse move observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseMoveListener = null;
  
  /**
   * The listener id for mouse out observation.
   * 
   * @type {?number}
   * @protected
   */
  this._mouseOutListener = null;
  
  /**
   * The browser independent mouse wheel handler.
   * 
   * @type {?goog.events.MouseWheelHandler}
   * @protected
   */
  this._mouseWheelHandler = null;
  
  /**
   * Indicates if the mouse is inside the element.
   * 
   * @type {boolean}
   * @protected
   */
  this._mouseInside = true;
  
  /**
   * Indicates if the left mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._leftButtonDown = false;
  
  /**
   * Indicates if the middle mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._middleButtonDown = false;
  
  /**
   * Indicates if the right mouse button is pressed.
   * 
   * @type {boolean}
   * @protected
   */
  this._rightButtonDown = false;
  
  /**
   * The current mouse position.
   * 
   * @type {!Array}
   * @protected
   */
  this._mousePosition = [0, 0];
  
  /**
   * The previous mouse position.
   * 
   * @type {!goog.math.Vec2}
   * @protected
   */
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
  /**
   * The configuration of this interactor.
   * 
   * @enum {boolean}
   */
  this._config = {
    'MOUSEWHEEL_ENABLED': true,
    'MOUSECLICKS_ENABLED': true,
    'KEYBOARD_ENABLED': true,
    'HOVERING_ENABLED': true,
    'CONTEXTMENU_ENABLED': false
  };
  
};
// inherit from X.base
goog.inherits(X.interactor, X.base);


/**
 * Access the configuration of this interactor. Possible settings and there
 * default values are:
 * 
 * <pre>
 *  config.MOUSEWHEEL_ENABLED: true
 *  config.MOUSECLICKS_ENABLED: true
 *  config.KEYBOARD_ENABLED: true
 *  config.HOVERING_ENABLED: true
 *  config.CONTEXTMENU_ENABLED: false 
 * </pre>
 * 
 * @return {Object} The configuration.
 */
X.interactor.prototype.__defineGetter__('config', function() {

  return this._config;
  
});


/**
 * Get the state of the left mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('leftButtonDown', function() {

  return this._leftButtonDown;
  
});


/**
 * Get the state of the middle mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('middleButtonDown', function() {

  return this._middleButtonDown;
  
});


X.interactor.prototype.__defineSetter__('id', function(id) {

   if (!goog.isDefAndNotNull(id)) {
    
    throw new Error('A valid id is required.');
    
  }
  
  var _id = id;
  
  this._id = _id;
  
  
});

/**
 * Get the state of the right mouse button.
 * 
 * @return {boolean} TRUE if the button is pressed, FALSE otherwise.
 */
X.interactor.prototype.__defineGetter__('rightButtonDown', function() {

  return this._rightButtonDown;
  
});


/**
 * Observe mouse wheel interaction on the associated DOM element.
 */
X.interactor.prototype.init = function() {

  if (this._config['MOUSEWHEEL_ENABLED']) {
    
    // we use the goog.events.MouseWheelHandler for a browser-independent
    // implementation
    this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._element);
    
    this._mouseWheelListener = goog.events.listen(this._mouseWheelHandler,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel_
            .bind(this));
    
  } else {
    
    // remove all mouse wheel observers, if they exist..
    goog.events.unlistenByKey(this._mouseWheelListener);
    
    this._mouseWheelHandler = null;
    
  }
  
  if (this._config['MOUSECLICKS_ENABLED']) {
    
    // mouse down
    this._mouseDownListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEDOWN, this.onMouseDown_.bind(this));
    
    // mouse up
    this._mouseUpListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEUP, this.onMouseUp_.bind(this));
    
  } else {
    
    // remove the observer, if it exists..
    // goog.events.unlisten(this._element, goog.events.EventType.MOUSEDOWN);
    goog.events.unlistenByKey(this._mouseDownListener);
    
    // remove the observer, if it exists..
    goog.events.unlistenByKey(this._mouseUpListener);
    
  }
  
  if (!this._config['CONTEXTMENU_ENABLED']) {
    
    // deactivate right-click context menu
    // found no way to use goog.events for that? tried everything..
    // according to http://help.dottoro.com/ljhwjsss.php, this method is
    // compatible with all browsers but opera
    this._element.oncontextmenu = function() {

      return false;
      
    };
    
  } else {
    
    // re-activate right-click context menu
    this._element.oncontextmenu = null;
  }
  
  if (this._config['KEYBOARD_ENABLED']) {
    
    // the google closure way did not work, so let's do it this way..
    window.onkeydown = this.onKey_.bind(this);
    
  } else {
    
    // remove the keyboard observer
    window.onkeydown = null;
    
  }
  
  //
  // we always listen to mouse move events since they are essential for the
  // other events
  // we do make sure, we add them only once
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this._mouseMoveListener);
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this._mouseOutListener);
  
  // mouse movement inside the element
  this._mouseMoveListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEMOVE, this.onMouseMovementInside_.bind(this));
  
  // mouse movement outside the element
  this._mouseOutListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEOUT, this.onMouseMovementOutside_.bind(this));
      
};


/**
 * Callback for mouse down events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseDown_ = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
    
    // left button click
    this._leftButtonDown = true;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {
    
    // middle button click
    this._middleButtonDown = true;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {
    
    // right button click
    this._rightButtonDown = true;
    
  }
  
  eval("this.onMouseDown(" + this._leftButtonDown + "," +
      this._middleButtonDown + "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on mouse down (button press).
 * 
 * @param {boolean} left TRUE if the left button triggered this event.
 * @param {boolean} middle TRUE if the middle button triggered this event.
 * @param {boolean} right TRUE if the right button triggered this event.
 */
X.interactor.prototype.onMouseDown = function(left, middle, right) {

  // do nothing
  
};


/**
 * Callback for mouse up events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseUp_ = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
    
    // left button click
    this._leftButtonDown = false;
    //volume.labelmap.modified();
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {
    
    // middle button click
    this._middleButtonDown = false;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {
    
    // right button click
    this._rightButtonDown = false; 
  }
  
  if (this instanceof X.interactor2D && !losp_slices._labelundo._inaction) {//has NOT been drawing, just a click
	losp_MouseMove(this._id, false, event); //false means not a drag, just a click
  }
  //all actions are complete
  losp_slices._labelundo._inaction = false;
  
  eval("this.onMouseUp(" + this._leftButtonDown + "," + this._middleButtonDown +
      "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  

};


/**
 * Get the current mouse position (offsetX, offsetY) relative to the viewport.
 * 
 * @return {!Array} The mouse position as an array [x,y].
 */
X.interactor.prototype.__defineGetter__('mousePosition', function() {

  return this._mousePosition;
  
});


/**
 * Overload this function to execute code on mouse up (button release).
 * 
 * @param {boolean} left TRUE if the left button triggered this event.
 * @param {boolean} middle TRUE if the middle button triggered this event.
 * @param {boolean} right TRUE if the right button triggered this event.
 */
X.interactor.prototype.onMouseUp = function(left, middle, right) {
	
};


/**
 * Callback for mouse movement events outside the associated DOM element. This
 * resets all internal interactor flags.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseMovementOutside_ = function(event) {  
  // reset the click flags
  this._mouseInside = false;
  if (this._config['KEYBOARD_ENABLED']) {
    
    // if we observe the keyboard, remove the observer here
    // this is necessary if there are more than one renderer in the document
    window.onkeydown = null;
    
  }
  
  this._leftButtonDown = false;
  this._middleButtonDown = false;
  this._rightButtonDown = false;
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  this._lastMousePosition = new goog.math.Vec2(0, 0);
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on mouse movement.
 * 
 * @param {Event} event The browser fired mousemove event.
 */
X.interactor.prototype.onMouseMove = function(event) {

  // do nothing
  
};


/**
 * Callback for mouse movement events inside the associated DOM element. This
 * distinguishes by pressed mouse buttons, key accelerators etc. and fires
 * proper X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
 
 //holds undo data
 function Losp_Labelundo() {
	this._rawDataX = null; //array of arrays
	this._rawDataY = null;
	this._rawDataZ = null;
	this._image = null; //3D array
	this._inaction = false; //are we in the middle of a draw action
 }
 
 //holds slice data for drawing
  function Losp_Slice() {
	this._init = false;
	this._sliceWidth = null;
	this._sliceHeight = null;
	this._width = null;
	this._height = null;
	this._currentSlice = null;
}

//holds brush data
  function Losp_Brush() {
	this._size = 1;
	this._colorid = 3; //blue
	this._color = new Array(0, 0, 255, 255);
	this._clobber = true;
	this._clobberChecked = true;
	this._mode = 1; //1=draw/erase, 2=2D fill, 3=magic fill 2d, 4=magic fill 3d
	this._eraser = false; // If eraser in use
}

function Losp_UndoRedo() {
	this._current = new Losp_Labelundo(); // To keep track of current state
	this._undo = new Array();
	this._redo = new Array();
}

//holds undo and slice data
 function Losp_Slices() {
	this._labelundo = new Losp_Labelundo();
	this._Xslice = new Losp_Slice();
	this._Yslice = new Losp_Slice();
	this._Zslice = new Losp_Slice();
	this._brush = new Losp_Brush();
	this._undoRedo = new Losp_UndoRedo();
 }
 
 
  //global var used to give slice data to this part of the code from renderer2D.js
  var losp_slices = new Losp_Slices();
  
  // global var for stack size limit
  var maxStackSize = 20;
 
 //changes the given pixel in the 1D "_rawData" arrays
 function losp_2Dpixfill (rawData, index, red, green, blue, trans) {
	rawData[index] = red;
	rawData[index+1] = green;
	rawData[index+2] = blue;
	rawData[index+3] = trans;
}

// Update the current image
function losp_updateCurrent(labelmap) {
	
	var current = losp_slices._undoRedo._current;
	
	var x_width = labelmap._dimensions[0];
	var y_width = labelmap._dimensions[1];
	var z_width = labelmap._dimensions[2];
	
	var tmp_arr = new Array(z_width);
	for(var d=0; d<z_width; d++) {
		tmp_arr[d] = new Array(y_width);
		for(var e=0; e<y_width; e++) {
			tmp_arr[d][e] = new Array(x_width);
			for(var f=0; f<x_width; f++) {
				tmp_arr[d][e][f] = labelmap._image[d][e][f];
	}}}
	current._image = tmp_arr;
	
	if (!current._rawDataX)
		current._rawDataX = new Array();
	if (!current._rawDataY)
		current._rawDataY = new Array();
	if (!current._rawDataZ)
		current._rawDataZ = new Array();
	
	var i;
	for (i=0; i<x_width; i++)
		current._rawDataX[i] = new Uint8Array(labelmap._slicesX._children[i]._texture._rawData);
	for (i=0; i<y_width; i++)
		current._rawDataY[i] = new Uint8Array(labelmap._slicesY._children[i]._texture._rawData);
	for (i=0; i<z_width; i++)
		current._rawDataZ[i] = new Uint8Array(labelmap._slicesZ._children[i]._texture._rawData);
		
}

// true = undo, false = redo
function losp_addUndoRedo(undo, labelmap) {
	
	var current = losp_slices._undoRedo._current;
	
	var currentImage = undo ? losp_slices._undoRedo._current._image
		: labelmap._image;
	
	var add = new Losp_Labelundo();
	
	add._rawDataX = new Array();
	add._rawDataY = new Array();
	add._rawDataZ = new Array();
	var x_width = labelmap._dimensions[0];
	var y_width = labelmap._dimensions[1];
	var z_width = labelmap._dimensions[2];
	
	var tmp_arr = new Array(z_width);
	for(var d=0; d<z_width; d++) {
		tmp_arr[d] = new Array(y_width);
		for(var e=0; e<y_width; e++) {
			tmp_arr[d][e] = new Array(x_width);
			for(var f=0; f<x_width; f++) {
				tmp_arr[d][e][f] = currentImage[d][e][f];
	}}}
	add._image = tmp_arr;
	
	if (undo) {
		var i;
		for (i=0; i<x_width; i++)
			add._rawDataX[i] = current._rawDataX[i];
		for (i=0; i<y_width; i++)
			add._rawDataY[i] = current._rawDataY[i];
		for (i=0; i<z_width; i++)
			add._rawDataZ[i] = current._rawDataZ[i];
	} else {
		var i;
		for (i=0; i<x_width; i++)
			add._rawDataX[i] = new Uint8Array(labelmap._slicesX._children[i]._texture._rawData);
		for (i=0; i<y_width; i++)
			add._rawDataY[i] = new Uint8Array(labelmap._slicesY._children[i]._texture._rawData);
		for (i=0; i<z_width; i++)
			add._rawDataZ[i] = new Uint8Array(labelmap._slicesZ._children[i]._texture._rawData);
	}
		
	if (undo) {
		//losp_slices._undoRedo._undo.push(add);
		addToStack(losp_slices._undoRedo._undo, add);
	} else {
		//losp_slices._undoRedo._redo.push(add);
		addToStack(losp_slices._undoRedo._redo, add);
	}
	
}

function addToStack(checkArray, add) {
	
	var newArray = checkArray;
	
	if (checkArray.length >= maxStackSize) {
		
		newArray = new Array();
		
		for (var i = 1; i < checkArray.length; i++) {
			newArray[i-1] = checkArray[i];
		}
		
	}
	
	newArray.push(add);
	checkArray = newArray;
}

// true = undo, false = redo
function losp_performUndoRedo(undo, labelmap) {

	var saveArray = null;
	
	if (undo) {
		if (losp_slices._undoRedo._undo.length < 1) {
			return;
		}
		
		losp_addUndoRedo(false, labelmap);
		saveArray = losp_slices._undoRedo._undo.pop();
	} else {
		if (losp_slices._undoRedo._redo.length < 1) {
			// Becuase last redo redundant
			return;
		}
		
		losp_addUndoRedo(true, labelmap);
		saveArray = losp_slices._undoRedo._redo.pop();
	}
	
	var x_width = labelmap._dimensions[0];
	var y_width = labelmap._dimensions[1];
	var z_width = labelmap._dimensions[2];
		
	var i;
	for (i=0; i<x_width; i++)
		labelmap._slicesX._children[i]._texture._rawData = new Uint8Array(saveArray._rawDataX[i]);
	for (i=0; i<y_width; i++)
		labelmap._slicesY._children[i]._texture._rawData = new Uint8Array(saveArray._rawDataY[i]);
	for (i=0; i<z_width; i++)
		labelmap._slicesZ._children[i]._texture._rawData = new Uint8Array(saveArray._rawDataZ[i]);
		
	// Restore internal image array
	var tmp_arr = new Array(z_width);
	for(var d=0; d<z_width; d++) {
		tmp_arr[d] = new Array(y_width);
		for(var e=0; e<y_width; e++) {
			tmp_arr[d][e] = new Array(x_width);
			for(var f=0; f<x_width; f++) {
				tmp_arr[d][e][f] = saveArray._image[d][e][f];
	}}}
	labelmap._image = tmp_arr;	
	
	// To change 3D rendering
	volume.labelmap.modified();
	
	losp_updateCurrent(volume._labelmap);

}

function createLabel() {
	var dimx = volume._dimensions[0];
 	var dimy = volume._dimensions[1];
 	var dimz = volume._dimensions[2];
 	var pixx = volume._spacing[0];
 	var pixy = volume._spacing[1];
 	var pixz = volume._spacing[2];
	
	volume.labelmap._dimensions[0] = dimx;
	volume.labelmap._dimensions[1] = dimy;
	volume.labelmap._dimensions[2] = dimz;
	volume.labelmap._indexX = volume._indexX;
	volume.labelmap._indexXold = volume._indexXold;
	volume.labelmap._indexY = volume._indexY;
	volume.labelmap._indexYold = volume._indexYold;
	volume.labelmap._indexZ = volume._indexZ;
	volume.labelmap._indexZold = volume._indexZold;
	volume.labelmap._spacing[0] = pixx;
	volume.labelmap._spacing[1] = pixy;
	volume.labelmap._spacing[2] = pixz;
	
	var MRI = {
		dim : [1, dimx, dimy, dimz, 1, 1, 1, 1], 
		pixdim : [1, pixx, pixy, pixz, 1, 1, 1, 1],
		data : [] 
	};
	var totalsize = dimx*dimy*dimz;
	MRI.data = new Int16Array(totalsize);
	for (var i = 0; i < totalsize; i++) {
		MRI.data[i] = 0;
	}
	
	volume.labelmap.create_();
	volume.labelmap.colortable.loadDefault();
	var parser = new X.parser();
	volume.labelmap._image = parser.reslice(volume.labelmap, MRI);
    
    volume.labelmap._dirty = true;
	
	losp_updateCurrent(volume._labelmap);
}

//change a 3D pixel to a new tissue of type 'id' in labelmap at (x, y, z)
function losp_change_pixel(x, y, z, id, labelmap) {
	//find dimensions						//same as  \/
	var x_width = labelmap._dimensions[0]; //labelmap._children[0]._children.length;
	var y_width = labelmap._dimensions[1]; //labelmap._children[1]._children.length;
	var z_width = labelmap._dimensions[2]; //labelmap._children[2]._children.length;
	//check dimensions in texture._width/height?
	
	if (x_width < 1 || y_width < 1 || z_width < 1) {
		window.console.log('Error, non valid array size');
		return -1; //error
	}	
	if (0>x || x_width<=x || 0>y || y_width<=y || 0>z || z_width<=z) {
		window.console.log('Error, non valid coordinates');
		return -1; //error
	}	
	if (!labelmap._colortable._map.containsKey(id)) {
		window.console.log('Error, non valid color id');
		return -1; //error
	}
	
	// Check if eraser option set
	if (losp_slices._brush._eraser) {
		//if clobber is off and color of pixel at (x,y,z) is not the same as brush color, do not erase and return 
		if(!losp_slices._brush._clobber&&volume.labelmap._image[z][y][x]!=id)
			return;
		// if clobebr of on or color of pixel at (x,y,z) is the same as brush color, erase 
		id = 0; // Set color id to none
	}
	
	//look up red, blue, green from colormapping
	var colors = labelmap._colortable._map.get(id);
	var name =  colors[0];
	var red =   colors[1]*255.0;
	var green = colors[2]*255.0;
	var blue =  colors[3]*255.0;
	var trans = colors[4]*255.0;
	
	// if (!losp_slices._labelundo._inaction) {
		// losp_slices._labelundo._inaction = true;	
		// losp_updateundo(labelmap);
	// }
	
	//check labelmap to exsist
	if (labelmap== null || labelmap._image==null || labelmap._image.length < 1) {
		window.console.log('Error: _image not defined');
		return;
	}		
	
	//check for clobber
	if (!losp_slices._brush._clobber && volume.labelmap._image[z][y][x]!=0 && !losp_slices._brush._eraser)
		return; //pixel not to be changed due to clobber
	
	//window.console.log("XYZ: "+x+","+y+","+z+" changed to " + id);
	//image: this 3D array is never used but i am going to update it anyway
	volume.labelmap._image[z][y][x] = id;
	
	//check if the chosen brush color already exists in the favorite colors dropdown only if eraser is not selected
	if(id!=0) {
		var rgbaColor = [red,green,blue,undefined];
		var exists = false;
		$('#favColors option').each(function(){
		    if (this.value == rgbaColor) {
		        exists = true;
		        return false;
		    }
		});
		
		//if it does not exist, add it to the dropdown
		if(!exists) {
			var hexColor = ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).substr(1);
			$("<option value="+rgbaColor+" style=\"background-color:#"+hexColor+";\"></option>").appendTo("#favColors");
		}
	}
 		
	losp_2Dpixfill(labelmap._slicesX._children[x]._texture._rawData, (z*y_width+y)*4, red, green, blue, trans); //set pixel in X plane
	losp_2Dpixfill(labelmap._slicesY._children[y]._texture._rawData, (z*x_width+x)*4, red, green, blue, trans); //Y plane
	losp_2Dpixfill(labelmap._slicesZ._children[z]._texture._rawData, (y*x_width+x)*4, red, green, blue, trans); //Z Plane
} 

//radius of 1 is single pixel, view is 'x', 'y', or 'z'
function losp_planerDot (x, y, z, view, radius, id, labelmap) {
	var r = radius - 1;
	var i, j;
	switch (view)
	{
	case 'x': //*/
		for(i=-r; i<=r; i++) {
			for(j=-r; j<=r; j++) {
				losp_change_pixel(x, y+i, z+j, id, labelmap);
			}
		}
		break;
	case 'y':
		for(i=-r; i<=r; i++) {
			for(j=-r; j<=r; j++) {
				losp_change_pixel(x+i, y, z+j, id, labelmap);
			}
		}
		break;
	case 'z':
		for(i=-r; i<=r; i++) {
			for(j=-r; j<=r; j++) {
				losp_change_pixel(x+i, y+j, z, id, labelmap);
			}
		}
		break;
	default:
		window.console.log('Error: invalid view.');
		break;
	}
}

//view is 'x', 'y', or 'z', up is true or false (up means view view+1)
// sliceNum 0 if next or prev
function losp_copy (up, view, labelmap, copyFromSliceNum, copyToSliceNum) {
	//find dimensions						//same as  \/
	var x_width = labelmap._dimensions[0]; //labelmap._children[0]._children.length;
	var y_width = labelmap._dimensions[1]; //labelmap._children[1]._children.length;
	var z_width = labelmap._dimensions[2]; //labelmap._children[2]._children.length;
	
	var currentSlice = copyFromSliceNum;
	
	var newSlice = null;
	if (copyToSliceNum != 0)
		newSlice = copyToSliceNum;
	else
		newSlice = (up) ? currentSlice+1 : currentSlice-1;
	

	
	switch (view)
	{
	case 'x':
		if ( newSlice<0 || newSlice>=x_width || currentSlice<0 || currentSlice>=x_width ) {
			window.console.log("Error: Slice out of range");
			return null; //error
		}
		
		//change X plane (easy)
		labelmap._slicesX._children[newSlice]._texture._rawData = new Uint8Array(labelmap._slicesX._children[currentSlice]._texture._rawData);
		for(var y=0; y<y_width; y++) {
		for(var z=0; z<z_width; z++) {
			//change labelmap._image
			labelmap._image[z][y][newSlice] = labelmap._image[z][y][currentSlice];
			
			//change Y plane (hard)
			
			labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(newSlice))*4] =		labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(currentSlice))*4];
			labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(newSlice))*4+1] =	labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(currentSlice))*4+1];
			labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(newSlice))*4+2] =	labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(currentSlice))*4+2];
			labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(newSlice))*4+3] =	labelmap._slicesY._children[y]._texture._rawData[(z*x_width+parseInt(currentSlice))*4+3];	
					
			//change Z plane (hard)
			labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(newSlice))*4] =		labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(currentSlice))*4];
			labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(newSlice))*4+1] =	labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(currentSlice))*4+1];
			labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(newSlice))*4+2] =	labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(currentSlice))*4+2];
			labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(newSlice))*4+3] =	labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+parseInt(currentSlice))*4+3];		
		}}		
		break;
	case 'y':
		if ( newSlice<0 || newSlice>=y_width || currentSlice<0 || currentSlice>=y_width ) {
			window.console.log("Error: Slice out of range");
			return null; //error
		}
		
		//change Y plane (easy)
		labelmap._slicesY._children[newSlice]._texture._rawData = new Uint8Array(labelmap._slicesY._children[currentSlice]._texture._rawData);
		
		for(var x=0; x<x_width; x++) {
		for(var z=0; z<z_width; z++) {
			//change labelmap._image
			labelmap._image[z][newSlice][x] = labelmap._image[z][currentSlice][x];
			
			//change X plane (hard)
			labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(newSlice))*4] =		labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(currentSlice))*4];
			labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(newSlice))*4+1] =	labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(currentSlice))*4+1];
			labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(newSlice))*4+2] =	labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(currentSlice))*4+2];
			labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(newSlice))*4+3] =	labelmap._slicesX._children[x]._texture._rawData[(z*y_width+parseInt(currentSlice))*4+3];	
					
			//change Z plane (hard)
			labelmap._slicesZ._children[z]._texture._rawData[(newSlice*x_width+parseInt(x))*4]   =	labelmap._slicesZ._children[z]._texture._rawData[(currentSlice*x_width+parseInt(x))*4];
			labelmap._slicesZ._children[z]._texture._rawData[(newSlice*x_width+parseInt(x))*4+1] =	labelmap._slicesZ._children[z]._texture._rawData[(currentSlice*x_width+parseInt(x))*4+1];
			labelmap._slicesZ._children[z]._texture._rawData[(newSlice*x_width+parseInt(x))*4+2] =	labelmap._slicesZ._children[z]._texture._rawData[(currentSlice*x_width+parseInt(x))*4+2];
			labelmap._slicesZ._children[z]._texture._rawData[(newSlice*x_width+parseInt(x))*4+3] =	labelmap._slicesZ._children[z]._texture._rawData[(currentSlice*x_width+parseInt(x))*4+3];		
		}}
		break;
	case 'z':
		if ( newSlice<0 || newSlice>=z_width || currentSlice<0 || currentSlice>=z_width  ) {
			window.console.log("Error: Slice out of range");
			return null; //error
		}
		
		//change Z plane (easy)
		labelmap._slicesZ._children[newSlice]._texture._rawData = new Uint8Array(labelmap._slicesZ._children[currentSlice]._texture._rawData);
		
		for(var x=0; x<x_width; x++) {
		for(var y=0; y<y_width; y++) {
			//change labelmap._image
			labelmap._image[newSlice][y][x] = labelmap._image[currentSlice][y][x];
			
			//change X plane (hard)
			labelmap._slicesX._children[x]._texture._rawData[(newSlice*y_width+parseInt(y))*4]   =	labelmap._slicesX._children[x]._texture._rawData[(currentSlice*y_width+parseInt(y))*4];
			labelmap._slicesX._children[x]._texture._rawData[(newSlice*y_width+parseInt(y))*4+1] =	labelmap._slicesX._children[x]._texture._rawData[(currentSlice*y_width+parseInt(y))*4+1];
			labelmap._slicesX._children[x]._texture._rawData[(newSlice*y_width+parseInt(y))*4+2] =	labelmap._slicesX._children[x]._texture._rawData[(currentSlice*y_width+parseInt(y))*4+2];
			labelmap._slicesX._children[x]._texture._rawData[(newSlice*y_width+parseInt(y))*4+3] =	labelmap._slicesX._children[x]._texture._rawData[(currentSlice*y_width+parseInt(y))*4+3];	
					
			//change Y plane (hard)
			labelmap._slicesY._children[y]._texture._rawData[(newSlice*x_width+parseInt(x))*4]   =	labelmap._slicesY._children[y]._texture._rawData[(currentSlice*x_width+parseInt(x))*4];
			labelmap._slicesY._children[y]._texture._rawData[(newSlice*x_width+parseInt(x))*4+1] =	labelmap._slicesY._children[y]._texture._rawData[(currentSlice*x_width+parseInt(x))*4+1];
			labelmap._slicesY._children[y]._texture._rawData[(newSlice*x_width+parseInt(x))*4+2] =	labelmap._slicesY._children[y]._texture._rawData[(currentSlice*x_width+parseInt(x))*4+2];
			labelmap._slicesY._children[y]._texture._rawData[(newSlice*x_width+parseInt(x))*4+3] =	labelmap._slicesY._children[y]._texture._rawData[(currentSlice*x_width+parseInt(x))*4+3];	
			}}
		break;
	default:
		window.console.log('Error: invalid view.');
		break;
	}
	
	
	
	if (newSlice != null) {
		// For undo/redo function
		while (losp_slices._undoRedo._redo.pop() != null);
		losp_addUndoRedo(true, volume._labelmap); // Add to undo
		
		// To change 3D rendering
		volume.labelmap.modified();
		
		losp_updateCurrent(volume._labelmap); // Update current state
	}
	
	return newSlice;
}

//check if 4 ints are equal
function losp_checkequal (A, B, C, D) {
	if (Math.floor(A+0.5) != Math.floor(B+0.5))
		return false;
	if (Math.floor(A+0.5) != Math.floor(C+0.5))
		return false;
	if (Math.floor(A+0.5) != Math.floor(D+0.5))
		return false;
	return true;
}

function losp_2D_fill(x, y, z, view, id, labelmap) {
	//find dimensions						//same as  \/
	var x_width = labelmap._dimensions[0]; //labelmap._children[0]._children.length;
	var y_width = labelmap._dimensions[1]; //labelmap._children[1]._children.length;
	var z_width = labelmap._dimensions[2]; //labelmap._children[2]._children.length;
	
	if (x_width < 1 || y_width < 1 || z_width < 1) {
		window.console.log('Error, non valid array size');
		return -1; //error
	}
	
	//check if pixel is inside bounds
	if (0>x || x_width<=x || 0>y || y_width<=y || 0>z || z_width<=z) {
		return; //dead end
	}
	
	if (!labelmap._colortable._map.containsKey(id)) {
		window.console.log('Error, non valid color id');
		return -1; //error
	}
	
	//look up red, blue, green from colormapping	
	var colors = labelmap._colortable._map.get(id);
	var name =  colors[0];
	var red =   colors[1]*255.0;
	var green = colors[2]*255.0;
	var blue =  colors[3]*255.0;
	var trans = colors[4]*255.0;
	
	var pos=new Array();
	pos=[x,y,z];
	var queue=new Queue();
	
	queue.enqueue(pos);
	while(!queue.isEmpty())
	{
		var curr=queue.dequeue();
		x=curr[0];
		y=curr[1];
		z=curr[2];	

		//check if pixel is inside bounds
		if (0>x || x_width<=x || 0>y || y_width<=y || 0>z || z_width<=z) {
			continue; //dead end
		}
	
		//find color in 4 sources, confirm 3 rawData
		var Xred   = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4];
		var Xgreen = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+1];
		var Xblue  = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+2];
		var Xtrans = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+3];
	
		var Yred   = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4];
		var Ygreen = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+1];
		var Yblue  = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+2];
		var Ytrans = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+3];
	
		var Zred   = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4];
		var Zgreen = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+1];
		var Zblue  = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+2];
		var Ztrans = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+3];
	
		if (! (losp_checkequal(Xred, Xred, Yred, Zred) && losp_checkequal(Xgreen, Xgreen, Ygreen, Zgreen) && losp_checkequal(Xblue, Xblue, Yblue, Zblue) && losp_checkequal(Xtrans, Xtrans, Ytrans, Ztrans) ) ) {
			window.console.log("Error: color inconsitency");
			return -1; //error
		}
		
		//if pixel is already colored, end of line
		if (red==Xred && green==Xgreen && blue==Xblue && trans==Xtrans) {
			continue; //dead end
		}
	
		losp_change_pixel(x, y, z, id, labelmap);

		//call on all 4 adjacent pixels
		switch (view)
		{
		case 'x':
			pos=[x,y+1,z];
			queue.enqueue(pos);
			pos=[x,y-1,z];
			queue.enqueue(pos);
			pos=[x,y,z+1];
			queue.enqueue(pos);
			pos=[x,y,z-1];
			queue.enqueue(pos);
			break;
		case 'y':
			pos=[x+1,y,z];
			queue.enqueue(pos);
			pos=[x-1,y,z];
			queue.enqueue(pos);
			pos=[x,y,z+1];
			queue.enqueue(pos);
			pos=[x,y,z-1];
			queue.enqueue(pos);
			break;
		case 'z':
			pos=[x,y+1,z];
			queue.enqueue(pos);
			pos=[x,y-1,z];
			queue.enqueue(pos);
			pos=[x+1,y,z];
			queue.enqueue(pos);
			pos=[x-1,y,z];
			queue.enqueue(pos);
			break;
		default:
			window.console.log('Error: invalid view.');
		}
		
	}
	
}

function colorSelector(x,y,z,labelmap) {
	console.log(labelmap);
	var colorid = labelmap._image[z][y][x];
	if(colorid == 0)
		console.log("Invalid selection");
	else {
			var map = labelmap._colortable._map;
			var value = map.get(colorid);
			var rgba = {};
			rgba.r = Math.floor(value[1]*255);
			rgba.g = Math.floor(value[2]*255);
			rgba.b = Math.floor(value[3]*255);
			rgba.a = undefined;
			var rgbaColor = [rgba.r, rgba.g, rgba.b, rgba.a];
			losp_slices._brush._color = rgbaColor;
			var hexColor = ((1 << 24) + (rgba.r << 16) + (rgba.g << 8) + rgba.b).toString(16).substr(1);
			$('#brushColor').miniColors('value','#' + hexColor);
	}
}

function losp_magic_fill(x, y, z, view, id, volume, is3d) {
	//zzztodo update range, disable options
	var labelmap = volume._labelmap;
	
	//find dimensions						//same as  \/
	var x_width = labelmap._dimensions[0]; //labelmap._children[0]._children.length;
	var y_width = labelmap._dimensions[1]; //labelmap._children[1]._children.length;
	var z_width = labelmap._dimensions[2]; //labelmap._children[2]._children.length;
	
	if (x_width < 1 || y_width < 1 || z_width < 1) {
		window.console.log('Error, non valid array size');
		return -1; //error
	}	

	//check if pixel is inside bounds
	if (0>x || x_width<=x || 0>y || y_width<=y || 0>z || z_width<=z) {
		return; //dead end
	}

	if (!labelmap._colortable._map.containsKey(id)) {
		window.console.log('Error, non valid color id');
		return -1; //error
	}
	
	//look up red, blue, green from colormapping	
	var colors = labelmap._colortable._map.get(id);
	var name =  colors[0];
	var red =   colors[1]*255.0;
	var green = colors[2]*255.0;
	var blue =  colors[3]*255.0;
	var trans = colors[4]*255.0;
	
	var intensity_low = volume._image[z][y][x]-5;
	var intensity_high = volume._image[z][y][x]+5
	
	var pos=new Array();
	pos=[x,y,z];

	var queue=new Queue();
	
	queue.enqueue(pos);
	
	while(!queue.isEmpty())
	{
		var curr=queue.dequeue();
		x=curr[0];
		y=curr[1];
		z=curr[2];	

		//check if pixel is inside bounds
		if (0>x || x_width<=x || 0>y || y_width<=y || 0>z || z_width<=z) {
			continue; //dead end
		}
		
		//find color in 4 sources, confirm 3 rawData
		var Xred   = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4];
		var Xgreen = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+1];
		var Xblue  = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+2];
		var Xtrans = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+3];
	
		var Yred   = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4];
		var Ygreen = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+1];
		var Yblue  = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+2];
		var Ytrans = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+3];
	
		var Zred   = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4];
		var Zgreen = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+1];
		var Zblue  = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+2];
		var Ztrans = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+3];
	
		if (! (losp_checkequal(Xred, Xred, Yred, Zred) && losp_checkequal(Xgreen, Xgreen, Ygreen, Zgreen) && losp_checkequal(Xblue, Xblue, Yblue, Zblue) && losp_checkequal(Xtrans, Xtrans, Ytrans, Ztrans) ) ) {
			window.console.log("Error: color inconsitency");
			return -1; //error
		}
	
		//if pixel is already colored, end of line
		if (red==Xred && green==Xgreen && blue==Xblue && trans==Xtrans) {
			continue; //dead end
		}
	
		// if pixel is out of current intensity, skip
		if (volume._image[z][y][x] < intensity_low || volume._image[z][y][x] > intensity_high) {
			// window.console.log("here " + volume._image[z][y][x]);
			continue; 
		}
	
		losp_change_pixel(x, y, z, id, labelmap);
		//call on all 4 adjacent pixels
		
		
		if (is3d) {
			pos=[x,y+1,z];
			queue.enqueue(pos);
			pos=[x,y-1,z];
			queue.enqueue(pos);
			pos=[x,y,z+1];
			queue.enqueue(pos);
			pos=[x,y,z-1];
			queue.enqueue(pos);
			pos=[x+1,y,z];
			queue.enqueue(pos);
			pos=[x-1,y,z];
			queue.enqueue(pos);
		} else {
			switch (view)
			{
			case 'x':
				pos=[x,y+1,z];
				queue.enqueue(pos);
				pos=[x,y-1,z];
				queue.enqueue(pos);
				pos=[x,y,z+1];
				queue.enqueue(pos);
				pos=[x,y,z-1];
				queue.enqueue(pos);
				break;
			case 'y':
				pos=[x+1,y,z];
				queue.enqueue(pos);
				pos=[x-1,y,z];
				queue.enqueue(pos);
				pos=[x,y,z+1];
				queue.enqueue(pos);
				pos=[x,y,z-1];
				queue.enqueue(pos);
				break;
			case 'z':
				pos=[x,y+1,z];
				queue.enqueue(pos);
				pos=[x,y-1,z];
				queue.enqueue(pos);
				pos=[x+1,y,z];
				queue.enqueue(pos);
				pos=[x-1,y,z];
				queue.enqueue(pos);
				break;
			default:
				window.console.log('Error: invalid view.');
			}
		}
	}
}
 

//check to make sure that the labelmap and rawDatas are consistent by checking percent% of pixels
function losp_checkimage (labelmap, percent) {
	window.console.log("check start");
	if(typeof(percent)==='undefined') percent = 100.0;
	
	var x_width = labelmap._dimensions[0]; //labelmap._children[0]._children.length;
	var y_width = labelmap._dimensions[1]; //labelmap._children[1]._children.length;
	var z_width = labelmap._dimensions[2]; //labelmap._children[2]._children.length;
	
	if (x_width < 1 || y_width < 1 || z_width < 1) {
		window.console.log('Error, non valid array size');
		return -1; //error
	}
	
	var x, y, z;
	for (x=0; x<x_width; x++) {
	for (y=0; y<y_width; y++) {
	for (z=0; z<z_width; z++) {
		if (Math.floor(percent <= Math.random()*100.0))
			continue;
		//find color in 4 sources, confirm 3 rawData
		var Xred   = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4];
		var Xgreen = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+1];
		var Xblue  = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+2];
		var Xtrans = labelmap._slicesX._children[x]._texture._rawData[(z*y_width+y)*4+3];
		var Yred   = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4];
		var Ygreen = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+1];
		var Yblue  = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+2];
		var Ytrans = labelmap._slicesY._children[y]._texture._rawData[(z*x_width+x)*4+3];
		var Zred   = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4];
		var Zgreen = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+1];
		var Zblue  = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+2];
		var Ztrans = labelmap._slicesZ._children[z]._texture._rawData[(y*x_width+x)*4+3];
		var imageId = labelmap._image[z][y][x];
		var imagecolors = labelmap._colortable._map.get(imageId);
		var Ired =   imagecolors[1]*255.0;
		var Igreen = imagecolors[2]*255.0;
		var Iblue =  imagecolors[3]*255.0;
		var Itrans = imagecolors[4]*255.0;
		
		//this test does not look at labelmap://if (! (losp_checkequal(Xred, Xred, Yred, Zred) && losp_checkequal(Xgreen, Xgreen, Ygreen, Zgreen) && losp_checkequal(Xblue, Xblue, Yblue, Zblue) && losp_checkequal(Xtrans, Xtrans, Ytrans, Ztrans) ) ) {
		if (! (losp_checkequal(Ired, Xred, Yred, Zred) && losp_checkequal(Igreen, Xgreen, Ygreen, Zgreen) && losp_checkequal(Iblue, Xblue, Yblue, Zblue) && losp_checkequal(Itrans, Xtrans, Ytrans, Ztrans) ) ) {
			window.console.log("INCONSISTENCY FOUND: ("+x+", "+y+", "+z+")");
			return;
		}
		
	}}}
	window.console.log("check complete: data consistent");
}

//the main function call, gets called in onMouseMovementInside(drag=true) AND onMouseUp(drag=false)
function losp_MouseMove(id, drag, evt) {
	var slicedata = null;
	var view = null;
	switch (id)
	{
	case 10:
		slicedata = losp_slices._Xslice;
		view = 'x';
	  	break;
	case 17:
		slicedata = losp_slices._Yslice;
		view = 'y';
	  	break;
	case 24:
		slicedata = losp_slices._Zslice;
		view = 'z';
	  	break;
	default:
	  	window.console.log('Error: bad _camera._id');
	  	break;
	}

 	if (typeof evt.offsetX != 'undefined') 
 	{
      _paintX = evt.offsetX;
      _paintY = evt.offsetY;
    }
    else 
    	if (typeof evt.layerX != 'undefined') 
    	{
      	_paintX = evt.layerX;
      	_paintY = evt.layerY;
		}
	//var _paintX = evt.offsetX;
	//var _paintY = evt.offsetY;

	var _paintSliceX = 0;
	var _paintSliceY = 0;
	
	var _spacingx = volume._spacing[0];
	var _spacingy = volume._spacing[1];
	var _spacingz = volume._spacing[2];
	
	var _spacingWidth = 1;
	var _spacingHeight = 1;
	if (view == 'x') {
		_spacingWidth = _spacingy;
		_spacingHeight = _spacingz;
	} else if (view == 'y') {
		_spacingWidth = _spacingx;
		_spacingHeight = _spacingz;
	} else if (view == 'z') {
		_spacingWidth = _spacingx;
		_spacingHeight = _spacingy;
	}

	  if (_paintX * _paintY > 0) {
	
		var _sliceRatio = (slicedata._sliceWidth*_spacingWidth)/(slicedata._sliceHeight*_spacingHeight);
		var _viewRatio = slicedata._width/slicedata._height;
	
		if (_viewRatio < _sliceRatio) {
			// letter boxed with black regions on top and bottom
			var _zoomRatio = (slicedata._sliceWidth*_spacingWidth) / slicedata._width;
			var _zoomedSliceHeight = (slicedata._sliceHeight*_spacingHeight) / _zoomRatio;
			var _margin = (slicedata._height - _zoomedSliceHeight)/2;
			_paintSliceY = _paintY - _margin;
			_paintSliceY = _paintSliceY * slicedata._sliceHeight / _zoomedSliceHeight;
			_paintSliceX = _paintX * slicedata._sliceWidth / slicedata._width;
		} else {
			// letter boxed with black regions on sides
			var _zoomRatio = slicedata._sliceHeight*_spacingHeight / slicedata._height;
			var _zoomedSliceWidth = (slicedata._sliceWidth*_spacingWidth) / _zoomRatio;
			var _margin = (slicedata._width - _zoomedSliceWidth)/2;
			_paintSliceX = _paintX - _margin;
			_paintSliceX = _paintSliceX * slicedata._sliceWidth / _zoomedSliceWidth;
			_paintSliceY = _paintY * slicedata._sliceHeight / slicedata._height;
		}
	
		if (_paintSliceX * _paintSliceY > 0) {
			_paintSliceX = Math.floor(_paintSliceX+0.5);
			_paintSliceY = Math.floor(_paintSliceY+0.5);
			_paintSliceZ = Math.floor(slicedata._currentSlice+0.49);
	
			//losp
			//find dimensions						//same as  \/
			var x_width = volume._labelmap._dimensions[0]; //labelmap._children[0]._children.length;
			var y_width = volume._labelmap._dimensions[1]; //labelmap._children[1]._children.length;
			var z_width = volume._labelmap._dimensions[2]; //labelmap._children[2]._children.length;
			//*
	
			var xx, yy, zz, plane;
			
			switch (view) {
				case 'x':
					x = _paintSliceZ
					y = y_width - _paintSliceX;
					z = z_width - _paintSliceY;
					break;
				case 'y':
					x = x_width - _paintSliceX;
					y = _paintSliceZ;
					z = z_width - _paintSliceY;
					break;
				case 'z':
					x = x_width - _paintSliceX;
					y = y_width - _paintSliceY;
					z = _paintSliceZ;
					break;
				default:
					window.console.log('Error: bad _camera._id');
					break;
			}
			
			// check color label map
			var color = losp_slices._brush._color;
			var map = volume._labelmap._colortable._map;
			var colorid = -1;
			var keys = map.getKeys();
			for(var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var value = map.get(key);
				if (Math.floor(value[1]*255) == color[0] && Math.floor(value[2]*255) == color[1]
					&& Math.floor(value[3]*255) == color[2]) {
						colorid = key;
						break;
				}
			}
			if (colorid == -1) {
				// couldn't find same color, create id for it
				colorid = volume._labelmap._colortable._nextid;
				if (colorid > 255) {
					window.console.log("Warning: color label map count is over 256. ");
				}
				volume._labelmap._colortable._nextid++;
				var value = new Array("", color[0]/255, color[1]/255, color[2]/255, 1);
				map.set(colorid, value);
			}
			losp_slices._brush._colorid = colorid;
			
			if (losp_slices._brush._mode == 1) //paint
				losp_planerDot(x, y, z, view, losp_slices._brush._size, losp_slices._brush._colorid, volume._labelmap);
			else if (losp_slices._brush._mode==2 && !drag) 
				losp_2D_fill(x, y, z, view, losp_slices._brush._colorid, volume._labelmap);
			else if (losp_slices._brush._mode==3 && !drag) 
				losp_magic_fill(x, y, z, view, losp_slices._brush._colorid, volume, false);
			else if (losp_slices._brush._mode==4 && !drag) 
				losp_magic_fill(x, y, z, view, losp_slices._brush._colorid, volume, true);
			else if (losp_slices._brush._mode==5 && !drag) 
				colorSelector(x, y, z,volume._labelmap);
				
		}
	}
}

X.interactor.prototype.onMouseMovementInside_ = function(event) {
	
	if (this instanceof X.interactor2D && this._leftButtonDown) {
		losp_MouseMove(this._id, true, event);
	}
  this['mousemoveEvent'] = event; // we need to buffer the event to run eval in
  // advanced compilation
  eval("this.onMouseMove(this['mousemoveEvent'])");
  
  this._mouseInside = true;
  
  if (this._config['KEYBOARD_ENABLED'] && window.onkeydown == null) {
    
    // we re-gained the focus, enable the keyboard observer again!
    window.onkeydown = this.onKey_.bind(this);
    

  }
  
  // prevent any other actions by the browser (f.e. scrolling, selection..)
  event.preventDefault();
  
  // is shift down?
  var shiftDown = event.shiftKey;
  
  // grab the current mouse position
  this._mousePosition = [event.offsetX, event.offsetY];
  var currentMousePosition = new goog.math.Vec2(this._mousePosition[0],
      this._mousePosition[1]);
  
  // get the distance in terms of the last mouse move event
  var distance = this._lastMousePosition.subtract(currentMousePosition);
  
  // save the current mouse position as the last one
  this._lastMousePosition = currentMousePosition.clone();
  
  // 
  // hovering, if enabled..
  //
  if (this._config['HOVERING_ENABLED']) {
    
    if (Math.abs(distance.x) > 0 || Math.abs(distance.y) > 0 ||
        this._middleButtonDown || this._leftButtonDown || this._rightButtonDown) {
      
      // there was some mouse movement, let's cancel the hovering countdown
      this.hoverEnd_();
      
    }
    
    // start the hovering countdown
    // if the mouse does not move for 2 secs, fire the HoverEvent to initiate
    // picking etc.
    this.hoverTrigger = setTimeout(function() {

      this.hoverEnd_();
      
      var e = new X.event.HoverEvent();
      e._x = currentMousePosition.x;
      e._y = currentMousePosition.y;
      
      this.dispatchEvent(e);
      
      // reset the trigger
      this.hoverTrigger = null;
      
    }.bind(this), 300);
    
  }
  
  // threshold the distance to avoid 'irregular' movement
  if (Math.abs(distance.x) < 2) {
    
    distance.x = 0;
    
  }
  if (Math.abs(distance.y) < 2) {
    
    distance.y = 0;
    
  }
  
  // jump out if the distance is 0 to avoid unnecessary events
  if (distance.magnitude() == 0) {
    
    return;
    
  }
  
  
  //
  // check which mouse buttons or keys are pressed
  //
  if (this._leftButtonDown && !shiftDown) {
    //
    // LEFT MOUSE BUTTON DOWN AND NOT SHIFT DOWN
    //
    
    // create a new rotate event
    var e = new X.event.RotateEvent();
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  } else if (this._middleButtonDown || (this._leftButtonDown && shiftDown)) {
    //
    // MIDDLE MOUSE BUTTON DOWN or LEFT MOUSE BUTTON AND SHIFT DOWN
    //
    
    // create a new pan event
    var e = new X.event.PanEvent();
    
    // panning in general moves pretty fast, so we threshold the distance
    // additionally
    if (distance.x > 5) {
      
      distance.x = 5;
      
    } else if (distance.x < -5) {
      
      distance.x = -5;
      
    }
    if (distance.y > 5) {
      
      distance.y = 5;
      
    } else if (distance.y < -5) {
      
      distance.y = -5;
      
    }
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  } else if (this._rightButtonDown) {
    //
    // RIGHT MOUSE BUTTON DOWN
    //
    
    // create a new zoom event
    var e = new X.event.ZoomEvent();
    
    // set the zoom direction
    // true if zooming in, false if zooming out
    e._in = (distance.y > 0);
    
    // with the right click, the zoom will happen rather
    // fine than fast
    e._fast = false;
    
    // .. fire the event
    this.dispatchEvent(e);
    

  }
  
};


/**
 * Stop the hover countdown and fire a X.event.HoverEndEvent.
 *
 * @protected
 */
X.interactor.prototype.hoverEnd_ = function() {

  if (this.hoverTrigger) {
    clearTimeout(this.hoverTrigger);
  }
  
  var e = new X.event.HoverEndEvent();
  this.dispatchEvent(e);
  
};


/**
 * Overload this function to execute code on mouse wheel events.
 * 
 * @param {Event} event The browser fired mousewheel event.
 */
X.interactor.prototype.onMouseWheel = function(event) {

  // do nothing
  
};


/**
 * Internal callback for mouse wheel events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onMouseWheel_ = function(event) {

  this['mouseWheelEvent'] = event;
  eval("this.onMouseWheel(this['mouseWheelEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent any other action (like scrolling..)
  event.preventDefault();
  
};


/**
 * Overload this function to execute code on keyboard events.
 * 
 * @param {Event} event The browser fired keyboard event.
 */
X.interactor.prototype.onKey = function(event) {

  // do nothing
  
};


/**
 * Overload this function to execute code on keyboard events.
 * 
 * @param {Event} event The browser fired keyboard event.
 */
X.interactor.prototype.rotate = function(x, y) {

  
	// create a new rotate event
	var e = new X.event.RotateEvent();

    // attach the distance vector
    e._distance = [x, y];
   	this.dispatchEvent(e);
  
};


/**
 * Callback for keyboard events on the associated DOM element. This fires proper
 * X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.interactor.prototype.onKey_ = function(event) {

  // only listen to key events if the mouse is inside our element
  // this f.e. enables key event listening for multiple renderers
  if (!this._mouseInside) {
    
    return;
    
  }
  
  this['keyEvent'] = event; // buffering..
  eval("this.onKey(this['keyEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // observe the control keys (shift, alt, ..)
  var alt = event.altKey;
  var ctrl = event.ctrlKey;
  var meta = event.metaKey; // this is f.e. the windows or apple key
  var shift = event.shiftKey;
  
  // get the keyCode
  var keyCode = event.keyCode;
  
  if (keyCode == 82 && !alt && !ctrl && !meta && !shift) {
    
    // 'r' but without any other control keys since we do not want to limit the
    // user to press for example CTRL+R to reload the page
    
    // prevent any other actions..
    event.preventDefault();
    
    // fire the ResetViewEvent
    var e = new X.event.ResetViewEvent();
    this.dispatchEvent(e);
    
  } else if (keyCode >= 37 && keyCode <= 40) {
    
    // keyCode <= 37 and >= 40 means the arrow keys
    
    // prevent any other actions..
    event.preventDefault();
    
    var e = null;
    
    if (shift) {
      
      // create a new pan event
      e = new X.event.PanEvent();
      
    } else if (alt) {
      
      // create a new zoom event
      e = new X.event.ZoomEvent();
      
    } else {
      // create a new rotate event for 3D or a new scroll event for 2D
      e = new X.event.RotateEvent();
      if (this instanceof X.interactor2D) {
        e = new X.event.ScrollEvent();
      }
      
    }
    
    if (!e) {
      
      // should not happen but you never know with key interaction
      return;
      
    }
    
    // create a distance vector
    var distance = new goog.math.Vec2(0, 0);
    
    if (keyCode == 37) {
      // '<-' LEFT
      distance.x = 5;
      e._up = false; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._up = true;
        e._in = true;
        e._fast = false;
      }
      
    } else if (keyCode == 39) {
      // '->' RIGHT
      distance.x = -5;
      e._up = true; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = false;
        e._fast = false;
      }
      
    } else if (keyCode == 38) {
      // '^-' TOP
      distance.y = 5;
      e._up = true; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = true;
        e._fast = true;
      }
      
    } else if (keyCode == 40) {
      // '-v' BOTTOM
      distance.y = -5;
      e._up = false; // scroll direction
      if (alt) {
        // for zoom, we configure the zooming behavior
        e._in = false;
        e._fast = true;
      }
      
    }
    
    // attach the distance vector
    e._distance = distance;
    
    // .. fire the event
    this.dispatchEvent(e);
    
  }
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.interactor', X.interactor);
goog.exportSymbol('X.interactor.prototype.init', X.interactor.prototype.init);
goog.exportSymbol('X.interactor.prototype.onMouseDown',
    X.interactor.prototype.onMouseDown);
goog.exportSymbol('X.interactor.prototype.onMouseUp',
    X.interactor.prototype.onMouseUp);
goog.exportSymbol('X.interactor.prototype.onMouseMove',
    X.interactor.prototype.onMouseMove);
goog.exportSymbol('X.interactor.prototype.onMouseWheel',
    X.interactor.prototype.onMouseWheel);
goog.exportSymbol('X.interactor.prototype.onKey', X.interactor.prototype.onKey); // this._rightButtonDown = true;

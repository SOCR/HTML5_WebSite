// volume panel javascript
jQuery(function() {

  //
  // VOLUME
  //
  jQuery('#volumerendering').button();
  jQuery('#volumerendering').unbind('mouseenter').unbind('mouseleave');
  jQuery('#volumerendering').click(function() {

    jQuery('#slicing').removeClass('twothreeDSelected');
    jQuery('#volumerendering').addClass('twothreeDSelected');
    jQuery('#windowlevel-label').hide();
    jQuery('#windowlevel-volume').hide();
    jQuery('#opacity-label').show();
    jQuery('#opacity-volume').show();
    
    volumerenderingOnOff(true);
    labelVolumeToShape(true);
    
  });
  jQuery('#slicing').button();
  jQuery('#slicing').addClass('twothreeDSelected');
  jQuery('#slicing').unbind('mouseenter').unbind('mouseleave');
  jQuery('#slicing').click(function() {

    jQuery('#volumerendering').removeClass('twothreeDSelected');
    jQuery('#slicing').addClass('twothreeDSelected');
    jQuery('#opacity-label').hide();
    jQuery('#opacity-volume').hide();
    jQuery('#windowlevel-label').show();
    jQuery('#windowlevel-volume').show();
    
    volumerenderingOnOff(false);
    labelVolumeToShape(false);
    
  });
  jQuery('#modes').buttonset();
  
  jQuery('#brushColor').miniColors({
    letterCase: 'uppercase',
    change: brushColor
  });
  
  jQuery('#bgColorVolume').miniColors({
    letterCase: 'uppercase',
    change: bgColorVolume
  });
  
  jQuery('#fgColorVolume').miniColors({
    letterCase: 'uppercase',
    change: fgColorVolume
  });

  jQuery('#currentBackground').miniColors({
    letterCase: 'uppercase',
    change: currentBackground  
  });
  
  
  jQuery('#inverted').button();
  
  jQuery('#color2').button();
  
  jQuery('#colormodes').buttonset();
  jQuery('#inverted').removeClass('ui-corner-left').addClass('ui-corner-top');
  jQuery('#color2').removeClass('ui-corner-right').addClass('ui-corner-bottom');
  
  jQuery('#windowlevel-volume').dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    // connect to x.controller.js
    slide: windowLevelVolume
  });
  jQuery('#windowlevel-volume').width(140);
  
  jQuery('#opacity-volume').slider({
    slide: opacity3dVolume
  });
  jQuery('#opacity-volume').width(140);
  jQuery('#opacity-volume').hide();
  jQuery('#opacity-label').hide();
  
  jQuery('#threshold-volume').dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    // connect to x.controller.js
    slide: thresholdVolume
  });
  jQuery('#threshold-volume').width(140);
  
  //
  // LABELMAP
  //
  
  jQuery('#labelmapvisibility').click(function() {

    toggleLabelmapVisibility();
  });
  

  jQuery('#opacity-labelmap').slider({
    slide: opacityLabelmap
  });
  jQuery('#opacity-labelmap').width(140);
  
  // TODO: added
  // Additional Options
  //
//   
  // jQuery('#colorId').keyup(function() {
  	// colorIdChange();
  // });
//   
  jQuery('#paintBrushSize').change(function() {
  	paintBrushSize();
  });
  
  jQuery("#recentColors option[value=#000000]").hide();
  jQuery('#favColors').change(function() {
  	usedColors();
  });
  
  
  jQuery('#eraserOption').click(function() {
  	eraserOption();
  });
  
  jQuery('#2dBucketOption').click(function() {
  	toggle2dBucketOption();
  });
  
  jQuery('#undo-icon').click(function() {
  	toggleUndoOption();
  });
  
  jQuery('#redo-icon').click(function() {
  	toggleRedoOption();
  });
  
  jQuery('#clobberOption').click(function() {
  	toggleClobberOption();
  });
  jQuery('#3dBucketOption').click(function() {
  	toggle3dBucketOption();
  });
//   
  // jQuery('#copyNext').click(function() {
  	// copyNextOption();
  // });
//   
  // jQuery('#copyPrev').click(function() {
  	// copyPrevOption();
  // });
// //   
  // jQuery('#sliceNum').bind('keypress', function(e) {
  	// sliceNumOption(e);
  // });
//   
  jQuery('#sliceXPrev').click(function() {
  	changeSliceOption('X', true);
  });
  
  jQuery('#sliceXNext').click(function() {
  	changeSliceOption('X', false);
  });
  
  jQuery('#sliceYPrev').click(function() {
  	changeSliceOption('Y', true);
  });
  
  jQuery('#sliceYNext').click(function() {
  	changeSliceOption('Y', false);
  });
  
  jQuery('#sliceZPrev').click(function() {
  	changeSliceOption('Z', true);
  });
  
  jQuery('#sliceZNext').click(function() {
  	changeSliceOption('Z', false);
  });
  
  jQuery('#switchButtonX').click(function() {
  	if(!switched) {
  		switchButton('sliceX');
  		switched = true;
  	}
  	else {
  		if(_current_X_content instanceof X.renderer2D) {
  			switchButton('ren3d');
  			switchButton('sliceX');
  		}
  		else {
  			switchButton('ren3d');
  			switched = false;
  		}
  	}  
  });
  
  jQuery('#switchButtonY').click(function() {
  	if(!switched) {
  		switchButton('sliceY')
  		switched = true;
  	}
  	else {
  		if(_current_Y_content instanceof X.renderer2D) {
  			switchButton('ren3d');
  			switchButton('sliceY');
  		}
  		else {
  			switchButton('ren3d');
  			switched = false;
  		}
  	}
  })
  
  jQuery('#switchButtonZ').click(function() {
  	if(!switched) {
  		switchButton('sliceZ');
  		switched = true;
  	}
  	else {
  		if(_current_Z_content instanceof X.renderer2D) {
  			switchButton('ren3d');
  			switchButton('sliceZ');
  		}
  		else {
  			switchButton('ren3d');
  			switched = false;
  		}
  	}
  })
 
  jQuery('#colorpicker-icon').button({ icons: { primary: "ui-icon-colorpicker" }, text: false });
  jQuery('#brush-icon').button({ icons: { primary: "ui-icon-brush" }, text: false });
  jQuery('#bucket-icon').button({ icons: { primary: "ui-icon-bucket" }, text: false });
  jQuery('#copy-icon').button({ icons: { primary: "ui-icon-copy-zz" }, text: false });
  jQuery('#paste-icon').button({ icons: { primary: "ui-icon-paste-zz" }, text: false });
  jQuery('#redo-icon').button({ icons: { primary: "ui-icon-redo" }, text: false });
  jQuery('#undo-icon').button({ icons: { primary: "ui-icon-undo" }, text: false });
  jQuery('#eraser-icon').button({ icons: { primary: "ui-icon-eraser" }, text: false });
  jQuery('#save-icon').button({ icons: { primary: "ui-icon-save" }, text: false });
  jQuery('#magic2d-icon').button({ icons: { primary: "ui-icon-magic-2d" }, text: false });
  jQuery('#magic3d-icon').button({ icons: { primary: "ui-icon-magic-3d" }, text: false });
        
  jQuery('#brush-icon').click(function() {
    jQuery('#brush-icon').addClass('clicked-button');
    jQuery('#bucket-icon').removeClass('clicked-button');
    jQuery('#eraser-icon').removeClass('clicked-button');
    jQuery('#magic2d-icon').removeClass('clicked-button');
    jQuery('#magic3d-icon').removeClass('clicked-button');
    jQuery('#colorpicker-icon').removeClass('clicked-button');
    toggleOption();
  });
  jQuery('#bucket-icon').click(function() {
    jQuery('#bucket-icon').addClass('clicked-button');
    jQuery('#brush-icon').removeClass('clicked-button');
    jQuery('#eraser-icon').removeClass('clicked-button');
    jQuery('#magic2d-icon').removeClass('clicked-button');
    jQuery('#magic3d-icon').removeClass('clicked-button');
    jQuery('#colorpicker-icon').removeClass('clicked-button');
    toggleOption();
  });
  jQuery('#eraser-icon').click(function() {
    jQuery('#eraser-icon').addClass('clicked-button');
    jQuery('#bucket-icon').removeClass('clicked-button');
    jQuery('#brush-icon').removeClass('clicked-button');
    jQuery('#magic2d-icon').removeClass('clicked-button');
    jQuery('#magic3d-icon').removeClass('clicked-button');
    jQuery('#colorpicker-icon').removeClass('clicked-button');
    toggleOption();
  });
  jQuery('#magic2d-icon').click(function() {
    jQuery('#magic2d-icon').addClass('clicked-button');
    jQuery('#bucket-icon').removeClass('clicked-button');
    jQuery('#brush-icon').removeClass('clicked-button');
    jQuery('#eraser-icon').removeClass('clicked-button');
    jQuery('#magic3d-icon').removeClass('clicked-button');
    jQuery('#colorpicker-icon').removeClass('clicked-button');
    toggleOption();
  });
  jQuery('#magic3d-icon').click(function() {
    jQuery('#magic3d-icon').addClass('clicked-button');
    jQuery('#bucket-icon').removeClass('clicked-button');
    jQuery('#brush-icon').removeClass('clicked-button');
    jQuery('#magic2d-icon').removeClass('clicked-button');
    jQuery('#eraser-icon').removeClass('clicked-button');
    jQuery('#colorpicker-icon').removeClass('clicked-button');
    toggleOption();
  });
  
 jQuery('#colorpicker-icon').click(function() {
    jQuery('#colorpicker-icon').addClass('clicked-button');
    jQuery('#bucket-icon').removeClass('clicked-button');
    jQuery('#brush-icon').removeClass('clicked-button');
    jQuery('#magic2d-icon').removeClass('clicked-button');
    jQuery('#eraser-icon').removeClass('clicked-button');
    jQuery('#magic3d-icon').removeClass('clicked-button');
    toggleOption();
  });
  
  jQuery("#copy-view").buttonset();
  
  jQuery('#copy-icon').click(function() {
  	copyOpenOption();
  });
  
  jQuery('#copy-view-x').click(function() {
  	copyViewSelected();
  });
  jQuery('#copy-view-y').click(function() {
  	copyViewSelected();
  });
  jQuery('#copy-view-z').click(function() {
  	copyViewSelected();
  });
  
  jQuery('#copy-button').click(function() {
  	sliceCopyAction();
  });

  jQuery('#close-button').click(function() {
  	if (jQuery("#copy-dialog").is(":visible")) {
		jQuery("#copy-dialog").dialog('close');
	}
  });
	
  jQuery('#save-icon').click(function() {
  	saveFile();
  });
});

<?php

header("Access-Control-Allow-Origin: *");

if (!isset($_POST['x']) || !isset($_POST['y']) || !isset($_POST['z']) || !isset($_POST['data']))
	die("Error: invalid arguments or over post_max_size");

$data = $_POST['data'];

$dim_x = $_POST['x'];
$dim_y = $_POST['y'];
$dim_z = $_POST['z'];

$pix_x = $_POST['pixx'];
if ($pix_x == 0) {
	$pix_x = 1;
}
$pix_y = $_POST['pixy'];
if ($pix_y == 0) {
	$pix_y = 1;
}
$pix_z = $_POST['pixz'];
if ($pix_z == 0) {
	$pix_z = 1;
}


$date = date_create();
$tmpt = date_timestamp_get($date)%10000;
$filename_base = "file-".$tmpt."-".rand(0,10000);
$filename = $filename_base.".nii";

$fp = fopen('output/'.$filename, 'w');

// int sizeof_hdr
$binarydata = pack("l*", 348);
fwrite($fp, $binarydata); 

// char data_type[10]
$binarydata = pack("c*", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
fwrite($fp, $binarydata);

// char db_name[18]
$binarydata = pack("c*", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
fwrite($fp, $binarydata);

// int extents
$binarydata = pack("l*", 0);
fwrite($fp, $binarydata);

// short session_error
$binarydata = pack("s*", 0);
fwrite($fp, $binarydata);

// char regular, dim_info
$binarydata = pack("c*", 0, 0);
fwrite($fp, $binarydata);

// short dim[8]
$binarydata = pack("s*", 3, $dim_x, $dim_y, $dim_z, 0, 0, 0, 0);
fwrite($fp, $binarydata);

// float intent_p1, intent_p2, intent_p3
$binarydata = pack("f*", 0, 0, 0);
fwrite($fp, $binarydata);

// short intent_code, datatype, bitpix, slice_start
$binarydata = pack("s*", 0, 4, 16, 0);
fwrite($fp, $binarydata);

// float pixdim[8], vox_offset, scl_slope, scl_inter
$binarydata = pack("f*", 1, $pix_x, $pix_y, $pix_z, 1, 1, 1, 1, 352, 0, 0);
fwrite($fp, $binarydata);

// short slice_end
$binarydata = pack("s*", 0);
fwrite($fp, $binarydata);

// char slice_code, xyzt_units
$binarydata = pack("c*", 0, 0);
fwrite($fp, $binarydata);

// float cal_max, cal_min, slice_duration, toffset
$binarydata = pack("f*", 0, 0, 0, 0);
fwrite($fp, $binarydata);

// int glmax, glmin
$binarydata = pack("l*", 0, 0, 0, 0);
fwrite($fp, $binarydata);

// char descrip[80]
// unused, fill with 20 int/long
$binarydata = pack("l*", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
fwrite($fp, $binarydata);
// char aux_file[24]
// unused, fill with 6 int/long
$binarydata = pack("l*", 0, 0, 0, 0, 0, 0);
fwrite($fp, $binarydata);
// short qform_code, sform_code
$binarydata = pack("s*", 0, 0);
fwrite($fp, $binarydata);

// float quatern_a, quatern_b, quatern_c, quatern_x, quatern_y, quatern_z
$binarydata = pack("f*", 0, 0, 0, 0, 0, 0);
fwrite($fp, $binarydata);
// float srow_x[4], srow_y[4], srow_z[4]
$binarydata = pack("f*", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
fwrite($fp, $binarydata);
// char intent_name[16]
// unused, fill with 4 int/long
$binarydata = pack("l*", 0, 0, 0, 0);
fwrite($fp, $binarydata);

// char magic[4]
$binarydata = pack("c*", 'n', 'i', '1', '\0');
fwrite($fp, $binarydata);


// write data
for ($i=0; $i<$dim_z; $i++) {
	$str_arr1 = preg_split('/;/', $data[$i], null, PREG_SPLIT_NO_EMPTY);
	foreach ($str_arr1 as $item1) {
		$binarydata = NULL;
		if ($item1 == "0") {
			for ($k=0; $k<$dim_x; $k++) {
				$binarydata = $binarydata.pack("s*", 0);
			}
		} else {
			$str_arr = preg_split('/,/', $item1, null, PREG_SPLIT_NO_EMPTY);
			foreach ($str_arr as $item) {
				$binarydata = $binarydata.pack("s*", $item);
			}
		}
		$length = fwrite($fp, $binarydata);
	}
}

fclose($fp);

$gzfile = 'output/'.$filename.".gz";

// Open the gz file (w9 is the highest compression)
$fpgz = gzopen ($gzfile, 'w9');

// Compress the file
gzwrite ($fpgz, file_get_contents('output/'.$filename));

// Close the gz file
gzclose($fpgz);

// remove the original file
unlink('output/'.$filename);

// write color map file is available 
if (isset($_POST['colormap_key']) && isset($_POST['colormap_r']) && 
	isset($_POST['colormap_g']) && isset($_POST['colormap_b']) && isset($_POST['colormap_a'])) {
	$colormap_key = $_POST['colormap_key'];
	$colormap_r = $_POST['colormap_r'];
	$colormap_g = $_POST['colormap_g'];
	$colormap_b = $_POST['colormap_b'];
	$colormap_a = $_POST['colormap_a'];
	$colormap_name = $_POST['colormap_name'];

	if (sizeof($colormap_key) > 0 && sizeof($colormap_key) == sizeof($colormap_r) && 
		sizeof($colormap_r) == sizeof($colormap_g) && sizeof($colormap_g) == sizeof($colormap_b) &&
		sizeof($colormap_b) == sizeof($colormap_a)) {
		
		$filename_colormap = $filename_base.".txt";
		
		$fp = fopen('output/'.$filename_colormap, 'w');
		
		for($i=0; $i<sizeof($colormap_key); $i++) {
			if (isset($colormap_name[$i])) {
				$stringData = $colormap_key[$i]." ". $colormap_name[$i]." ". $colormap_r[$i]." ". $colormap_g[$i]." ". $colormap_b[$i]." ". $colormap_a[$i]."\n";
			} else {
				$stringData = $colormap_key[$i]." undefined ". $colormap_r[$i]." ". $colormap_g[$i]." ". $colormap_b[$i]." ". $colormap_a[$i]."\n";
			}
			fwrite($fp, $stringData);
		}
		
		fclose($fp);
	}
	
}


echo "<br><a href=\"http://".$_SERVER['SERVER_NAME']."/viewer/$gzfile\">Download image file</a>";

if (isset($filename_colormap)) {
	echo "<br><a target=\"_blank\" href=\"http://".$_SERVER['SERVER_NAME']."/viewer/output/$filename_colormap\">Download colormap file.</a>";
}

?>

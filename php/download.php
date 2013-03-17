<?php
 /**
  * @package mycms
  * @copyright bela, http://tbela.net/
  *
  * cms upload handler, cross-browser ajax file upload
  * feel free to use and/or modify
  */

	defined('_JEXEC') or die('Acces denied');
	
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date du passé

	parse_str($_SERVER['QUERY_STRING'], $match);
	
	$match = array_keys($match);

	
	if(is_file($file = uploadHelper::decrypt(array_shift($match)))) {
	
		if(realpath($file) == TEMP_PATH.DS.basename($file)) {
		
			header('Content-Type: application/octet-stream');
			header('Content-Disposition: attachment;filename="'.uploadHelper::safe_name(uploadHelper::getVar('filename', basename($file))).'"');
			header('Content-Length: '.filesize($file));
			
			readfile($file);
			exit();
		}
	}
	
	header('HTTP/1.0 404 Not Found');
	exit();
?>
<?php
 /**
  * @package mycms
  * @copyright bela, http://tbela.net/
  *
  * cms upload handler, cross-browser ajax file upload
  * feel free to use and/or modify
  */

	defined('_JEXEC') or die('Acces denied');
	
	if($_SERVER['REQUEST_METHOD'] == 'POST') {

		$filename = uploadHelper::create_filename(basename($headers['Filename']), TEMP_PATH);
		$path = uploadHelper::encrypt($filename);
		
		file_put_contents($filename, file_get_contents('php://input'));
		
		$size = filesize($filename);		
		$url = $_SERVER['REQUEST_URI'];
		
		if(($pos = strpos($url, '?')) !== false)
			$url = substr($url, 0, $pos);		
  		
		$url .= '?';
		
		header('Content-Type: application/x-json');
		echo json_encode(array('file' => basename($headers['Filename']), 'path' => $path, 'size' => $size, 'remove' => $url.'r='.urlencode($path)));
	
		if($size == 0)
			unlink($filename);
		
		//remove file
	} else if($file = uploadHelper::getVar('r')) {
			
		if(is_file($file = uploadHelper::decrypt($file))) {
		
			$file = realpath($file);
			if(is_file(TEMP_PATH.DS.basename($file)))
				unlink($file);
		}
	}
	
?>
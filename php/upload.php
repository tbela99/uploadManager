<?php
 /**
  * @package mycms
  * @copyright bela, http://tbela.net/
  *
  * cms upload handler, cross-browser ajax file upload
  * feel free to use and/or modify
  */

	define('_JEXEC', 1);
	
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT"); // Date du passé

	if(!defined('DS'))
		define('DS', DIRECTORY_SEPARATOR);

	if(!defined('BASE_PATH'))
		define('BASE_PATH', dirname(__FILE__));

	if(!defined('TEMP_PATH'))
		define('TEMP_PATH', BASE_PATH.DS.'tmp');

	require dirname(__FILE__).DS.'uploadhelper.php';

	ob_start();

	if(uploadhelper::getVar('dl') == 1) require BASE_PATH.DS.'download.php';
	
	else {
		
		$headers = apache_request_headers();
		
		require !empty($headers['Sender']) ? BASE_PATH.DS.'upload.html5.php' :  BASE_PATH.DS.'upload.html.php';		
	}

	ob_flush();
	
//garbage colletor, remove old files

 error_reporting(0);
  
   $t = time();
   
   //file are not supposed to stay here for a long period, they should be moved after being uploaded
   $max_age = 3600 * 24;
   
   if($handle = opendir(TEMP_PATH)) {
    while (false !== ($file = readdir($handle))) {
	 if($file == '.' || $file == '..'|| $file == 'index.php')
	  continue;
     
	 if($t - filemtime(TEMP_PATH.DS.$file) > $max_age)
	  unlink(TEMP_PATH.DS.$file);
    }
    closedir($handle);
   }
   
   exit();
?>
?>
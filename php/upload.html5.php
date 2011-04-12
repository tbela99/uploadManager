<?php
 /**
  * @package mycms
  * @copyright bela, http://tbela.net/
  *
  * cms upload handler, cross-browser ajax file upload
  * feel free to use and/or modify
  */

	defined('_JEXEC') or die('Acces denied');
			
	$url = $_SERVER['REQUEST_URI'];
	
	if(($pos = strpos($url, '?')) !== false)
		$url = substr($url, 0, $pos);		
	
	$url .= '?';
	
	if($_SERVER['REQUEST_METHOD'] == 'POST') {

		header('Content-Type: application/x-json');
		
		//the actual maximum file size is post_max_size and not upload_max_size, fix this ?
		if(empty($headers['Size'])) {
		
			echo json_encode(array('success' => false, 'message' => 'File size is required'));
			exit();
		}
				
		//request file transfert infos
		if(!empty($headers['Prefetch'])) {
		
			$filename = '';
			$success = true;
			
			if(empty($headers['Guid'])) {
				
				$guid = uploadHelper::uuid();
				
				//really needed ?
				while(is_file(TEMP_PATH.DS.$guid))
					$guid = uploadHelper::uuid();
					
				//store file path & size
				$filename = uploadHelper::create_filename(basename($headers['Filename']).'.tmp', TEMP_PATH);
				
				//force empty file creation
				fclose(fopen($filename, 'w'));
				file_put_contents(TEMP_PATH.DS.$guid, basename($filename)."\n".(int) $headers['Size']);
			}
			
			else {
			
				$guid = $headers['Guid'];
				$file = TEMP_PATH.DS.$guid;
				
				$infos = is_file($file) ? explode("\n", file_get_contents($file)) : array();
				
				//guid validation
				if(!preg_match('/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/', $guid) || !is_file($file) || empty($infos[0]) || !is_file(TEMP_PATH.DS.$infos[0])) {
				
					echo json_encode(array('success' => false, 'message' => 'Invalid guid'));
					exit();
				}
				
				$filename = TEMP_PATH.DS.$infos[0];
				//$filesize = $file[1];
			}
			
			echo json_encode(array('guid' => $guid, 'size' => filesize($filename), 'success' => $success, 'remove' => $url.'r='.($guid ? '&guid='.$guid : '')));
			exit();
		}
		
		$success = true;
		$filename = '';
		$guid = '';
		
		//resume upload
		if(!empty($headers['Guid'])) {
		
			$guid = $headers['Guid'];
			$file = TEMP_PATH.DS.$guid;
			
			$infos = is_file($file) ? explode("\n", file_get_contents($file)) : array();
			
			
			//guid validation
			if(!preg_match('/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/', $guid)) {
			
				echo json_encode(array('success' => false, 'Invalid guid'));
				exit();
			}
			
			if(!is_file($file) || empty($infos[0]) || !is_file(TEMP_PATH.DS.$infos[0])) {
			
				echo json_encode(array('success' => false, 'File not found'));
				exit();
			}
			
			$filename = TEMP_PATH.DS.$infos[0];
			
			ignore_user_abort(true);
			$handle = fopen($filename, 'ab');
			fwrite($handle, file_get_contents('php://input'));
			fclose($handle);
				
			//ugh! :)
			clearstatcache(/* true, $filename */);
			
			if(connection_aborted())
				exit();
		}
		
		else {
			
			$filename = uploadHelper::create_filename(basename($headers['Filename']).'.tmp', TEMP_PATH);			
			file_put_contents($filename, file_get_contents('php://input'));
		}
		
		$path = uploadHelper::encrypt($filename);
		
		$size = filesize($filename);
		
		echo json_encode(array('file' => basename($headers['Filename']), 'path' => $path, 'success' =>  !empty($headers['Partial']) || $size == $headers['Size'], 'size' => $size, 'remove' => $url.'r='.urlencode($path).($guid ? '&guid='.$guid : '')));
	
		if($size == 0 || (empty($headers['Partial']) && $size != $headers['Size']))
			unlink($filename);
		
		//remove file
	} else if(array_key_exists('guid', $_GET)) {

		if($guid = uploadHelper::getVar('guid')) {
		
			if(preg_match('/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/', $guid) && is_file(TEMP_PATH.DS.$guid)) {
			
				$infos = explode("\n", file_get_contents(TEMP_PATH.DS.$guid));
				
				if(is_file(TEMP_PATH.DS.$infos[0]))
					unlink(TEMP_PATH.DS.$infos[0]);
					
				unlink(TEMP_PATH.DS.$guid);
			}
		}
	}
	
	else
	
		if($file = uploadHelper::getVar('r')) {
				
			if(is_file($file = uploadHelper::decrypt($file))) {
			
				$file = realpath($file);
				if(is_file(TEMP_PATH.DS.basename($file)))
					unlink($file);
			}
		}
	
?>
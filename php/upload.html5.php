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

		header('Content-Type: application/x-json;charset=utf-8');
		
		//the actual maximum file size is post_max_size and not upload_max_size, fix this ?
		if(empty($headers['Size'])) {
		
			echo json_encode(array('success' => false, 'message' => 'File size is required'));
			exit();
		}
				
		//request file transfert infos
		if(!empty($headers['Prefetch'])) {
		
			$filename = '';
			$success = true;
			
			//create transfert log
			if(empty($headers['Guid'])) {
				
				$guid = uploadHelper::uuid();
				
				//really needed ?
				while(is_file(TEMP_PATH.DS.$guid))
					$guid = uploadHelper::uuid();
					
				//store file path & size
				$filename = uploadHelper::create_filename(basename($headers['Filename']).'.tmp', TEMP_PATH);
				//$chunk = $filename.$headers['Current'];
				
				//force empty file creation
				fclose(fopen($filename, 'w'));
				//fclose(fopen($chunk, 'w'));
				file_put_contents(TEMP_PATH.DS.$guid, basename($filename)."\n".$headers['Parts']);
				
				echo json_encode(array('guid' => $guid, 'success' => $success, 'remove' => $url.'r='.($guid ? '&guid='.$guid : '')));
				exit();
			}
			
			else {
				
				if(empty($headers['Chunk-Size']) || 
					!isset($headers['Current']) || 
					!isset($headers['Offset']) || 
					!is_numeric($headers['Chunk-Size']) || 
					!is_numeric($headers['Current']) || 
					!is_numeric($headers['Offset'])) {
				
					echo json_encode(array('success' => false, 'message' => 'Invalid headers sent'));
					exit();
				}
				
				$guid = $headers['Guid'];
				$filename = TEMP_PATH.DS.$guid;
				
				$infos = is_file($filename) ? explode("\n", file_get_contents($filename)) : array();
				
				//guid validation
				if(!preg_match('/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/', $guid) || !is_file($filename) || empty($infos[0]) || !is_file(TEMP_PATH.DS.$infos[0])) {
				
					echo json_encode(array('success' => false, 'message' => 'Invalid guid'));
					exit();
				}
				
				$chunk = TEMP_PATH.DS.$infos[0].$headers['Current'];
				
				if(!is_file($chunk))
					fclose(fopen($chunk, 'w'));
			
				echo json_encode(array('guid' => $guid, 'size' => filesize($chunk), 'success' => $success, 'remove' => $url.'r='.($guid ? '&guid='.$guid : '')));
				exit();
			}
		}
		
		$success = true;
		$filename = '';
		$path = '';
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
			
			//here we store the partial upload
			//read the segment info
			$path = uploadHelper::encrypt(TEMP_PATH.DS.$infos[0]);
			$filename = TEMP_PATH.DS.$infos[0].$headers['Current'];
			
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
			$path = uploadHelper::encrypt($filename);
		}
		
		$filesize = isset($headers['Chunk-Size']) ? $headers['Chunk-Size'] : $headers['Size'];
		$size = filesize($filename);
		
		if($size == 0 || (empty($headers['Partial']) && $size != $filesize))
			unlink($filename);
		else
			if(isset($headers['Guid']) && $filesize == $size) {
			
				//merge
				$handle = fopen(TEMP_PATH.DS.$infos[0], 'r+b');
				fseek($handle, $headers['Offset']);
				fwrite($handle, file_get_contents($filename));
				fclose($handle);
			}
			
		echo json_encode(array(
		
								'file' => basename($headers['Filename']),
								'path' => $path, 
								'success' =>  !empty($headers['Partial']) || $size == $filesize, 
								'size' => $size, 'remove' => $url.'r='.urlencode($path).($guid ? '&guid='.$guid : '')
							)
						);
	
	} 
	
	else 
		//remove file
		if(array_key_exists('guid', $_GET)) {

			if($guid = uploadHelper::getVar('guid')) {
			
				if(preg_match('/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/', $guid) && is_file(TEMP_PATH.DS.$guid)) {
				
					//remove chunks
					$infos = explode("\n", file_get_contents(TEMP_PATH.DS.$guid));
					
					if(is_file(TEMP_PATH.DS.$infos[0]))
						unlink(TEMP_PATH.DS.$infos[0]);
						
					for($i = 0; $i < $infos[1]; $i++)
						if(is_file(TEMP_PATH.DS.$infos[0].$i))
							unlink(TEMP_PATH.DS.$infos[0].$i);
						
					unlink(TEMP_PATH.DS.$guid);
				}
			}
		}
	
	else
		//remove file
		if($file = uploadHelper::getVar('r')) {
				
			if(is_file($file = uploadHelper::decrypt($file))) {
			
				$file = realpath($file);
				if(is_file(TEMP_PATH.DS.basename($file)))
					unlink($file);
			}
		}
	
?>
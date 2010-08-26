<?php
 /**
  * @package mycms
  * @copyright bela, http://tbela.net/
  *
  * cms upload handler, cross-browser ajax file upload
  * feel free to use and/or modify
  */

	defined('_JEXEC') or die('Acces denied');
	
		//defined('_JEXEC') or die('Direct access not allowed');

	// require_once(dirname(__FILE__).DS.'string.php');
	// require_once(dirname(__FILE__).DS.'filesystem.php');

	$url = $_SERVER['REQUEST_URI'];
	$self = basename($_SERVER['PHP_SELF']);

	parse_str($_SERVER['QUERY_STRING'], $match);

	$f_ = uploadHelper::safe_name(array_pop(array_keys($match)));
	$f = "'".$f_."'";
 
 ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Document sans titre</title>
<style type="text/css">
body { padding: 0; margin: 0 0 0 2px; margin: 0; background: transparent }
form { vertical-align:top; margin: 0 0 0 2px ; padding: 0 }
input { margin: 0; padding: 0; border: 1px }
</style>
<script type="text/javascript"><?php
/**
 * @version 2.0 {beta}
 * @author thierry bela <bntfr at yahoo dot fr>
 */

?> 

parentDocument = window.parent.document;

function display(element, display) {

	if(element.style) element.style.display=display; 
	else element.display=display;
}


</script>
</head>
<body>
 <?php
 
 if($_SERVER['REQUEST_METHOD'] == 'POST') {
 	
	uploadHelper::checkToken() or die( 'Invalid Token' );
	
	header('content-type: text/html');
	
	//if custom header => html5 file upload
  
	$u = &new uploadHelper(TEMP_PATH, 'image');
	
	if(!($file = $u->upload_file())) {

   //upload failed, too large file ?
   ?><script type="text/javascript">
	var id = <?php echo $f; ?>,
		transfer = parent.window.uploadManager.get(id);
	
	div = parentDocument.getElementById(id + '_label');
    div.innerHTML = ' <span class="upload-error">upload failed (file too large ? Max size = <?php 
	
		echo ini_get('upload_max_filesize'); 
	?>)</span>...<a href="<?php echo $self; ?>" onclick="var id = <?php 
	
		echo addslashes($f); 
	?>; uploadManager.get(id).addEvent(\'onCancel\', function () {<?php
	
	?> $(id + \'_label\').innerHTML = \'\';<?php
	?><?php
	
	?>$(id + \'_iframe\').style.display=\'block\'}).cancel(); return false;">Annuler</a>';
	
	transfer.fireEvent('failure', transfer).fireEvent('complete', transfer)
	</script>
   <?php
		} else {
  
			if(($pos = strpos($url, '?')) !== false)
				$url = substr($url, 0, $pos);		
  
		$filesize = filesize($file[0]['path']);
		
	?><script type="text/javascript">
	
	var file = '<?php echo addslashes($file[0]['name']) ?>',
		path = '<?php echo addslashes(uploadHelper::encrypt($file[0]['path'])); ?>',
		id = <?php echo $f; ?>,
		uploadManager = parent.window.uploadManager,
		transfer = uploadManager.get(id),
		arg = {file: file, path: path, size: <?php echo $filesize; ?>};
		
	parentDocument.getElementById(id + '_lfile').value = file;
	parentDocument.getElementById(id).value = path; 
	parentDocument.getElementById(id + '_label').innerHTML = '<label for="<?php echo $f_; ?>" title="<?php echo htmlentities($file[0]['name'], null, 'utf-8'); ?>"><?php 
	
		echo addslashes(uploadHelper::truncate($file[0]['name'], 32, '...'.uploadHelper::file_ext2($file[0]['name']), false)); 
	?> (' + uploadManager.format(<?php 
	
		echo $filesize; 
	?>) + ')</label><a href="<?php 
	
		echo uploadHelper::route($self); 
	?>" onclick="var id = <?php 
	
		echo addslashes($f); 
	?>, transfer = uploadManager.get(id), iframe = $(id + \'_iframe\'); iframe.set({events: {\'load\': function () { setTimeout(function () { transfer.cancel() }, 10) }}, src: \'<?php 
	
		echo uploadHelper::route($self.(strpos($self, '?') === false ? '?' : '&').$f_.'&r='.urlencode(addslashes(uploadHelper::encrypt($file[0]['path'])))); 
	?>\'}); return false">Remove</a>';
 
	transfer.fireEvent('success', [arg, transfer]).fireEvent('complete', transfer)
	</script>
   <?php    
   
			exit();
		}
		
	} else {

		//click on remove, remove the file
		if($r = uploadHelper::get_param($_GET, 'r')) {

			$r = basename(uploadHelper::decrypt($r));

			if(is_file(TEMP_PATH.DS.basename($r)) && !in_array(basename($r), array($self, 'index.php')) && basename($r) != 'index.html')
				unlink(TEMP_PATH.DS.basename($r));
	  }
	  
  ?><script type="text/javascript">
  
  function upload(file){

	var uploadManager = parent.window.uploadManager,
		id = <?php  
		
			echo $f; 
		?>,
		transfer = uploadManager.get(id),
		container = transfer.options.container;
	
	
		uploadManager.enqueue(container, function () {
		
			var transfer = parent.window.uploadManager.get(id).load(file);
			
			if(transfer.aborted) document.getElementById('file').value = '';
			else {
				
				// hide old iframe
				iframe = parentDocument.getElementById(id + '_iframe');
				display(iframe, 'none');
				
				div = parentDocument.getElementById(id + '_label');
				
				div.innerHTML = ' uploading, please wait...<a href="<?php 
				
					echo uploadHelper::route('index.php'); 
				?>" onclick="var id = <?php 
				
					echo addslashes($f); 
				?>; uploadManager.get(<?php 
				
					echo addslashes($f); 
				?>).addEvent(\'onCancel\', function () {<?php
				
					?> $(id + \'_lfile\').value = \'\'; $(id).value = \'\'; $(id + \'_label\').innerHTML = \'\';  $(<?php 
					
						echo addslashes($f); 
					?> + \'_iframe\').src=$(id + \'_iframe\').src.replace(/&.*$/, \'\');<?php

					?>$(id + \'_iframe\').setStyle(\'display\', \'block\');<?php
					
				?>}).cancel(); <?php
					
					?>return false">Cancel</a>';
					
				document.getElementById('iform').submit()
			}
		})
 }
 
</script>
<form name="iform" id="iform" action="" method="post" enctype="multipart/form-data">
<input id="file" type="file" name="image" size="20" class="inputbox" onchange="upload(this.value);" /><?php 

	echo uploadHelper::token(); 
?>
</form><?php

	}
?>
</body>
</html>
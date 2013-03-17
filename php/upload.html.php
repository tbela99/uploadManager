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

	$keys = array_keys($match);
	$f_ = uploadHelper::safe_name(array_pop($keys));
	$f = "'".$f_."'";
 
 ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Document sans titre</title>
<style type="text/css">
body { padding: 0; margin: 0 0 0 2px; margin: 0; background: transparent }
form { vertical-align:top; margin: 0 0 0 2px ; padding: 0 }
input { margin: 0; padding: 0; border: 1px }
</style>
<script type="text/javascript">

var win = parent.window,
	doc = win.document,
	Locale = win.Locale;

	String.prototype.shorten =  function (max, end) {
	
			max = max || 20;
			end = end || 12;
			
			if(this.length > max) return this.substring(0, max - end - 3) + '... ' + this.substring(this.length - end + 1);
			return this
		};
		
	Number.prototype.toFileSize = function(units) {
		
			if(this == 0) return 0;
			
			var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'],
				e = Math.floor(Math.log(this) / Math.log(1024));

			return (this / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + (units && units[e] ? units[e] : s[e]);
		}
</script>
</head>
<body>
 <?php
 
 if($_SERVER['REQUEST_METHOD'] == 'POST') {
 	
	uploadHelper::checkToken() or die( 'Invalid Token' );
	
	header('content-type: text/html;charset=utf-8');
	
	//if custom header => html5 file upload
  
	$u = new uploadHelper(TEMP_PATH, 'image');
	
	if(!($file = $u->upload_file())) {

   //upload failed, too large file ?
   ?><script type="text/javascript">
	var id = <?php echo $f; ?>,
		transfer = win.uploadManager.get(id);
	
	div = win.$(id + '_label').set('html', ' <span class="upload-error">upload failed (file too large ? Max size = <?php 
	
		echo ini_get('upload_max_filesize'); 
	?>)</span>...<a href="<?php echo $self; ?>" onclick="var id = <?php 
	
		echo addslashes($f); 
	?>; uploadManager.get(id).addEvent(\'onCancel\', function () {<?php
	
	?> $(id + \'_label\').innerHTML = \'\';<?php
	
	?>$(id + \'_iframe\').style.display=\'block\'}).cancel(); return false;" class="cancel-upload">' + Locale.get('uploadManager.CANCEL') + '</a>');
	
	transfer.fireEvent('failure', transfer).fireEvent('complete', transfer)
	</script>
   <?php
		} else {
  
			if(($pos = strpos($url, '?')) !== false)
				$url = substr($url, 0, $pos);		
  
		$filesize = filesize($file[0]['path']);
		
	?><script type="text/javascript">
	
	var file = '<?php echo uploadHelper::clean(addslashes($file[0]['name'])) ?>',
		path = '<?php echo addslashes(uploadHelper::encrypt($file[0]['path'])); ?>',
		id = <?php echo $f; ?>,
		uploadManager = win.uploadManager,
		transfer = uploadManager.get(id),
		arg = {file: file, path: path, size: <?php echo $filesize; ?>, transfer: transfer},
		maxsize = <?php echo UPLOAD_MAX_SIZE; ?>,
		options = transfer.options;
		
							//file size limit check
	if(maxsize > 0 && arg.size > maxsize) transfer.cancel(Locale.get('uploadManager.TOTAL_FILES_SIZE_EXCEEDED', maxsize.toFileSize()));
	else if(arg.size == 0) transfer.cancel(Locale[get]('uploadManager.EMPTY_FILE'));
	else if(options.filesize > 0 && arg.size > options.filesize) transfer.cancel(Locale.get('uploadManager.MAX_FILE_SIZE_EXCEEDED', options.filesize.toFileSize()) + ')');
	else if(options.maxsize > 0 && uploadManager.getSize(options.container) + arg.size > options.maxsize) transfer.cancel('file too big (total files size must not exceed ' + options.maxsize.toFileSize() + ')');			
	else {
		
		win.$(id + '_lfile').value = file;
		win.$(id).value = path; 
		win.$(id + '_label').set('html', '<label for="<?php echo $f_; ?>" title="<?php echo addslashes(htmlentities($file[0]['name'], null, 'utf-8')); ?>"></label><a href="<?php 
		
			echo uploadHelper::route($self); 
		?>" onclick="var id = <?php 
		
			echo addslashes($f); 
		?>, transfer = uploadManager.get(id), iframe = $(id + \'_iframe\'); iframe.set({events: {\'load\': function () { setTimeout(function () { transfer.cancel() }, 10) }}, src: \'<?php 
		
			echo uploadHelper::route($self.(strpos($self, '?') === false ? '?' : '&').$f_.'&r='.urlencode(addslashes(uploadHelper::encrypt($file[0]['path'])))); 
		?>\'}); return false" class="cancel-upload">' + Locale.get('uploadManager.CANCEL') + '</a>').getElement('label').set('text', '<?php 
		
		echo addslashes($file[0]['name']);
	?>'.shorten() + ' (' + (<?php 
		
			echo $filesize; 
		?>).toFileSize() + ')');
	 
		transfer.fireEvent('success', arg).fireEvent('complete', transfer)
	}
	</script>
   <?php    
   
			exit();
		}
		
	} else {

		//click on remove, remove the file
		if($r = uploadHelper::get_param($_GET, 'r')) {

			$r = basename(uploadHelper::decrypt($r));

			if(is_file(TEMP_PATH.DS.basename($r)) && !in_array(basename($r), array($self, 'index.php')) && basename($r) != 'index.html') {
				
				chmod(TEMP_PATH.DS.basename($r), 0777);
				unlink(TEMP_PATH.DS.basename($r));
			}
		}
	  
  ?><script type="text/javascript">
  
		function upload(file) {

			var uploadManager = win.uploadManager,
				id = <?php  
				
					echo $f; 
				?>,
				transfer = uploadManager.get(id),
				container = transfer.options.container;
			
			uploadManager.push(container, function () {
			
				var transfer = win.uploadManager.get(id).load(file);
				
				if(transfer.aborted) document.getElementById('file').value = '';
				else {
					
					// hide old iframe
					iframe = win.$(id + '_iframe');
					iframe.style.display = 'none';
					
					div = win.$(id + '_label').set('html', Locale.get('uploadManager.UPLOADING') + ' <a href="<?php 
					
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
						
						?>return false" class="cancel-upload">' + Locale.get('uploadManager.CANCEL') + '</a>');
						
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
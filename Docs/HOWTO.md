uploadManager
============

mootools ajax file upload with:

- file drag drop on upload container (currently supported by chrome5+ and firefox 3.6+)
- no iframe and progress bar for browsers that support HTML5 File API (chrome5+, safari4+, Firefox 3.6+)
- iframe for the others

[Demo](http://tbela.fragged.org/demos/upload/Demo/)
![Screenshot](http://github.com/tbela99/progressbar/raw/master/screenshot.png)


How does it work
---------------------

the Ajax file upload place uploaded files in a temporary folder of the server.

# Setup server side upload

you must indicate the temp upload folder by editing the constant *TEMP_PATH* in *upload.php*. you will need to create the folder and allow the script to create file in it.
you must also change the methods *uploadHelper::encrypt()* and *uploadHelper::decrypt()* in the file uploadhelper.php to provide a better encryption method.

# the client side upload

### CSS:

	#upload {

		border: 1px solid #ccc;
		max-width: 300px;
		min-height: 100px;
	}

### HTML:

	<form action="" method="get"><a href="#">Upload a file</a> [upload size: <span id="infos">0</span>]
	<div id="upload"></div></form>
	
### Javascript:

	var options = {
			
			//id of the upload container
			container: 'upload',
			
			//where to send the upload request
			base: '../php/upload.php',
			
			//filter file types
			//filetype: 'html,rar,zip',
			
			//form field name
			name: 'names[]',
			
			//enable multiple file selection
			multiple: true
		};
	
	//enable file drag drop on $('upload')
	uploadManager.attachDragEvents('upload', options);
	
	//click to add a new file upload
	document.getElement('a').addEvent('click', function(e) {
	
		e.stop();
		
		uploadManager.upload(options)
	})
	
when the upload succeed, two fields are pushed into the form:
-  one field <input name="names[]" type="checkbox"> which contains the file name.
-  one field <input name="file_names[]" type="checkbox"> which contains the encrypted file path on the server.

# Handling the form submission

in your php form submission handler, getting the file name is a trivial task.

	<?php
	
	
		include('uploadhelper.php');
		
		$names = uploadHelper::getVar('names');
		$files = uploadHelper::getVar('file_names');
		
		foreeach($files as $k => $file) {
		
			//get the file path
			echo uploadHelper::decrypt($file);
			
			//file name
			echo $names[$k];
		}
	?>



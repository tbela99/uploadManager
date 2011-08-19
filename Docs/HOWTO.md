uploadManager
============

mootools 1.3 ajax file upload with:

[Demo](http://tbela.fragged.org/demos/upload/Demo/)
![Screenshot](http://github.com/tbela99/uploadManager/raw/master/screenshot.png)

How to use
----------

uploadManager uploads files in a temporary folder of your webserser and pull back the uploaded file name and its path in the form, so you can send them along with the rest of the form.
you will need a webserver with php installed to run the demo. 
for a detailed usage see [HOWTO.md](https://github.com/tbela99/uploadManager/blob/master/Docs/HOWTO.md) in the Docs folder.

# uploadManager

creates and manage uploads with the following features:

- resume upload on error/pause (Google Chrome, Firefox 3.6+)
- file drag drop (currently supported by chrome 5+, firefox 3.6+ and safari 5.1+)
- progress bar for browsers supporting HTML5 File API (chrome5+, safari4+, Firefox 3.6+)
- no input file for Firefox 4
- iframe for the others
- customizable by css (fully customizable in firefox 4 and later)
- easy to use

How does it work
---------------------

uploadManager uploads files in a temporary folder of your webserser and pull back the uploaded file name and its path in the form, so you can send them along with the rest of the form.
you will need a webserver with php installed to run the demo.

# Setup server side upload

you must indicate the temp upload folder by editing the constant *TEMP_PATH* in *upload.php*. you will need to create the folder and allow the script to create file in it.
you should also change the methods *uploadHelper::encrypt()* and *uploadHelper::decrypt()* in the file uploadhelper.php to provide a better encryption method.

# the client side upload

### CSS:

	#upload {

		border: 1px solid #ccc;
		max-width: 300px;
		min-height: 100px;
	}

	/*

		cancel upload button
	*/
	.cancel-upload {

		background:#ccc;
		border: 1px solid #999999;
		color: #000000;
		display: inline-block;
		margin: 5px 5px 0 3px;
		padding: 2px 5px;
	}
	.cancel-upload:hover {

		background: #aaa;
		color: #fff;
	}
	
	/*

		browse button style: currently supported only by Firexox 4+
	*/

	.browse-upload {

		background:#ccc;
		border: 1px solid #999999;
		color: #000000;
		display: inline-block;
		margin: 5px 5px 0 0;
		padding: 2px 5px;
	}
	.browse-upload:hover {

		background: #aaa;
		color: #fff;
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
			
			multiple: true, //enable multiple selection in file dialog
			progressbar: {

				width: 140, //fix the progressbar width, optional
				color: '#000', 
				fillColor: '#fff',
				text: 'Pending...',
				onChange: function (value, progressbar) {
				
					//console.log(arguments)
					progressbar.setText('completed: ' + (100 * value).format() + '%')
				}
			}
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

in your php form submission handler, getting the file name is a trivial task. you should move files from the temp directory to the final location

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



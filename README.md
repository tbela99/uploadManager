uploadManager
============

Mootools html5/ajax multipart file upload

[Demo](http://tbela.fragged.org/demos/upload/Demo/)
![Screenshot](http://github.com/tbela99/uploadManager/raw/master/screenshot.png)

How to use
----------

uploadManager uploads files in a temporary folder of your webserser and pull back the uploaded file name and its path in the form, so you can send them along with the rest of the form.
you will need a webserver with php installed to run the demo. 
for a detailed usage see [HOWTO.md](https://github.com/tbela99/uploadManager/blob/master/Docs/HOWTO.md) in the Docs folder.

# uploadManager

creates and manage uploads with the following features:

- faster upload: each file has multiple chunks uploaded in parallel (Google Chrome, Firefox 3.6+, IE10 Platform preview 2)
- resume upload on error/pause (Google Chrome, Firefox 4.0+, IE10 Platform preview 2)
- file drag drop (currently supported by chrome 5+, firefox 3.6+ and safari 5.1+, IE10 Platform preview 2)
- optional progressbar for browsers supporting HTML5 File API (chrome5+, safari4+, Firefox 3.6+, IE10 Platform preview 2, Opera 12 (Next))
- no input file for Firefox 4+
- iframe for the others browsers
- customizable by css (fully customizable in firefox 4 and later)
- easy to use

### uploadManager Property: resume

(*boolean*) indicates if the browser can resume upload after error or pause.

### uploadManager Property: xmlhttpupload

(*boolean*) indicates if the browser handle file upload via XMLHTTPRequest.

### uploadManager Property: enqueue

(*boolean*) queue upload. by default upload are not queued.

### uploadManager Property: concurrent

(*int*) limit the number of active uploads if enqueue is *true*. default to 1

### uploadManager Property: multiple

(*boolean*) indicates if the browser can handle multiple files selection.

### uploadManager Method: upload {#uploadManager:upload}
------------

create a new upload field.

### Returns:

* (*object*) - file upload instance. if the the maximum number of files that can be uploaded is reached null is returned instead.

#### Arguments:

1. options - (*object*) see file upload instance options.

##### Options:

- container - (*string*) upload container id.
- pause - (*boolean*) allow user to pause/resume upload (if the browser can resume broken upload) otherwise the resume button will only appear when an error occur. default to false.
- chunks - (*int*) number of chunks uploaded simultaneously for a file. default to 3.
- chunckSize - (*int*) chunk file size. default to 1Mb. if the browser can resume broken file upload, file will be split in pieces of a maximum length of chunckSize.
- base - (*string*, optional) url of the page that will handle server side file upload. default to *upload.php*.
- limit - (*int*, optional) maximum number of files the user can upload. 0 means no restriction. default to 0.
- filesize - (*int*, optional) maximum size of a file the user can upload. 0 means no restriction. default to 0.
- maxsize - (*int*, optional) maximum size of files uploaded by a user. 0 means no restriction. default to 0.
- iframe - (*boolean*, optional) force iframe upload.
- multiple - (*boolean*, optional) enable multiple file selection for the input if the browser can handle it.
- filetype - (*string*, optional) authorized file type.
- name - (*string*) name of the upload form field. it contains the original name of the file sent by the user. if the upload succeed a hidden field named *'file_' + name* and containing the encrypted file path on the server will be pushed into the form.
for example if our form field is named *name[]*, then *name[]* will contains the original file name and *file_name[]* will contains the encrypted file path on the server.
- progressbar - (*mixed*, optional) indicates whether to display a progressbar or not. if *false* then the progressbar is disabled. if *true* the progressbar will use default options. if it is an *object*, it will be passed as progressbar options. see [Progressbar](http://github.com/tbela99/progressbar/)
- hideDialog - (*boolean*, optional) Firefox 4+ only: if true the file selection dialog will not be shown after the upload instance is created.

##### Progressbar:

- container - (*mixed*) progressbar container.
- width - (*int*, optional) progressbar width.
- value - (*number*, optional) initial value of the progressbar. value is always between 0 and 1 (100%). default to 0. 
- text - (*string*, optional) progressbar text.
- color - (*string*, optional) progressbar color.
- fillColor - (*string*, optional) progressbar fill color.
- backgroundImage - (*string*, optional) background image used to fill the progressbar. this parameter will shadow the fillColor parameter.

##### Progressbar events:

##### onChange

##### Arguments:

- value - (*number*) progressbar value. it is a number between 0 and 1
- progressbar - (*object*) progressbar.

##### onComplete

##### Arguments:

- progressbar - (*object*) progressbar.


##### Upload events:

##### onCreate

Fired after the upload instance has been created.

##### Arguments:

- transfer - (*object*) file upload instance

##### onLoad

Fired before the file is uploaded.

##### Arguments:

- options - (*object*)

##### Options:

- element - (*element*) the file upload instance container.
- file - (*string*) the file name.
- size - (*int*) file size. if the browser supports XMLHTTPRequest file upload, this will be the actual file size, otherwise it will be 0.
- transfer - (*object*) file upload instance.

##### onProgress

Fired while the file is uploaded.

##### Arguments:

- value - (*number*) - the progress value is between 0 and 1

##### onAbort

Fired when the transfer is aborted (it has not started).

##### Arguments:

- options - (*object*)

##### Options:

- file - (*string*) file name
- message - (*string*) error message
- transfer - (*object*) file upload instance.

##### onCancel

##### Options:

- message - (*string*, optional) error message

Fired when the transfer is cancelled.

##### Arguments:

- transfer - (*object*) file upload instance.


##### onFailure

Fired when the transfer fails.

##### Arguments:

- transfer - (*object*) file upload instance.

##### onSuccess

Fired when the transfer succeed.

##### Arguments:

1. infos - (*object*) uploaded file infos

##### Infos:

- file - (*string*) the original file name.
- path - (*string*) the encrypted file path on the server.
- size - (*int*) uploaded file size.
- transfer - (*object*) file upload instance

##### onPause

Fired when the transfer is paused.

##### Arguments:

- transfer - (*object*) file upload instance

##### onResume

Fired when the transfer is resumed.

##### Arguments:

- transfer - (*object*) file upload instance

##### onComplete

Fired when the transfer is complete.

##### Arguments:

- transfer - (*object*) file upload instance

##### onAllComplete

Fired when all transfer are completed.

##### Arguments:

- container - (*string*) container id

### uploadManager Method: attachDragEvents
------------

enable files to be uploaded when they are dropped on an element. this happens only if the browser supports file drag drop.

### Returns:

* (*object*) - uploadManager.

#### Arguments:

1. el - (*mixed*) element
1. options - (*object*) see [uploadManager#upload](#uploadManager:upload) .

### uploadManager Method: detachDragEvents
------------

remove upload events from an element.

### Returns:

* (*object*) - uploadManager.

#### Arguments:

1. el - (*mixed*) element

### uploadManager Method: get
------------

return the [file upload instance](#uploadManager:instance) with the given id.

### Returns:

* (*object*) - file upload instance.

#### Arguments:

1. id - (*string*) file upload instance id.

### uploadManager Method: getSize
------------

return uploaded file size for a given container.

### Returns:

* (*mixed*)

#### Arguments:

1. container - (*string*) container id

return all the file upload instance of a given container.


### uploadManager Method: getTransfers
------------

return the transfer instances for a given container.

### Returns:

* (*array*)

#### Arguments:

1. container - (*string*) container id


## File upload instance {#uploadManager:instance}
----------------------

object wrapping a file upload instance.

### Implements

Options, Events. see [uploadManager#upload](#uploadManager:upload) for implemented options and events.

### File upload instance Properties:
------------
- completed - (*boolean*) true if the file has been succesfully uploaded
- filesize - (*int*) the uploaded file size in byte.
- state - (*int*) state of the transfer of this instance. value are: 0 (not started), 1 (loading), 2 (aborted), 3 (cancelled), 4 (completed)

# Example
	
	//CSS
	
	#dropfiles {
	
		border: #000;
		width: 100%;
		height: 250px;
	}

	//HTML
			<script src="mootools.js"></script>
			<script type="text/javascript" src="number.js"></script>
			<script type="text/javascript" src="progressbar.js"></script>
			<script type="text/javascript" src="upload.js"></script>
			
			
			<a href="#">Select a picture</a>
			<div id="dropfiles"></div>
	
	//Javacript

	window.addEvent('domready', function () {
		
		//upload options
		var options = {
						//upload container
						container: 'dropfiles',
						
						//only one file can be uploaded
						limit: 1,
						
						//upload field name
						name: 'picture',
						
						//filter by file type
						filetype: 'jpg,gif,png',
						
						//where to send uploaded file
						base: '/files/upload'
					}
					
		//enable drap & drop
		uploadManager.attachDragEvents('dropfiles', options);
		
		//add a new upload on click on the link right before #dropfiles
		document.getElement("#dropfiles!+a").addEvent("click", function (e) {
		
			e.stop();
			uploadManager.upload(options)
		})
	})


Example
--------

a simple form to upload a text file.

### HTML:

	<form action="" method="get">
		<a href="#">Upload a picture of you:</a>
		<div id="upload"></div>
		<input type="submit" value="submit"/>
	</form>
	  
### Javascript:

	var options = {
	
		//upload only one file
		limit: 1,
		//upload in this element
		container: 'upload',
		//allowed file type
		filetype: 'jpg,gif,png',
		//transfer aborted
		onAbort: function () {
		
			alert('Unauthorized file type, allowed file type are "' + this.options.filetype + '"')
		},
		onSuccess: function () { alert('Transfer completed succesfully!') }
	};

	window.addEvent('domready', function () {
	
		//add click listener on the link
		document.id('upload').addEvent('click', function (e) {
		
			e.stop();
			
			//create upload field
			uploadManager.upload(options)
		}).
		//check submit form
		getParent('form').addEvent('submit', function (e) {
		
			e.stop();
			
			//transfer instances
			var transfers = uploadManager.getTransfers('upload');
			
			//user have not uploaded a file
			if(transfers.length == 0) {
			
				alert('Please select a file to upload');
				return
			}
			
			//check we have ungoing transfers
			if(transfers.some(function (instance) { return instance.state == 1 })) {
			
				alert('there are some pending queries, please wait until it completes, the try again');
				return
			}
			
			//check all transfers have completed
			if(!transfers.every(function (instance) { return instance.complete})) {
			
				alert('some tranfers may have failed. please try again');
				return
			}
			
			//all transfers have completed succesfully, submit the form
			
			//this.submit()			
		})
	})

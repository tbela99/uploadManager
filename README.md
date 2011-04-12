uploadManager
============

mootools 1.3 ajax file upload

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
- file drag drop (currently supported by chrome 5+ and firefox 3.6+)
- progress bar for browsers supporting HTML5 File API (chrome5+, safari4+, Firefox 3.6+)
- no input file for Firefox 4
- iframe for the others
- customizable by css (fully customizable in firefox 4 and later)
- easy to use


### uploadManager Property: resume

(*boolean*) indicates if the browser can resume upload after error or pause.

### uploadManager Property: xmlhttpupload

(*boolean*) indicates if the browser handle file upload via XMLHTTPRequest.

### uploadManager Property: enqueue

(*boolean*) queue upload. by default upload are not queued.

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
- progressbar - (*object*, optional) progressbar options. see [Progressbar](http://github.com/tbela99/progressbar/)

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

uploadManager
============

mootools ajax file upload with:

- file drag drop support (currently supported by chrome5+ and firefox 3.6+)
- no iframe and progress bar for browser that support HTML5 File API (chrome5+, safari4+, Firefox 3.6+)
- iframe for the other

[Demo](http://tbela.fragged.org/demos/upload/Demo/)


How to use
---------------------

see the Demo folder. you will need a webserver with php installed to run the demo.

# uploadManager

object providing methods to control field upload.

### uploadManager Property: filedrop

(*boolean*) indicates if the browser handle file dragdrop.

### uploadManager Property: xmlhttpupload

(*boolean*) indicates if the browser handle XMLHTTPRequest file upload.

### uploadManager Method: upload {#uploadManager:upload}
------------

create a new upload field.

### Returns:

* (*object*) - file upload instance.

#### Arguments:

1. options - (*object*) see file upload instance options.

##### Options:

see file upload instance options.


- container - (*string*) upload field container id.
- base - (*string*, optional) url of the page that will handle server side file upload. default to *upload.php*.
- limit - (*int*, optional) maximum number of file the user should upload. 0 means no limit. default to 0.
- multiple - (*boolean*, optional) enable multiple file selection for the input if the browser can handle it.
- filetype - (*string*, optional) authorized file type.
- name - (*string*) name of the upload form field. it contains the name of the file sent by the user. if the upload succeed a hidden field named *'file_' + name* and containing the encrypted file path on the server will be pushed into the form


##### Events:

##### onCreate

Fired after the uplaod instance has been created.

##### Arguments:

- id - (*object*) upload transfer instance id.

##### onLoad

Fired before the file is uploaded.

##### Arguments:

- options - (*object*)

##### Options:

- element - (*element*) the upload field instance container.
- file - (*string*) the file name.
- size - (*int*) file size. if the browser supports XMLHTTPRequest file upload, this will be the actual file size, otherwise it will be 0.

##### onAbort

Fired when the transfer is aborted (it has not started).

##### Arguments:

- file - (*string*) file name
- message - (*string*) error message

##### Options:

- element - (*element*) the upload field instance container.
- file - (*string*) the file name.
- size - (*int*) file size. if the browser supports XMLHTTPRequest file upload, this wil be the actual file size, otherwise it will be 0.

##### onCancel

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
2. transfer - (*object*) file upload instance which fired the event

##### Infos:

- file - (*string*) the original file name.
- path - (*string*) the encrypted file path on the server.
- size - (*int*) uploaded file size.

##### onComplete

Fired when the transfer is complete.

##### Arguments:

- transfer - (*object*) upload file instance

##### Options:

- element - (*element*) the upload field instance container.
- file - (*string*) the file name.
- size - (*int*) file size. if the browser supports XMLHTTPRequest file upload, this wil be the actual file size, otherwise it will be 0.


### uploadManager Method: attachEvents
------------

attach file dragdrop events to an element if the browser supports it.

### Returns:

* (*object*) - uploadManager.

#### Arguments:

1. el - (*mixed*) element
1. options - (*object*) see file .

### uploadManager Method: detachEvents
------------

remove file dragdrop events on an element.

### Returns:

* (*object*) - uploadManager.

#### Arguments:

1. el - (*mixed*) element

### uploadManager Method: get
------------

return the [file upload instance](#uploadManager:instance) options with a given id.

### Returns:

* (*object*) - .

#### Arguments:

1. el - (*mixed*) element

### uploadManager Method: format
------------

format file size for reading.

### Returns:

* (*string*)

#### Arguments:

1. size - (*int*) element

### uploadManager Method: getSize
------------

return uploaded file size for a given container.

### Returns:

* (*int*)

#### Arguments:

1. container - (*string*) container id


## File upload instance {#uploadManager:instance}

object wrapping a file upload instance.

### Implements

Options, Events. see [uploadManager#upload](#uploadManager:upload) for implemented options and events.



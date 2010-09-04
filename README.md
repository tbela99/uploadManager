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

### uploadManager Property: xmlhttpupload

(*boolean*) indicates if the browser handle XMLHTTPRequest file upload.

### uploadManager Method: upload {#uploadManager:upload}
------------

create a new upload field.

### Returns:

* (*object*) - file upload instance or null if the the maximum number of files that can be uploaded is reached.

#### Arguments:

1. options - (*object*) see file upload instance options.

##### Options:

see file upload instance options.


- container - (*string*) upload field container id.
- base - (*string*, optional) url of the page that will handle server side file upload. default to *upload.php*.
- limit - (*int*, optional) maximum number of file the user should upload. 0 means no limit. default to 0.
- multiple - (*boolean*, optional) enable multiple file selection for the input if the browser can handle it.
- filetype - (*string*, optional) authorized file type.
- name - (*string*) name of the upload form field. it contains the original name of the file sent by the user. if the upload succeed a hidden field named *'file_' + name* and containing the encrypted file path on the server will be pushed into the form.
for example if our form field is named *name[]*, then *name[]* will contains the original file name and *file_name[]* will contains the encrypted file path on the server.


##### Events:

##### onCreate

Fired after the upload instance has been created.

##### Arguments:

- id - (*object*) upload transfer instance id. you can retrieve this instance with uploadManager.get(id)

##### onLoad

Fired before the file is uploaded.

##### Arguments:

- options - (*object*)

##### Options:

- element - (*element*) the upload field instance container.
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

- transfer - (*object*) upload file instance

##### onAllComplete

Fired when all transfer are completed.

##### Arguments:

- container - (*string*) container id

### uploadManager Method: attachDragEvents
------------

enable files to be uploaded when they are dropped on an element. this happen if the browser supports file drag drop.

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

### uploadManager Method: format
------------

format file size for reading.

### Returns:

* (*midex*)

#### Arguments:

1. size - (*int*)

### uploadManager Method: getSize
------------

return uploaded file size for a given container.

### Returns:

* (*mixed*)

#### Arguments:

1. container - (*string*) container id
2. convert - (*boolean*) convert the result

return all the upload file instance of a given container.

### Returns:

* (*array*)

#### Arguments:

1. container - (*string*) container id


## File upload instance {#uploadManager:instance}
----------------------

object wrapping a file upload instance.

### Implements

Options, Events. see [uploadManager#upload](#uploadManager:upload) for implemented options and events.

### uploadManager Properties:
------------
- completed - (*boolean*) true if the file has been succesfully uploaded
- filesize - (*int*) the uploaded file size in byte.



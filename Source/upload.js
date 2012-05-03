/*
---
script: upload.js
license: MIT-style license.
description: Javascript crossbrowser file upload, with some html5 sugar.
copyright: Copyright (c) 2006 - 2012 Thierry Bela
authors: [Thierry Bela]

requires: 
  core:1.3: 
  - Element.Event
  - Element.Style
  - Fx.Tween
  - Fx.Elements
  - Array
  
  more:1.3:
  - Locale
provides: [uploadManager]
...
*/

String.implement({shorten: function (max, end) {

		max = max || 20;
		end = end || 12;
		
		if(this.length > max) return this.substring(0, max - end - 3) + '... ' + this.substring(this.length - end + 1);
		return this
	}
});
	
(function ($, window, undef) {

"use strict";
	var store = 'umo',
		transport = 'upl:tr',
		Class = window.Class,
		Element = window.Element,
		Locale = window.Locale,
		Object = window.Object,
		addEvent = 'addEvent',
		addEvents = 'addEvents',
		append = 'append',
		element = 'element',
		fireEvent = 'fireEvent',
		get = 'get',
		getElement = 'getElement',
		getFirst = 'getFirst',
		getXHR = 'getXHR',
		setStyle = 'setStyle',
		toFileSize = 'toFileSize',
		upload = 'upload',
		hasFileReader = 'FileReader' in window,
		input = (function () { var input = document.createElement('input'); input.type = 'file'; return input })(),
		fileproto = window.File ? File.prototype : {},
		method = 'mozSlice' in fileproto ? 'mozSlice' : ('webkitSlice' in fileproto ? 'webkitSlice' : ('slice' in fileproto ? 'slice' : false)),
		//browser version
		brokenSlice = (Browser.chrome && Browser.version < 11) || (Browser.firefox && Browser.version <= 4),
		//replaces chars
		replaces = {
			A: /\u00c0|\u00c1|\u00c2|\u00c3|\u00c4|\u00c5/g,
			C: /\u00c7/g,
			E: /\u00c8|\u00c9|\u00ca|\u00cb/g,
			I: /\u00cc|\u00cd|\u00ce|\u00cf/g,
			N: /\u00d1/g,
			O: /\u00d2|\u00d3|\u00d4|\u00d5|\u00d6/g,
			U: /\u00d9|\u00da|\u00db|\u00dc/g,
			Y: /\u00dd/g,
			a: /\u00e0|\u00e1|\u00e2|\u00e3|\u00e4|\u00e5/g,
			c: /\u00e7/g,
			e: /\u00e8|\u00e9|\u00ea|\u00eb/g,
			i: /\u00ec|\u00ed|\u00ee|\u00ef/g,
			n: /\u00f1/g,
			o: /\u00f2|\u00f3|\u00f4|\u00f5|\u00f6/g,
			u: /\u00f9|\u00fa|\u00fb|\u00fc/g,
			y: /\u00fd|\u00ff/g
		},
		
		uploadManager = window.uploadManager = {
			
			/* xmlhttp can be used */
			xmlhttpupload: 'files' in input && window.XMLHttpRequest && 'upload' in new XMLHttpRequest(),
			
			/* can handle multiple files upload */
			multiple: 'multiple' in input,
			//FF 4.01, chrome 11: resume upload seems to be broken
			resume: !!method,
						
			//upload hash
			uploads: {},
			
			active: false,
			//active transfers
			actives: {},
			
			//queue uploads per container
			enqueue: false,
			
			//maximun concurrent uploads, if queue uploads is true
			concurrent: 1,
			
			//transfer queue, callback functions
			queue: {},
			
			/*
			
				attach file dragdrop events onto el
			*/
			
			attachDragEvents: function (el, options) {
			
				$(el)[addEvents](dragdrop).store(store, options).grab(new Element('div[style=display:none][class=drop-upload]', {text: Locale[get]('uploadManager.DROP_FILE_HERE') }), 'top');								
				return this
			},

			/*
			
				detach file dragdrop events from el
			*/
			
			detachDragEvents: function (el) {
			
				el = $(el);
				if(el.retrieve(store)) $(el).removeEvents(dragdrop).eliminate(store)[getFirst]().destroy();
				return this			
			},	

			upload: function(options) {
			
				var opt = Object[append]({limit: 0, filesize: 0, maxsize: 0, progressbar: true/*, resume: false, iframe: false */}, options),
					container = opt.container,
					transfer;
				
				if(!this.uploads[container]) {
				
					this.actives[container] = [];
					this.uploads[container] = []
				}
				
				//restrict number of uploaded files
				if(opt.limit > 0 && this.uploads[container].length >= opt.limit) return undef;
				
				//where to send the uploaded file
				opt.base = opt.base || 'upload.php';
				opt.id =  opt.name.replace(/[^a-z0-9]/gi, '') + Date.now();
				
				if(opt.iframe || !this.xmlhttpupload) transfer = new Transfert(opt);
				
				//opera does not yet support chunck file upload
				else if(this.resume && !Browser.opera) transfer = new HTML5MultipartTransfert(opt);
				else transfer = new HTML5Transfert(opt);
			
				this.uploads[container].push(transfer);
			
				return transfer
			},
			
			push: function(container, callback) {
			
				this.queue[container] = this.queue[container] || [];				
				this.queue[container].push(callback);
				
				return this.load(container)
			},
			
			load: function (container) {
		
				var active = 0, prop;
				
				if(this.enqueue && this.active) {
				
					for(prop in this.actives[container]) {

						if(this.actives[container].hasOwnProperty(prop) && this.actives[container][prop].state == 1) active++;
						if(active >= this.concurrent) return this
					}
				}
			
				var callback = this.queue[container].shift();
				if(callback) {
				
					this.active = true;
					callback()
				}
				
				return this
			},
			
			//return Transfert instance associated to a given id
			get: function (id) { return $(id).retrieve(transport) },
										
			getSize: function(container) { 
				
				var size  = 0;
				(this.uploads[container] || []).each(function (transfer) { size += transfer.filesize });
				
				return size
			},

			//return a copy of the internal list
			getTransfers: function (container) { return (this.uploads[container] || []).concat() }
		},
		dragdrop = {
					
			dragenter: function(e) {
			
				e.stop();
				
				var el = this, co = el.getCoordinates();
				
				el[getFirst]().setStyles({
											left: co.left,
											top: co.top, 
											width: co.width, 
											height: 24,
											backgroundColor: '#E1F1FD',
											textAlign: 'center',
											display: 'block',
											zIndex: 10
										}).tween('backgroundColor', '#1096E6')										
			},	
			dragexit: function(e) {
				
				e.stop(); 
				this[getFirst]().style.display = 'none'
			},	
			dragover: function(e) { e.stop() },
			drop: function (e) {
			
				e.stop();
				
				var el = this, options = Object[append]({}, el.retrieve(store), {hideDialog: true}), transfer;

				el[getFirst]().style.display = 'none';
				if(e.event.dataTransfer) Array.from(e.event.dataTransfer.files).each(function (f) { 
				
						transfer = uploadManager[upload](Object[append]({}, options));
						if(transfer) transfer.load(f)
				})
			}
		},
		
		Transfert = new Class({
		
			state: 0,
			filesize: 0,
			complete: false,
			initialize: function(options) {

				//file type filter
				if(options.filetype) this[addEvent]('load',	function (object) { 
					
					var matches = options.filetype.split(/[^a-z0-9]/i); 
						
					if(!this.aborted && matches.length > 0) this.aborted = !new RegExp('(\.' + matches.join(')$|(\.') + '$)', 'i').test(object.file);
					if(this.aborted) this.message = Locale[get]('uploadManager.UNAUTHORIZED_FILE_TYPE')
				});
					
				var element, container = options.container;
					
				this[addEvents]({
		
						abort: function () { this.state = 2 },
						load: function () { uploadManager.actives[container].push(this) },
						success: function (json) {
								
							this.state = 4;
							this.filesize = json.size;
							this.complete = true;
							uploadManager.actives[container].erase(this);
							
							//ultimate file size limit check
							if(options.maxsize > 0) {
								
								var size = 0;
								
								uploadManager.getTransfers(options.container).each(function (transfer) { if(transfer.state == 4) size += transfer.size});
								
								if(size > options.maxsize) {
								
									this.message = Locale[get]('uploadManager.TOTAL_FILES_SIZE_EXCEEDED', options.maxsize[toFileSize]());
									this.cancel()
								}
							}
							
							var id = options.id,
								file = $(id + '_lfile')[set]({checked: true, value: json.path, disabled: false}),
								change = function () { file.checked = this.checked },
								checkbox = $(id)[set]({
										value: json.file,
										disabled: false,
										events: {
											
											change: change,
											click: change
										}
									});
									
								checkbox.style.display = '';
								checkbox.checked = true
						},
						cancel: function () {  
						
							this.state = 3;
							uploadManager.uploads[container].erase(this);
							uploadManager.actives[container].erase(this)
						},
						complete: function () { 
						
							if(uploadManager.actives[container].length == 0 && uploadManager.queue[container].length == 0) {
							
								uploadManager.active = false;
								this[fireEvent]('allComplete', container) 
							}
							else if(uploadManager.enqueue) {
							
								uploadManager.active = Object.every(uploadManager.actives[container], function (upload) { return upload.state == 1 });
								uploadManager.load(container)							
							}
						}
					}).setOptions(options);
				
				element = this.createElement(options);
				
				this.checkbox = element[getElement]('#' + options.id).store(transport, this);			
				element[getElement]('a.cancel-upload')[addEvent]("click", function(e) { 
						
					e.stop(); 
					this.cancel() 
					
				}.bind(this));
				this[fireEvent]('create', this)
			},
			
			createElement: function (options) {
			
				this[element] = new Element('div', {'class': 'upload-container',
								html: '<iframe id="' + options.id + '_iframe" src="' + options.base + ( options.base.indexOf('?') == -1 ? '?' : '&') + options.id + '" frameborder="no" scrolling="no" style="border:0;overflow:hidden;padding:0;display:block;float:left;height:20px;width:228px; "></iframe>'
								+ '<input type="checkbox" disabled="disabled" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
								+ '<input type="checkbox" disabled="disabled" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
								+ '<span class="upload-span" id="' + options.id + '_label"><a class="cancel-upload" href="' + options.base + '">' + Locale[get]('uploadManager.CANCEL') + '</a></span>'
							}).inject(options.container);
					
				return this[element]
			},
			
			toElement: function () { return this[element] },
			
			load: function (file) {
			
				//clean file name
				Object.each(replaces, function (value, key) { file = file.replace(value, key) });
				
				this.state = 1;
				this.aborted = false; 
				this[fireEvent]('load', {element: this[element], file: file, size: 0, transfer: this});
				
				if(this.aborted) {
				
					this.state = 2;
					this[fireEvent]('abort', {file: file, message: this.message || '', transfer: this})
				}
				
				delete this.message;
				return this;
			},
			
			cancel: function (message) {
			
				var complete = this.running;
				
				if(message) this.message = message;
				
				this[fireEvent]('cancel', this);
				if(complete) this[fireEvent]('complete', this);
				delete this.message;
				this[element].destroy()
			},
			
			Implements: [Options, Events]
		}),
		
		HTML5 = {
		
			events: {
			
				load: function (obj) {
				
					var options = this.options;
					
					//file size limit check
					if(obj.size == 0) {
					
						this.message = Locale[get]('uploadManager.EMPTY_FILE')
						this.aborted = true
					}
					
					//file size limit check
					else if(options.filesize > 0 && obj.size > options.filesize) {
					
						this.aborted = true;
						this.message = Locale[get]('uploadManager.MAX_FILE_SIZE_EXCEEDED', options.filesize[toFileSize]())
					}
					
					else if(options.maxsize > 0 && uploadManager.getSize(options.container) + obj.size > options.maxsize) {
					
						this.aborted = true;
						this.message = Locale[get]('uploadManager.TOTAL_FILES_SIZE_EXCEEDED', options.maxsize[toFileSize]())
					}
				}
			},
			
			add: function (obj, event, fn) {
			
				fn = fn.bind(this);
				if(obj.addEventListener) obj.addEventListener(event, fn, false);
				
				//IE 7 - 8
				else obj['on' + event] = fn;
				return this
			},

			load: function (file) {
				
				this.aborted = false;
				
				var name = file.name;
				
				//clean file name
				Object.each(replaces, function (value, key) { name = name.replace(value, key) });
				
				this[fireEvent]('load', {element: this[element], file: name, size: file.size, transfer: this});
				
				if(this.aborted) {
				
					this[fireEvent]('abort', {file: file, message: this.message || '', transfer: this});
					delete this.message;
					this.cancel();
					return this
				}
				
				this.file = file;
				this.size = file.size;
				this.filename = name;
				
				var first = this[element][getFirst]('.upload-progress'),
					span = first[getElement]('span')[setStyle]('display', 'none'),
					field = span.getNext()[setStyle]('display', 'none'),
					progress;
				
					this[addEvent]('progress', function (value) {
					
						if(progress && progress.setValue) progress.setValue(value);
						
						if(value == 1) {
							
							field[getElement]('label')[set]({text: file.name.shorten() + ' (' + this.size[toFileSize]() + ')', title: file.name});
							field.style.display = ''
						}
					});
					
				if(this.options.progressbar) progress = new ProgressBar(Object[append]({
						
						container: first[set]('title', file.name),
						text: file.name.shorten()
						
					}, typeof this.options.progressbar == 'object' ? this.options.progressbar : {}))[addEvents]({
						change: function () {
					
							first[set]('title', file.name + ' (' + (this.value * 100).format() + '%)')
						},
						onComplete: function () {
						
							progress = progress.toElement();
							progress.style.display = 'none';
							
							(function () { progress.destroy() }).delay(50)
						}
					});
					
				field[getFirst]().style.display = 'none';
				
				this[element][getElement]('input[type=file]').destroy();	
				
				span.destroy();
				uploadManager.push(this.options.container, function () {
				
					this.state = 1;
					this[upload]() 
				}.bind(this));
				
				if(this.reader) this.reader.readAsBinaryString(file);
				return this
			},
			createElement: function (options) {
			
				var input = this.createHTML(options)[getElement]('input[type=file]')[addEvent]('change', function (e) {
				
					var files = Array.from(e.target.files), op = Object[append]({}, options, {hideDialog: true}), transfer;
					
					this.load(files.shift());
					
					files.each(function (f) { 
					
						transfer = uploadManager[upload](Object[append]({}, op));
						if(transfer) transfer.load(f)
					})
					
				}.bind(this));
								
				if(Browser.name == 'firefox' && Browser.version >= 4) {
				
					new Element('a', {text: Locale[get]('uploadManager.BROWSE'), 'class': 'browse-upload', href: '#', events: {click: function (e) { e.stop(); input.click() }}}).inject(input[setStyle]('display', 'none'), 'before');
					if(!this.options.hideDialog) input.click.delay(10, input)
				}
						
				return this[addEvent]('abort', function () { input.value = '' })[element]
			}
		},
		
		HTML5Transfert = new Class(Object[append]({
		
			Extends: Transfert,
			running: false,
			ready: false,
			initialize: function(options) {
					
				this[addEvents](this.events)[addEvents]({
				
					success: function (json) { 
					
						var remove = json.remove;
						delete json.remove;
						
						this[addEvent]('cancel', function () {
						
							var xhr = new XMLHttpRequest();
							
							xhr.open('GET', remove, true);
							xhr.setRequestHeader('Sender', 'XMLHttpRequest');
							xhr.send()
						})
					},
					
					cancel: function () {
				
						if(this.running) {
						
							this.xhr.abort();
							this[getXHR]().running = false
						}
					}
								
				}).parent(options);
					
				this[getXHR]().binary = !!this.xhr.sendAsBinary;
						
				if(hasFileReader) {
				
					var reader = this.reader = new FileReader();
						
					this.add(reader, 'load', function(e) { 
					
						this.bin = e.target.result; 
						this.ready = true 
					})
				}
			},
			getXHR: function () {
			
				var xhr = this.xhr = new XMLHttpRequest(),
					options = this.options;
				
				this.add(xhr[upload], 'progress', function(e) { if (e.lengthComputable) this[fireEvent]('progress', e.loaded / e.total) }).						
					add(xhr, 'load', function() {

						if(xhr.status == 0) {
						
							this[element][getElement]('.resume-upload').style.display = '';
							return
						}
						
						var	self = this[fireEvent]('progress', 1),
							options = this.options;
								
						var status, json, event = 'success';
						this.running = false;
						
						try { status = xhr.status } catch(e) {}
						
						//success
						if (status >= 200 && status < 300) {
						
							try { 
							
								json = JSON.decode(xhr.responseText);
								json.transfer = this;
								json[element] = this[element];						
								if(json.size != this.size) event = 'failure'
							}					
							catch(e) { event = 'failure' }
							
						} else event = 'failure';
						
						this[fireEvent](event, event == 'failure' ? this : json)[fireEvent]('complete', this);

						if(json.size == 0) this.cancel(Locale[get]('uploadManager.EMPTY_FILE'));
						else if(options.filesize > 0 && json.size > options.filesize) this.cancel(Locale[get]('uploadManager.MAX_FILE_SIZE_EXCEEDED', options.filesize[toFileSize]()));
						else if(options.maxsize > 0 && uploadManager.getSize(options.container) > options.maxsize) this.cancel(Locale[get]('uploadManager.TOTAL_FILES_SIZE_EXCEEDED', options.maxsize[toFileSize]()))						
					}).
					add(xhr, 'abort', this.resume).
					add(xhr, 'error', this.resume);
					
				return this		
			},
			resume: function () {
			
				this[element][getElement]('.resume-upload').style.display = ''
			},
			createHTML: function (options) {
			
				this[element] = new Element('div', {
						'class': 'upload-container',
						html: '<div style="display:inline-block;padding:3px" class="upload-progress"><span style="display:none">&nbsp;</span><span><input id="' + options.id + '_input" type="file" name="' + options.id + '_input"' + (options.multiple ? ' multiple="multiple"' : '') + '/>'
						+ '<input type="checkbox" disabled="disabled" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
						+ '<input type="checkbox" disabled="disabled" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
						+ '<label for="'+ options.id + '"></label>'
						+ '</span></div><a class="cancel-upload" href="' + options.base + '">' + Locale[get]('uploadManager.CANCEL') + '</a><a class="resume-upload" style="display:none" href="' + options.base + '">' + Locale[get]('uploadManager.RETRY') + '</a>'
					}).inject(options.container);
					
				this[element].getLast()[addEvent]('click', function (e) {
				
					e.stop();
					this.initUpload()
					
				}.bind(this));
				
				return this[element]
			},
			
			//this launch the transfer, to retry after a failure, just call it again
			initUpload: function () {
			
				var xhr = this.xhr;
				
				this.running = true;
				this[element][getElement]('.resume-upload').style.display = 'none';
				
				xhr.open('POST', this.options.base, true);
				xhr.setRequestHeader('Size', this.size);
				xhr.setRequestHeader('Filename', this.filename);
				xhr.setRequestHeader('Sender', 'XMLHttpRequest');
				
				//FF
				if(this.binary) xhr.sendAsBinary(this.bin);
				else xhr.send(this.file)
			},
			upload: function () {

				if(this.reader) {
				
					if(this.ready) this.initUpload();
					else setTimeout(this[upload].bind(this), 100)
				} else this.initUpload()
			}
		}, HTML5)),
		
		/*
		
			faster upload with multipart transfert or resume on error with multiple chunk transfert ? both!
		*/
		HTML5MultipartTransfert = new Class(Object[append]({
		
			Extends: Transfert,
			
			partial: 0, //partially uploaded chunk
			loaded: 0,
			failed: 0,
			active: 0,
			options: {
			
				//user can stop/resume tranfert only on error ?
				/* pause: false, */
				chunks: 3, //number of concurrent transfers per upload
				chunckSize: 1048576	//upload chunk max size
			},
			initialize: function(options) {
				
				this[addEvents](this.events)[addEvents]({
				
					success: function () {
					
						this[element][getElement]('[type=hidden][disabled]')[set]({disabled: false, value: this.guid})
					},
					load: function (file) {
					
						this.blocks = {};
						this.uploads = {};
						this.parts = Math.ceil(file.size / this.options.chunckSize);
						
						for(var i = 0; i < this.parts; i++) this.blocks[i] = 1
					},
					cancel: function () { 
					
						Object.each(this.uploads, function (upload) { if(upload.xhr) upload.xhr.abort() });
						
						if(this.remove) {
						
							var xhr = new XMLHttpRequest();
							
							xhr.open('GET', this.remove, true);
							xhr.setRequestHeader('Sender', 'XMLHttpRequest');
							xhr.send()
						}
					},
					
					failure: function () {
					
						this[element][getElement]('.pause-upload')[set]('text', Locale[get]('uploadManager.RESUME')).style.display = ''
					}
								
				}).parent(options)
			},
			createHTML: function (options) {
			
				this[element] = new Element('div', {
						'class': 'upload-container',
						html: '<div style="display:inline-block;padding:3px" class="upload-progress"><span style="display:none">&nbsp;</span><span><input id="' + options.id + '_input" type="file" name="' + options.id + '_input"' + (options.multiple ? ' multiple="multiple"' : '') + '/>'
						+ '<input type="checkbox" disabled="disabled" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
						+ '<input type="checkbox" disabled="disabled" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
						+ '<input type="hidden" disabled="disabled" name="guid_' + options.name + '" id="'+ options.id + '_gfile"/>'
						+ '<label for="'+ options.id + '"></label>'
						+ '</span></div><a class="cancel-upload" href="' + options.base + '">' + Locale[get]('uploadManager.CANCEL') + '</a><a class="pause-upload" style="display:none" href="' + options.base + '">' + Locale[get]('uploadManager.PAUSE') + '</a>'
					}).inject(options.container);
					
				var pause = this[addEvents]({load: function () { if(this.options.pause) pause.style.display = '' }, success: function () {
				
					pause.destroy()
				}})[element].getLast('.pause-upload')[addEvent]('click', function (e) {
			
					e.stop();
					
					this[pause.hasClass('resume-upload') ? 'resume' : 'pause']()
					
				}.bind(this));
					
				return this[element]
			},
			pause: function () {

				this.paused = true;
				this[element][getElement]('.pause-upload').addClass('resume-upload')[set]('text', Locale[get]('uploadManager.RESUME')).style.display = '';
				this[fireEvent]('pause', this)
			},
			resume: function () {

				this.paused = false;
				this.failed = 0;
				this[element][getElement]('.pause-upload').removeClass('resume-upload')[set]('text', Locale[get]('uploadManager.PAUSE')).style.display = this.options.pause ? '' : 'none';
				this[fireEvent]('resume', this).upload()
			},
			failure: function () {
		
				this.failed++;
				if(this.failed >= this.active) this.pause()
			},
			getXHR: function (properties, headers, progress) {
			
				var xhr = new XMLHttpRequest(), property;
				
				if(progress) this.add(xhr[upload], 'progress', progress);
				
				properties = Object[append]({error: this.failure, abort: this.failure}, properties);
				
				for(property in properties) if(properties.hasOwnProperty(property)) this.add(xhr, property, properties[property]);
				
				xhr.open('POST', this.options.base, true);
				xhr.setRequestHeader('Size', this.size);
				xhr.setRequestHeader('Filename', this.filename);
				xhr.setRequestHeader('Sender', 'XMLHttpRequest');
				
				if(headers != undef) for(property in headers) if(headers.hasOwnProperty(property)) xhr.setRequestHeader(property, headers[property]);
				
				return xhr
			},
			compute: function () {
			
				var loaded = 0, property;
				
				for(property in this.uploads) loaded += this.uploads[property].loaded;
				this.partial = loaded;
				
				return this
			},
			send: function (index) {
			
				if(this.uploads[index].xhr || this.uploads[index].success) return;
								
				var xhr,
					upload = this.uploads[index], 
					headers = {
						
						Current: index,
						Offset: upload.offset,
						'Chunk-Size': upload.blob.size,
						Guid: this.guid
					},
					offset = this.options.chunckSize + (!brokenSlice ? this.uploads[index].loaded : 0);
			
				if(upload.loaded < upload.blob.size) headers.Partial = 1;
				
				xhr = this.uploads[index].xhr = this[getXHR]({
				
					load: function() {

							if(xhr.readyState == 0) {
							
								this.pause();
								return
							}
							
							var status, json, event = 'success';
							
							try { status = xhr.status } catch(e) {  }
							
							//success
							if (status >= 200 && status < 300) {
							
								try { 
								
									json = JSON.decode(xhr.responseText);
									
									if(json.remove) this.remove = json.remove;
									
									if(upload.blob.size > json.size) {
									
										if(json.success) {
											
											//load next
											delete this.uploads[index].xhr;
											this.initUpload(index)
										}
										
										else {
										
											//failure for some reason
											this.message = Locale[get]('uploadManager.FILE_CORRUPTED');
											this.failure()
										}
									}		
						
									else {
																			
										json.transfer = this;
										json[element] = this[element];
										if(json.message) this.message = json.message;
										
										if(json.success) {
										
											upload.loaded = json.size;
											
											if(json.size == upload.blob.size) {
												
												this.active--;
												this.loaded += json.size;
												
												delete this.blocks[index]
												delete this.uploads[index];
											}
											
											this.compute();
											if(this.size > this.loaded) this[upload]();
											else if(this.size == this.loaded) {
												
												var self = this[fireEvent]('progress', 1),
													options = this.options;
														
												json.size = this.size;
												this[fireEvent]('success', json)[fireEvent]('complete', this)
											}
										}
									}
								}			
										
								catch(e) { }
							}
							
						}
					},
					headers,
					function(e) { if (e.lengthComputable) this[fireEvent]('progress', (e.loaded + this.loaded + this.partial) / this.size) }
				);
				
				xhr.send(this.uploads[index].blob[method](this.uploads[index].loaded, offset))
			},
			initUpload: function (index) {
		
				if(this.uploads[index] && this.uploads[index].xhr) return;
				
				var xhr = this[getXHR]({
				
						error: this.pause,
						abort: this.pause,
						load: function () {
					
							var status, json;
							try { status = xhr.status } catch(e) {}
							
							//success
							if (status >= 200 && status < 300) {
							
								try { 
								
									json = JSON.decode(xhr.responseText);
									
									//failed for some reasons
									if(!json.success) {
										
										this.message = Locale[get]('uploadManager.PREFETCH_FAILED');
										this.failure();
										return
									}
									
									this.uploads[index].loaded = json.size;
									this.compute().send(index)
								}					
								catch(e) { 
								
									this.message = Locale[get]('uploadManager.PREFETCH_FAILED');
									this.failure()
								}
							}
						}
					},
					{
						Current: index,
						Offset: this.uploads[index].offset,
						'Chunk-Size': this.uploads[index].blob.size,
						Prefetch: 1,
						Guid: this.guid
					}
				);
				xhr.send()			
			},
			createGuid: function () {
			
				var xhr = this[getXHR]({
				
						error: this.pause,
						abort: this.pause,
						load: function () {
					
							var status, json;
							try { status = xhr.status } catch(e) {}
							
							//success
							if (status >= 200 && status < 300) {
							
								try { 
								
									json = JSON.decode(xhr.responseText);
									
									//failed for some reasons
									if(!json.success) {
										
										this.message = Locale[get]('uploadManager.PREFETCH_FAILED');
										this.failure();
										return
									}
									
									this.guid = json.guid;
									this[upload]()
								}					
								catch(e) { 
								
									this.message = Locale[get]('uploadManager.PREFETCH_FAILED');
									this.failure()
								}
							}
						}
					},
					{Parts: this.parts, Prefetch: 1}
				);
							
				xhr.send();
				
				return this
			},
			upload: function () {

				if(this.paused) return;
				
				var i, offset, chunckSize = this.options.chunckSize;
				
				if(!this.guid) {
                                    
					this.createGuid();
					return
				}
				
				for(i in this.blocks) {
						
					if(this.active == this.options.chunks) break;
					
					if(!this.uploads[i]) {
						
						offset = Math.min(this.size, i * chunckSize);
						this.uploads[i] = {

								loaded: 0,
								offset: offset,
								blob: this.file[method](offset, chunckSize + (!brokenSlice ? offset : 0))
						}
					}
					else this.active++;
					
					this.initUpload(i)
				}
			}
			
		}, HTML5));
		
		Object[append](Element.NativeEvents, {dragenter: 2, dragexit: 2, dragover: 2, drop: 2});
		
})(document.id, this);

/*
---
script: upload.js
license: MIT-style license.
description: Javascript crossbrowser file upload, with some html5 sugar.
copyright: Copyright (c) 2006 - 2010 Thierry Bela
authors: [Thierry Bela]

requires: 
  core:1.2.3: 
  - Element.Event
  - Element.Style
  - Fx.Tween
  - Array
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
	
(function ($) {

	//file type filter
	function filter(object) { 
					
		var matches = this.options.filetype.split(/[^a-z0-9]/i); 
			
		if(!this.aborted && matches.length > 0) this.aborted = !new RegExp('(\.' + matches.join(')$|(\.') + '$)', 'i').test(object.file);
		if(this.aborted) this.message = 'unauthorized file type'
	}
				
	var store = 'umo',
		transport = 'upl:tr',
		window = this,
		html5 = !!new Element('input', {type: 'file'}).files,
		
		uploadManager = this.uploadManager = {
			
			/* iframe or xmlhttp is used */
			xmlhttpupload: html5,
						
			//upload hash
			uploads: {},
			
			//active transfers
			actives: {},
			
			events: {},
			
			//transfer queue, callback functions
			queue: {},
			
			/*
			
				attach file dragdrop events onto el
			*/
			
			attachDragEvents: function (el, options) {
			
				new Element('div', {style: 'display:none', text: 'Drop files here' }).
								inject($(el).
								addEvents(dragdrop).
								store(store, options), 'top');								
				return this
			},

			/*
			
				detach file dragdrop events from el
			*/
			
			detachDragEvents: function (el) {
			
				$(el).removeEvents(dragdrop).getFirst().destroy();
				return this			
			},	

			addEvent: function (container, event, fn) {
			
				this.events[container].addEvent(event, fn);				
				return this
			},
			
			fireEvent: function (container, event, fn, delay) {
			
				this.events[container].fireEvent(event, fn, delay);				
				return this
			},
			
			upload: function(options) {
			
				var opt = $merge({limit: 0}, options),
					container = opt.container,
					transfer;
				
				if(!this.uploads[container]) {
				
					this.events[container] = new Events();
					this.actives[container] = [];
					this.uploads[container] = []
				}
				
				//restrict number of uploaded files
				if(opt.limit > 0 && this.uploads[container].length >= opt.limit) return null;
				
				if(opt.onAllComplete) {
				
					this.addEvent(opt.container, 'onAllComplete', opt.onAllComplete);
					delete opt.onAllComplete
				}
				
				//where to send the uploaded file
				opt.base = opt.base || 'upload.php';
				opt.id =  opt.name.replace(/[^a-z0-9]/gi, '') + new Date().getTime();
				
				transfer = html5 ? new HTML5Transfert(opt) : new Transfert(opt);
			
				this.uploads[container].push(transfer);
			
				return transfer.fireEvent('create', opt.id)
			},
			
			enqueue: function(container, callback) {
			
				this.queue[container] = this.queue[container] || [];				
				this.queue[container].push(callback);
				
				return this.load(container)
			},
			
			load: function (container) {
			
				var callback = this.queue[container].shift();
				if(callback) callback();
				return this
			},
			
			//return Transfert associated to a given id
			get: function (id) {
			
				return $(id).retrieve(transport)
			},
						
			getSize: function(container, convert) { 
				
				var size  = 0;
				
				(this.uploads[container] || []).each(function (transfer) { size += transfer.filesize });
				
				return convert ? this.format(size) : size
			},
			
			//return a copy of the internal list
			getTransfers: function (container) {
			
				var transfers = this.uploads[container] || [];
				return transfers.map(function (t) { return t })
			},
			
			format: function (size) {
					
				if(size == 0) return size;
				if (size < 1024) return size + ' ' + 'Bytes';
				if (size < 1024 * 1024) return (size / 1024.).format() + ' Kb';
				if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024.)).format() + ' Mb';
				return (size / (1024 * 1024 * 1024.)).format() + ' Gb';
			}
		},
		dragdrop = {
					
			dragenter: function(e) {
			
				e.stop();
				
				var el = this;
				
				co = el.getCoordinates();
				
				el.getFirst().setStyles({
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
			
			dragexit: function(e) { e.stop() },	
			
			mouseleave: function (e) { this.getFirst().style.display = 'none' },
			
			dragover: function(e) { e.stop() },
			
			drop: function (e) {
			
				e.stop();
				
				var el = this, options = el.retrieve(store);
				
				el.getFirst().style.display = 'none';
				if(e.event.dataTransfer) $A(e.event.dataTransfer.files).each(function (f) { try { uploadManager.upload(options).load(f) } catch(e) {} })
			}
		},
		
		Transfert = new Class({
		
			filesize: 0,
			complete: false,
			initialize: function(options) {

				//Events
				if(options.filetype) this.addEvent('load', filter.bind(this));
					
				var element,
					container = options.container;
					
				this.addEvents({
		
						success: function (json) {
							
							this.filesize = json.size;
							this.complete = true;
							uploadManager.actives[container].erase(this)
							
							var id = options.id,
								file = $(id + '_lfile').set({checked: true, value: json.path}),
								change = function () { file.checked = this.checked };
							
								
							$(id).set({
										checked: true, 
										value: json.file,
										events: {
											
											change: change,
											click: change
										}
									}).style.display = ''
						},
						
						load: function () {
													
							uploadManager.actives[container].push(this)
						},
						
						cancel: function () {  
						
							uploadManager.uploads[container].erase(this)
							uploadManager.actives[container].erase(this)
						},
						
						complete: function () {  
						
							if(uploadManager.actives[container].length == 0) uploadManager.fireEvent(container, 'allComplete', container)
						}
						
					}).setOptions(options);
				
				element = this.createElement();
				element.getElement('#' + options.id).store(transport, this);					
				element.getElement('a').addEvent("click", function(e) { 
						
						e.stop(); 
						this.cancel() 
				}.bind(this))
			},
			
			createElement: function () {
			
				var options = this.options;
				
				this.element = new Element('div', {'class': 'upload-container',
								html: '<iframe id="' + options.id + '_iframe" src="' + options.base + ( options.base.indexOf('?') == -1 ? '?' : '&') + options.id + '" frameborder="0" scrolling="no" style="border:0;overflow:hidden;padding:0;display:block;float:left;height:20px;width:228px; "></iframe>'
								+ '<input type="checkbox" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
								+ '<input type="checkbox" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
								+ '<span class="upload-span" id="' + options.id + '_label"><a href="' + options.base + '">Remove</a></span>'
							}).inject(options.container);
					
				return this.element
			},
			
			toElement: function () { return this.element },
			
			load: function (file) {
			
				this.aborted = false;
				this.fireEvent('load', {element: this.element, file: file, size: 0, transfer: this});
				if(this.aborted) this.fireEvent('abort', {file: file, message: this.message || '', transfer: this});
				return this;
			},
			
			cancel: function () {
			
				var complete = this.running;
				
				this.fireEvent('cancel', this);
				if(complete) this.fireEvent('complete', this);
				this.element.destroy()
			},
			
			Implements: [Options, Events]
		}),
		
		HTML5Transfert = new Class({
		
			Extends: Transfert,
			running: false,
			ready: false,
			reader: !!window.FileReader,
			initialize: function(options) {
					
				this.addEvents({
				
					success: function (json) { 
					
						var remove = json.remove;
						delete json.remove;
						
						this.addEvent('cancel', function () {
						
							var xhr = new XMLHttpRequest();
							
							xhr.open('GET', remove, true);
							xhr.setRequestHeader('Sender', 'XMLHttpRequest');
							xhr.send()
						})
						
					},
					
					cancel: function () {
				
							if(this.running) {
							
								this.xhr.abort();
								this.xhr.onreadystatechange = function(){};
								this.xhr = new XMLHttpRequest();
								this.running = false
							}
						}
								
				}).parent(options);
					
				var xhr = this.xhr = new XMLHttpRequest();
				
				this.binary = !!xhr.sendAsBinary;
					
				xhr.onreadystatechange = this.onStateChange.bind(this);

				this.add(xhr.upload, 
							'progress', 
							function(e) {

								if (e.lengthComputable) {
									
									var tween = {width: e.loaded * this.width / e.total};
									this.progress.start({0:tween, 1:tween})
								}
							}).						
					add(xhr,
							'load', 
							function() {

								var tween = {width: this.width};
								this.progress.start({0: tween, 1: tween}).chain(function () {
								
									(function () {
									
										this.span.style.display = 'none';
										this.fields.getElement('label').set('text', this.filename + '(' + uploadManager.format(this.size) + ')');
										this.fields.style.display = '';
									}.bind(this)).delay(50)
								}.bind(this))
							}).
					add(xhr,
							'error', 
							function() {

								this.span.style.display = 'none';
								this.fields.getElement('label').set('text', this.filename + '(Failed)');
							
							}.bind(this));
							
				if(this.reader) {
				
					var reader = this.reader = new FileReader();
						
					this.add(reader,
								'load', 
								function(e) { 
									this.bin = e.target.result; 
									this.ready = true 
								})
				}
			},
			
			createElement: function () {
			
				var options = this.options, input;
				
				this.element = new Element('div', {
						'class': 'upload-container',
						html: '<div style="display:inline-block;padding:3px"><span style="display:none">&nbsp;</span><span><input id="' + options.id + '_input" type="file" name="' + options.id + '_input"' + (options.multiple ? ' multiple="multiple"' : '') + '/>'
						+ '<input type="checkbox" style="display:none" name="' + options.name + '" id="' + options.id + '"/>'
						+ '<input type="checkbox" style="display:none" name="file_' + options.name + '" id="'+ options.id + '_lfile"/>'
						+ '<label for="'+ options.id + '"></label>'
						+ '</span></div><a href="' + options.base + '">Remove</a>'
					}).inject(options.container);
								
								
				input = this.element.getElement('input[type=file]').addEvent('change', function (e) {
				
					var files = $A(e.target.files), options = this.options;
					
					this.load(files.shift());
					files.each(function (f) {
						
						try { uploadManager.upload(options).load(f) } catch(e) {}
					})
					
				}.bind(this));
								
				return this.addEvent('abort', function () { input.value = '' }).element
			},
			
			add: function (obj, event, fn) {
			
				fn = fn.bind(this);
				if(obj.addEventListener) obj.addEventListener(event, fn, false);
				else obj['on' + event] = fn;
				return this
			},
			
			onStateChange: function() {
			
				if (this.xhr.readyState != 4) return;
				
				var status, json, event = 'success';
				this.running = false;
				
				try { status = this.xhr.status } catch(e) {}
				this.xhr.onreadystatechange = function(){};
				
				//success
				if (status >= 200 && status < 300) {
				
					try { 
					
						json = JSON.decode(this.xhr.responseText);
						json.transfer = this;
						json.element = this.element;						
						if(json.size != this.size) event = 'failure'
					}					
					catch(e) { event = 'failure' }
					
				} else event = 'failure';
											
				this.fireEvent(event, event == 'failure' ? this : json).fireEvent('complete', this)
			},

			load: function (file) {
				
				this.aborted = false;
				this.fireEvent('load', {element: this.element, file: file.name, size: file.size, transfer: this});
				
				if(this.aborted) {
				
					this.fireEvent('abort', {file: file, message: this.message || '', transfer: this});
					this.cancel();
					return this
				}
				
				this.file = file;
				this.size = file.size;
				this.filename = file.name;
				
				
				var first = this.element.getFirst(),
					width = this.width = first.offsetWidth - 6,
					name = file.name.shorten(),
					style = 'position:absolute;display:inline-block;margin:0 auto;left:0;top:0',
					span = this.span = this.element.getElement('span').
						set({style: 'width:' + width + 'px;position:relative;border:1px solid #ccc;display:inline-block;text-align:center;', title: file.name}).
						adopt(new Element('span', {style: 'z-index:1;width:' + width + 'px;margin:0 auto;color:#aaa;' + style, text: name})).
						adopt(new Element('span', {style: 'z-index:2;overflow:hidden;width:1px;' + style}).
									adopt(new Element('span', {style: 'width:' + width + 'px;margin:0 auto;color:#fff;display:inline-block', text: name}))
							).
						adopt(new Element('span', {html: '&nbsp;', style: 'overflow:hidden;width:1px;background:#28F;' + style})),
					children = span.getChildren();
							
				first.setStyle('width', first.offsetWidth);
				
				this.progress = new Fx.Elements([children.pop(), children.pop()], {link: 'cancel'});
												
				this.fields = span.getNext().setStyle('display', 'none');
				this.fields.getFirst().style.display = 'none';				
				uploadManager.enqueue(this.options.container, this.upload.bind(this));
				if(this.reader) this.reader.readAsBinaryString(file);
				return this
			},
			
			//this launch the transfer, to retry after a failure, just call it again
			initUpload: function () {
			
				var xhr = this.xhr;
				
				this.running = true;
				xhr.open('POST', this.options.base, true);
				xhr.setRequestHeader('Filename', this.filename);
				xhr.setRequestHeader('Sender', 'XMLHttpRequest');
				
				//FF
				if(this.binary) xhr.sendAsBinary(this.bin);
				else xhr.send(this.file)
			},
			
			upload: function () {
			
				if(this.reader) {
				
					if(this.ready) this.initUpload();
					else setTimeout(this.upload.bind(this, 1000))
				} else this.initUpload()
			}
		});
		
		$extend(Element.NativeEvents, {dragenter: 2, dragexit: 2, dragover: 2, drop: 2})
	
})(document.id);

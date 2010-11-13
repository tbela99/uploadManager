/*
---
script: progressbar.js
license: MIT-style license.
description: Javascript progressbar.
copyright: Copyright (c) Thierry Bela
authors: [Thierry Bela]

requires: 
  core:1.2.4: 
  - Element.Event
  - Fx.Elements
provides: [ProgressBar]
...
*/

var ProgressBar = new Class({

	options: {
	
		/*
		
		backgroundImage: '',
		*/
		
		value: 0,
		text: '',
		fillColor: '#aaa',
		color: '#fff'
	},
	Implements: [Options, Events],
	initialize: function (options) {
	
		options = this.setOptions(options).options;
		
		var container = document.id(this.options.container),
			width = this.width = options.width || container.getStyle('width').toInt() || 1,
			style = 'position:absolute;display:inline-block;margin:0 auto;left:0;top:0',
			self = this,
			timer,
			change = function () {
			
				self.value = last.getStyle('width').toInt() / self.width;
				self.fireEvent('change', [self.value, self])
			},
			clear = function () {
			
				clearTimeout(timer);
				change()
			},
			last;
			
		this.value = 0;
		this.element = new Element('span', {style: 'width:' + width + 'px;position:relative;border:1px solid ' + options.fillColor + ';background:' + options.color + ';display:inline-block;'}).
						inject(container).
						grab(new Element('span', {style: 'z-index:1;width:' + width + 'px;text-indent:5px;margin:0 auto;color:' + options.fillColor + ';' + style, text: options.text})).
						grab(new Element('span', {style: 'z-index:2;overflow:hidden;width:' + options.value + 'px;' + style}).
									grab(new Element('span', {style: 'width:' + width + 'px;text-indent:5px;margin:0 auto;color:' + options.color + (options.backgroundImage ? ';background: url(' + options.backgroundImage + ') repeat-x' : '') + ';display:inline-block', text: options.text}))
							).
						grab(new Element('span', {html: '&nbsp;', style: 'width:' + options.value + 'px;background:' + options.fillColor + ';' + style}));
		
		var last = this.element.getLast();
		this.element.setStyle('height', last.getStyle('height'));
		this.elements = $$(this.element.getFirst(), this.element.getElement('span span'));
		this.progress = new Fx.Elements([last, last.getPrevious()], {
																		link: 'cancel', 
																		onStart: function () {
																	
																			timer = setTimeout(change, 10)
																		},
																		onCancel: clear,
																		onComplete: clear
																});
		if(options.text === '') this.elements[1].set('html', '&nbsp;');
		this.setValue(options.value)
	},
	toElement: function () { return this.element },
	setText: function (text) {
	
		this.elements.set('text', text);
		return this
	},
	setValue: function(value) {
	
		if(value < 0) value = 0;
		else if(value > 1) value = 1;
		
		if(this.value != value) {
			
			var tween = {width: value * this.width},
				self = this;
				
			this.progress.start({0: tween, 1: tween}).chain(function () {
			
				if(value == 1) self.fireEvent('complete', self)
			})
		}
		
		return this
	},
	getValue: function () { return this.value }
});

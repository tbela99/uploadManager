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
	
		this.setOptions(options);
		
		var container = document.id(this.options.container),
			width = this.options.width || container.offsetWidth,
			style = 'position:absolute;display:inline-block;margin:0 auto;left:0;top:0';
			
		this.width = width || 1;
		
		options = this.options;
		
		this.element = new Element('span').
						inject(container).
						set({style: 'width:' + width + 'px;position:relative;border:1px solid ' + options.fillColor + ';background:' + options.color + ';display:inline-block;text-align:center;'}).
						adopt(new Element('span', {style: 'z-index:1;width:' + width + 'px;margin:0 auto;color:' + options.fillColor + ';' + style, text: options.text})).
						adopt(new Element('span', {style: 'z-index:2;overflow:hidden;width:' + this.options.value + 'px;' + style}).
									adopt(new Element('span', {style: 'width:' + width + 'px;margin:0 auto;color:' + options.color + (options.backgroundImage ? ';background: url(' + options.backgroundImage + ') repeat-x' : '') + ';display:inline-block', text: options.text}))
							).
						adopt(new Element('span', {html: '&nbsp;', style: 'width:' + this.options.value + 'px;background:' + options.fillColor + ';' + style}));
		
		last = this.element.getLast();
		this.element.setStyle('height', last.offsetHeight);
		this.elements = $$(this.element.getFirst(), this.element.getElement('span span'));
		this.progress = new Fx.Elements([last, last.getPrevious()], {link: 'cancel'});
		if(this.options.text === '') this.elements[1].set('html', '&nbsp;');
		this.setValue(this.options.value)
	},
	toElement: function () {
	
		return this.element
	},
	setText: function (text) {
	
		this.elements.set('text', text);
		return this
	},
	setValue: function(value) {
	
		if(value < 0) value = 0;
		else if(value > 1) value = 1;
		
		if(this.getValue() != value) {
			
			var tween = {width: value * this.width},
				self = this;
			this.progress.start({0: tween, 1: tween}).chain(function () {
			
				self.fireEvent('change', value);
				if(value == 1) self.fireEvent('complete')
			})
		}
		
		return this
	},
	getValue: function () {
	
		return this.element.getLast().offsetWidth / this.width
	}
})
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
		gradient: false,
		fillColor: '#aaa',
		color: '#fff'
	},
	previous: 0,
	Implements: [Options, Events],
	initialize: function (options) {
	
		options = this.setOptions(options).options;
		
		if(typeof options.gradient == 'boolean') options.gradient = [options.color, options.fillColor];
		
		options.gradient = options.gradient ? this.getBackground(options.gradient) : options.color;
				
		var container = document.id(this.options.container),
			width = this.width = options.width || container.getStyle('width').toInt() || 1,
			height,
			style = 'position:absolute;display:inline-block;margin:0 auto;left:0;top:0',
			self = this,
			timer,
			value = 0,
			change = function () {
			
				self.fireEvent('change', [value, self])
			},
			clear = function () {
			
				clearTimeout(timer);
				change()
			},
			last,
			set;
			
		this.value = 0;
		this.element = new Element('span', {style: 'width:' + width + 'px;position:relative;border:1px solid ' + options.fillColor + ';background:' + options.color + ';display:inline-block;'}).
						inject(container).
						grab(new Element('span', {style: 'z-index:1;width:' + width + 'px;text-indent:5px;margin:0 auto;color:' + options.fillColor + ';' + style, text: options.text})).
						grab(new Element('span', {style: 'z-index:2;overflow:hidden;width:' + options.value + 'px;' + style}).
									grab(new Element('span', {style: 'width:' + width + 'px;text-indent:5px;margin:0 auto;color:' + options.color + (options.backgroundImage ? ';background: url(' + options.backgroundImage + ') repeat-x' : '') + ';display:inline-block;' + style, text: options.text}))
							).
						grab(new Element('span', {html: '&nbsp;', style: 'width:' + options.value + 'px;' + (options.gradient.indexOf(':') == -1 ? 'background' : 'filter') + ':' + options.gradient + ';' + style}));
		
		last = this.element.getLast();
		height = last.getStyle('height');
		this.element.setStyle('height', height).getElement('span+span').setStyle('height', height);
		this.elements = $$(this.element.getFirst(), this.element.getElement('span span'));
		this.progress = new Fx.Elements([last, last.getPrevious()], {
																		link: 'cancel', 
																		onStart: function () {
																	
																			timer = setTimeout(change, 10)
																		},
																		onCancel: clear,
																		onComplete: clear
																});
										
		//little hack to improve the precision of the value
		set = this.progress.set.bind(this.progress);
		
		this.progress.set = function (now) {
		
			this.value = value = now[0].width[0].value / this.width;
			return set(now)
			
		}.bind(this);
		
		
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
				
			this.previous = this.value;
			this.progress.start({0: tween, 1: tween}).chain(function () { if(value == 1) self.fireEvent('complete', self) })
		}
		
		return this
	},
	getValue: function () { return this.value },
	getBackground: function (background) {
	
		if(typeof background == 'string') return background;
		
		background = Object.map(background, function (val) { return val });
		var bg;
		
		switch(Browser.name) {
		
			case 'firefox':
					
				if(Browser.version >= '3.6') bg = '-moz-linear-gradient(top,{0} 0%,{1} 59%)'; /* FF3.6+ */
				
				break;
			case 'chrome':
			case 'safari':
			
				if((Browser.name == 'chrome' && Browser.version >= '10') || (Browser.name == 'safari' && Browser.version >= '5.1')) bg = '-webkit-linear-gradient(top,{0} 0%,{1} 59%)'; /* Chrome10+,Safari5.1+ */
				else if(Browser.chrome || Browser.version >= '4') bg = '-webkit-gradient(linear, left top,left bottom,color-stop(0%,{0}),color-stop(59%,{1}))'; /* Chrome,Safari4+ */
				
				break;
			case 'opera':
			
				if(Browser.version >= '11.10') bg = '-o-linear-gradient(top,{0} 0%,{1} 59%)'; /* Opera11.10+ */
				
				break;
			case 'ie':
				
				if(Browser.version >= '10') bg = '-ms-linear-gradient(top,{0} 0%,{1} 59%)'; /* IE10+ */
				else if(Browser.version >= 6) bg = "progid:DXImageTransform.Microsoft.gradient(startColorstr='{0}', endColorstr='{1}',GradientType=0 )"; /* IE6-9 */
				break;
		}
	
		if(bg == '') bg = '{0}';
		
		return bg.substitute(background)
	}
});


	/**
	 * original from jan kassens http://github.com/kassens/mootools-snippets/blob/master/Number.js
	 *
	 * @author thierry bela <bntfr at yahoo dot fr>
	 */
	Number.implement({
	
	  format: function(kSep, floatsep, decimals, fill){
	      decimals = $pick(decimals, 2);
	      floatsep = $pick(floatsep, '.');
	      kSep = $pick(kSep, ' ');
	      fill = $pick(fill, '');
	 
	      var parts = this.round(decimals).toString().split('.'),
			integer = parts[0];
	      while (integer != (integer = integer.replace(/([0-9])(...($|[^0-9]))/, '$1' + kSep + '$2')));
	      if (decimals === 0) return integer;
		  
		  var dec = parts[1] ? parts[1].substr(0, decimals) : '';
			  
		  if(fill) while(dec.length < decimals) dec += '0';
		  
		  return integer + (dec ? floatsep + dec : '')
	  }
	});
	
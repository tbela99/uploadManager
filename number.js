
	Number.implement({
		
		format: function(kSep, floatsep, decimals, fill) {
		
			decimals = decimals == undefined ? 2 : decimals;
			floatsep = floatsep == undefined ? '.' : floatsep;
			kSep = kSep == undefined ? ' ' : undefined;
			fill = fill == undefined ? '' : fill;

			var parts = this.round(decimals).toString().split('.'),
			integer = parts[0];
			
			while (integer != (integer = integer.replace(/([0-9])(...($|[^0-9]))/, '$1' + kSep + '$2')));
			
			if (decimals === 0) return integer;

			var dec = parts[1] ? parts[1].substr(0, decimals) : '';
			  
			if(fill) while(dec.length < decimals) dec += '0';

			return integer + (dec ? floatsep + dec : '')
		},
		  
		toFileSize: function(units) {
		
			if(this == 0) return 0;
			
			var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'],
				e = Math.floor(Math.log(this) / Math.log(1024));

			return (this / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + (units && units[e] ? units[e] : s[e]);
		}
	});
	
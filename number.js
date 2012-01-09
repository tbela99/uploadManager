
	Number.implement({
		
		format: function(kSep, floatsep, decimals, fill) {

			decimals = decimals == undefined ? 2 : decimals;
			floatsep = floatsep == undefined ? '.' : floatsep;
			kSep = kSep == undefined ? ' ' : kSep;
			fill = fill == undefined ? '' : fill;

			var parts = this.round(decimals).toString().split('.'),
				integer = parts[0],
				string = '' + integer,
				str = '',
				i, j;
				
			for(i = 0, j = string.length; j > 0; j-- && i++) str = (j > 1 && i % 3 == 2 ? kSep : '') + string.charAt(j-1) + str;

			if (decimals === 0) return str;

			var dec = parts[1] ? parts[1].substr(0, decimals) : '';

			if(fill) while(dec.length < decimals) dec += '0';

			return str + (dec ? floatsep + dec : '')
		},

		toFileSize: function(units) {
		
			if(this == 0) return 0;
			
			var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'],
				e = Math.floor(Math.log(this) / Math.log(1024));

			return (this / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + (units && units[e] ? units[e] : s[e]);
		}
	});
	
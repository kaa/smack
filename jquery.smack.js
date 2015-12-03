;(function($) {
	$.fn.smack = function(context) {
		this.find("[data-bind]")
			.addBack("[data-bind]")
			.each(function() {

				// Resolve and parse binding directives
				var e = $(this),
					match,
					bindings = e.attr("data-bind"),
					re = /(^|,)\s*((\w+):)?\s*(\!|\#|\?\!?)?('([^']*)'|([^,\|]+(?:\|[^,\|]+)*))/g;

				// Remove binding directives from element
				e.attr("data-bind", null);

				// Execute each rule in binding directive
				while((match = re.exec(bindings)) !== null) {
					// Resolve value from context
					var value;
					if(match[7]) {						// Simple value
						value = valueOf(match[7], context);
					} else {									// String interpolation '{' MEMBER '}'
						value = match[6].replace(/\{([^\}\|]+(?:\|[^\}\|]+)*)\}/g, function(_, key) {
							return valueOf(key, context);
						});
					}

					// Bind value to target
					if(match[3]) {                // ATTRIBUTE ':' MEMBER - binds attributes
						e.attr(match[3], value)
					} else if(match[4] === "?" || match[4] === "?!") { // '?' | '?!' - include / exclude element depending on truthyness of value
						if(match[4].length==1 != !!value) {
							e.remove();
							break;
						}
					} else if(match[4] === "!") { // '!' MEMBER - binds unescaped html content
						e.html(value);
					} else if(match[4] === "#") { // '#' MEMBER - binds for each
						for(var i in value) {
							if(!value.hasOwnProperty(i)) continue;
							var clone = e.clone().attr("data-bind", bindings.replace(match[0],""));
							e.before(clone.smack(value[i]));
						}
						e.remove();
					} else {                      // MEMBER - binds escaped text content
						e.text(value);
					}
				}
			});
		return this;
	};
	function valueOf(key, val) {
		for(key = key.split('.') ; key.length > 0 && key[0] !== ""; key.shift()) {
			if(val === undefined) return;
			var fallback = key[0].split('|')
			for(; fallback.length>0 && val[fallback[0]]===undefined; )
				fallback.shift();
			val = val[fallback[0]];			
		}
		return val;
	}
}(jQuery));
//ICGC Library
//Version 1.0
//2013-Aug-23 Friday
//See associated icgcSpec.js for Jasmine-1.3.1.js definition.

/* For BC form copy the following into the right item text of the first question:
 <script type="text/javascript" src="includes/icgc_tr_5.js"></script>
 <script type="text/javascript">
 jQuery(document).ready(function($) { 
 ICGC.TR.setup_endoscopy();
 });
 </script>
 */

//From http://stackoverflow.com/questions/3326650/console-is-undefined-error-for-internet-explorer/16916941#16916941
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


//Construct an empty namespace called ICGC if it does not already exist.
var ICGC = ICGC || {};

// Define BC sub-namesapce
ICGC.TR = function() {

	var self = {};

	function enableControlForValue(triggerControl, triggerValue, targetControl, wipeOnHide) {

		console.log("tV: '" + triggerValue + "'");
		console.log(" 0: '" + triggerControl.val() + "'");
		if (triggerControl.val() === triggerValue) {
			console.log(" 1");
			targetControl.show();
		} else {
			console.log(" 2: '" + targetControl.val() + "'");
			// Make sure Control is disabled and empty
			if (wipeOnHide && targetControl.val() !== "") {
				console.log(" 3");
				targetControl.val("");
				targetControl.change();
			}
			targetControl.hide();
		}
	}

	function allVisibleSelectsWith(value) {
		//option:visible
		return jQuery("[value='" + value + "']")
			.parent();
	}

	function nextSelectAlong(select) {
		return select.parent().next().children("select");
	}

	function secondSelectAlong(select) {
		return select.parent().next().next().children("select");
	}

	function initAndChange(sel, func) {
		sel.each(function() {
			var t = $(this);
			t.change(func(t));
			func(t)();
		});
	}

	self.setup_row = function() {

		initAndChange(allVisibleSelectsWith("ResidualNeoplasia"),
			function(s) {
				return function() {
					enableControlForValue(s, "ResidualNeoplasia",
						nextSelectAlong(s), true);
				};
			});
		initAndChange(
			allVisibleSelectsWith("ProceedToFurtherEndoscopicTherapy"),
			function(s) {
				return function() {
					enableControlForValue(s,
						"ProceedToFurtherEndoscopicTherapy",
						secondSelectAlong(s), true);
				};
			});
		initAndChange(jQuery("#ET").parent().parent()
			.find("select"), function(s) {
				return function() {
					enableControlForValue(s, "yes", jQuery("#Outcome").parent().parent().parent().parent().parent(), false);
				};
			});

	};

	self.setup_endoscopy = function() {
		console.log("Do nothing");
		/*
		jQuery("button[stype='add']").click(function() {
			self.setup_row();
		});
		self.setup_row();
		*/
	}

	return self;

}();

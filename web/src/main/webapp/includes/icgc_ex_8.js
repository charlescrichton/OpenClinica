//ICGC Library
//Version 1.0
//2013-Aug-23 Friday
//See associated icgcSpec.js for Jasmine-1.3.1.js definition.

/* For EX form copy the following into the right item text of the height question in the obesity section:
 <script src="includes/icgc_ex_8.js"></script>
 <script type="text/javascript">
 jQuery(document).ready(function($) { 
 ICGC.EX.setup_obesity(); // or ICGC.EX.setup_lifestyle();
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

console.log("ICGC defined");

// Define EX sub-namesapce
ICGC.EX = function() {

	var self = {};

	self.setup_obesity = function() {

		var obcfnuField = jQuery("#ex_obcfnu").parent().parent().find("select");
		var obynField = jQuery("#ex_obyn").parent().parent().find("select");

		var heightField = jQuery("#ex_h").parent().parent().find("input");
		var weightField = jQuery("#ex_w").parent().parent().find("input");
		var bmiField = jQuery("#ex_b").parent().parent().find("input");

		function calcBMI(hCm, wKg) {
			var hM = hCm / 100;
			return Math.round(wKg / (hM * hM) * 10) / 10;
		}

		function n(x) {
			if (isNaN(x)) {
				return true
			}
			return x <= 0;
		}

		function doCalc(force) {			
			var h = heightField.val();
			var w = weightField.val();
			var curB = bmiField.val();
			var b = curB;

			if ((force || n(curB)) && (!n(w) && !n(h))) {
				b = calcBMI(h, w);
			}
			if (curB !== b) {
				bmiField.val(b);
				bmiField.change();
			}
		}
		
		function doTransfer() {
			console.log("doTransfer()");
			var obcfnu = obcfnuField.val();
			var oldObyn = obynField.val();
			var newObyn = oldObyn;

			if (obcfnu !== undefined && obcfnu !== null) {
				if (obcfnu === "current") {
					newObyn = "yes";
				} else if (obcfnu === "former") {
					newObyn = "yes";
				} else if (obcfnu === "never") {
					newObyn = "no";
				} else if (obcfnu === "unknown") {
					newObyn = "unknown";
				}
			}

			if (newObyn !== oldObyn) {
				obynField.val(newObyn);
				obynField.change();
			}
		}

		heightField.blur(function() {
			doCalc(false);
		});

		weightField.blur(function() {
			doCalc(false);
		});

		obcfnuField.change(function() {
			doTransfer();
		});

		jQuery("#srl").on("focus", function() {
			doCalc(false);
			doTransfer();
		});
		jQuery("#srh").on("focus", function() {
			doCalc(false);
			doTransfer();
		});
		jQuery("#bmiRecalculate").unbind().click(function() {
			doCalc(true);
		});

	};
	
	self.setup_lifestyle = function() {

		var curFormHeavyDrinkerField = jQuery("#ex_cfhd").parent().parent().find("select");
		var curHeavyDrinkerField = jQuery("#ex_chd").parent().parent().find("select");

		function doTransfer() {
			var cfhd = curFormHeavyDrinkerField.val();
			var oldChd = curHeavyDrinkerField.val();
			var newChd = oldChd;

			if (cfhd !== undefined && cfhd !== null) {
				if (cfhd === "current") {
					newChd = "yes";
				} else if (cfhd === "former") {
					newChd = "no";
				} else if (cfhd === "never") {
					newChd = "no";
				} else if (cfhd === "unknown") {
					newChd = "unknown";
				}
			}

			if (newChd !== oldChd) {
				curHeavyDrinkerField.val(newChd);
				curHeavyDrinkerField.change();
			}
		}

		curFormHeavyDrinkerField.change(function() {
			doTransfer();
		});
		jQuery("#srl").on("focus", function() {
			doTransfer();
		});
		jQuery("#srh").on("focus", function() {
			doTransfer();
		});
	};

	return self;
}();


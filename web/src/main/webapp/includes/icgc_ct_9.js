//ICGC Library (1)
//Version 1.0
//2013-Aug-23 Friday
//See associated icgcSpec.js for Jasmine-1.3.1.js definition.

/* For BC form copy the following into the right item text of the first question:
 <script type="text/javascript" src="includes/icgc_bc_7.js"></script>
 <script type="text/javascript">
 jQuery(document).ready(function($) { 
 ICGC.BC.setup();
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

// This is for any generic DOM functions. Form specific functions should go
// elsewhere.
ICGC.DOM = function() {

	var self = {};

	/*
	 * This listens for changes in a table row count and calls the function if
	 * there is a change.
	 * 
	 */
	self.tableRowCountChangeDetector = function(jQueryTableRowSelectorText, onChangeFunction) {
		// Set initial value
		var previousRowCount = jQuery(jQueryTableRowSelectorText).length;

		setInterval(function() {
			var currentRowCount = jQuery(jQueryTableRowSelectorText).length;
			if (currentRowCount !== previousRowCount) {
				previousRowCount = currentRowCount;
				onChangeFunction();
			}
		}, 500);
	};

	/*
	 * Function which takes a set of items selected by jQuery and calls change on
	 * them. Usage example:
	 * ICGC.DOM.initAndChange(jQuery("#ET").parent().parent().find("select"),
	 * function(s) { return function() { enableControlForValue(s, "yes",
	 * jQuery("#ETD").parent().parent().parent(), false); }; } );
	 */
	self.initAndChange = function(sel, func, namespace) {
		sel.each(function() {
			var t = jQuery(this);
			t.on("change." + namespace, func(t));
			func(t)();
		});
	};

	self.alterControlForValue = function(triggerControl, triggerValue, enableControlFunction, disableControlFunction) {
		var value = triggerControl.val();
		if (value === triggerValue) {
			enableControlFunction();
		} else {
			disableControlFunction();
		}
	};

	self.alterControlForValueArray = function(triggerControl, triggerValuesArray, enableControlFunction, disableControlFunction) {
		var value = triggerControl.val();
		if (triggerValuesArray.indexOf(value) >= 0) {
			enableControlFunction();
		} else {
			disableControlFunction();
		}
	};

	/**
	 * Hides/Shows a control when another control has a particular value.
	 */
	self.showControlForValue = function(triggerControl, triggerValue, targetControl, wipeOnHide) {
		self.alterControlForValue(triggerControl, triggerValue, function() {
			targetControl.show();
		}, function() {
			targetControl.hide();
			if (wipeOnHide && targetControl.val() !== "") {
				targetControl.val("");
				targetControl.change();
			}
			;
		});
	};

	self.showControlForValueArray = function(triggerControl, triggerValuesArray, targetControl, wipeOnHide) {
		self.alterControlForValueArray(triggerControl, triggerValuesArray, function() {
			targetControl.show();
		}, function() {
			targetControl.hide();
			if (wipeOnHide && targetControl.val() !== "") {
				targetControl.val("");
				targetControl.change();
			}
			;
		});
	};


	self.enableControlForValue = function(triggerControl, triggerValue, targetControl, wipeOnHide) {

		self.alterControlForValue(triggerControl, triggerValue, function() {
			targetControl.removeAttr("disabled");
		}, function() {
			targetControl.attr("disabled", "disabled");
			if (wipeOnHide && targetControl.val() !== "") {
				targetControl.val("");
				targetControl.change();
			}
			;
		});
	};

	self.enableControlForValueArray = function(triggerControl, triggerValuesArray, targetControl, wipeOnHide) {

		self.alterControlForValueArray(triggerControl, triggerValuesArray, function() {			
			targetControl.removeAttr("disabled");
		}, function() {
			targetControl.attr("disabled", "disabled");
			if (wipeOnHide && targetControl.val() !== "") {
				targetControl.val("");
				targetControl.change();
			}
			;
		});
	};


	self.greyChildControlsWhenNotValue = function(triggerControl, triggerValue, targetControl) {

		self.alterControlForValue(triggerControl, triggerValue, function() {
			targetControl.children().attr("style", "color:#000000");
		}, function() {
			targetControl.children().attr("style", "color:#E0E0E0");
		});
	};

	self.greyChildControlsWhenNotValueArray = function(triggerControl, triggerValuesArray, targetControl) {

		self.alterControlForValueArray(triggerControl, triggerValuesArray, function() {
			 
			targetControl.find('td').removeAttr("style");
		}, function() {
			 
			targetControl.find('td').attr("style", "color:#E0E0F0");
		});
	};

	return self;

}();

ICGC.STUDYSUBJECT = function() {

	var self = {};

	var studySubjectIdRegExp = /OCCAMS\/[A-Z]{2}\/[0-9]{3}/g;

	// ("OCCAMS/AH/001")).toEqual("OC/AH/001")
	self.ShortenStudySubject = function(studySubjectID) {

		if (studySubjectID === null) {
			return "";
		}

		// Matches and is same length OCCAMS/AZ/000 is 13 characters
		if (studySubjectID.length === 13 && studySubjectID.search(studySubjectIdRegExp) === 0) {
			return studySubjectID.replace("OCCAMS", "OC");
		}

		return "";
	};

	return self;

}();

// Define BC sub-namesapce
ICGC.BC = function() {

	var self = {};

	// Get the study subject from the page.
	// THe path to the study subject on the page is:
	// /html/body/div[4]/table/tbody/tr/td[2]/h1/span
	// jQuery("#centralContainer > table > tbody tr td[2] h1 span").
	self.getStudySubject = function() {

		return jQuery.trim(jQuery("#centralContainer > table > tbody > tr > td:eq(1) > h1 > span").text());

	};

	self.getOccurenceNumber = function() {
		
    //    <td class="table_cell_noborder">
    //        <b>Occurrence Number:</b>
	//	  </td>
	//    <td class="table_cell_noborder"> 1 </td>
	return jQuery('td.table_cell_noborder > b:contains("Occurrence Number:")').parent().next().text().trim();

	};

	self.ComposeSampleName = function(studySubjectIdentifier, collectionNumber, tubeNumber) {
		var shortenedName = ICGC.STUDYSUBJECT.ShortenStudySubject(studySubjectIdentifier);
		if (shortenedName === "")
			return "";
		if (collectionNumber === null || collectionNumber === "")
			return "";
		if (tubeNumber === null || tubeNumber === "")
			return "";
		return shortenedName + "/B/C" + collectionNumber + "/T" + tubeNumber;
	};

	self.getTableSelector = function() {
		var $table = jQuery("span[data-id='LocalSampleIdentifier_1']").closest('table');
		//console.log("Table Selector");
		//console.log ($table.get());
		return $table;
	};

	self.getTableTemplateRowSelector = function() {
		var $tableBody = self.getTableSelector().find('tbody');
		var $tableRows = $tableBody.find('tr[repeat-template]:eq(0)'); // First
		return $tableRows;
	};

	self.getAllTableRowsSelector = function() {
		var $tableBody = self.getTableSelector().find('tbody');
		var $tableRows = $tableBody.find('tr[repeat-template]'); // [repeat!="template"]
		return $tableRows;
	};

	self.getTableRowsSelector = function(index) {
		var $tableBody = self.getTableSelector().find('tbody');
		var $tableRows = $tableBody.find('tr[repeat-template]:eq(' + index + ')'); // [repeat!="template"]
		return $tableRows;
	};

	self.getAllTableRowsSelector = function() {
		var $tableBody = self.getTableSelector().find('tbody');
		var $tableRows = $tableBody.find('tr[repeat-template]'); // [repeat!="template"]
		return $tableRows;
	};

	// Column for fields (first column is 0)
	var pos_TubeNumber = 1;  
	var pos_SN = 2;  
	var pos_BloodPrep = 6;  


	// This gets an entire column
	self.getInputSelectors = function(pos) {
		var $inputs = self.getAllTableRowsSelector().find('td:eq(' + pos + ') > input[type!="hidden"]');
		//console.log("a) Input Selector: "+pos);
		//console.log($inputs.get());
		return $inputs;
	};

	self.getInputSelector = function(pos, index) {
		var $inputs = self.getTableRowsSelector(index).find('td:eq(' + pos + ') > input[type!="hidden"]');
		// console.log("Input Selector: "+pos);
		// console.log($inputs.get());
		return $inputs;
	};

	// This gets an enire column
	self.getSelectSelectors = function(pos) {
		var $inputs = self.getAllTableRowsSelector().find('td:eq(' + pos + ') > select');
		//console.log("B) Select Selector: "+pos);
		//console.log($inputs.get());
		return $inputs;
	};

	self.getSelectSelector = function(pos, index) {
		var $inputs = self.getTableRowsSelector(index).find('td:eq(' + pos + ') > select');
		// console.log("Select Selector: "+pos);
		// console.log($inputs.get());
		return $inputs;
	};

	/* Selectors for specific rows */

	self.getTubeNumberSelector = function(index) {
		return self.getInputSelector(pos_TubeNumber, index);
	};

	// These get the entire column
	self.getTubeNumberSelectors = function() {
		return self.getInputSelectors(pos_TubeNumber);
	};


	self.getSampleNameSelector = function(index) {
		return self.getInputSelector(pos_SN, index);
	};

	self.getSampleNameSelectors = function() {
		return self.getInputSelectors(pos_SN);
	};

	self.getBloodPreparationSelector = function(index) {
		return self.getSelectSelector(pos_BloodPrep, index);
	};

	// These get the entire column
	self.getBloodPreparationSelectors = function() {
		return self.getSelectSelectors(pos_BloodPrep);
	};

	self.countRows = function() {
		return self.getAllTableRowsSelector().get().length;
	};

	self.updateFields = function(index) {

//		console.log("update fields("+index+")");

		// Get old values

		var studySubjectIdentifier = self.getStudySubject();

		var tubeNumber = self.getTubeNumberSelector(index).val();
		var oldSampleName = self.getSampleNameSelector(index).val();
		var bloodPreparation = self.getBloodPreparationSelector(index).val();

		//If the tube number is empty ... then fill it!
		if (tubeNumber === null || tubeNumber === undefined || tubeNumber === '') {
			tubeNumber = "" + (index + 1);
			var tubeSelector = self.getTubeNumberSelector(index);
			tubeSelector.val(tubeNumber);
			tubeSelector.change();
		}

		//Make sure the blood preparation is set to ctDNA
		if (bloodPreparation !== "ctDNA") {
			var bloodPrepSelector = self.getBloodPreparationSelector(index);
			bloodPrepSelector.val("ctDNA");
			bloodPrepSelector.change();
		}

		// Get the colleciton number from the field
		var collectionNumber = jQuery("span[data-id=CollectionNumber_2]").parent().parent().find("input").val();

		// Calculate new value
		var newSampleName = self.ComposeSampleName(studySubjectIdentifier, collectionNumber, tubeNumber);

		// Check to see if the value has changed - if not then do nothing.
		if (newSampleName !== oldSampleName) {
			// Sets value
			var control = self.getSampleNameSelector(index);
			control.val(newSampleName);

			// Call changed
			control.change();
		}

	};

	self.updateAllFields = function() {
		var rowCount = self.countRows();
//		console.log("Update all fields: "+rowCount);		
		for ( var i = 0; i < self.countRows(); i++) {
			self.updateFields(i);
		}
		;
	};

	self.configureUpdateFields = function() {

		var $TubeNumberSelectors = self.getTubeNumberSelectors();
		var $SampleNameSelectors = self.getSampleNameSelectors();
		var $bloodPreparationSelectors = self.getBloodPreparationSelectors();
		// console.log($TissueTypeSelectors);

		// Go through all selectors and bind an update.

		// .bind with namespace needs jQuery1.7.1 or later.
		$TubeNumberSelectors.on('change.icgc', function() {
			//console.log("c1");		 
			self.updateAllFields();
		});

		$bloodPreparationSelectors.attr("disabled", true);
		$SampleNameSelectors.attr("readonly", true);
	};

	self.thereAreTissueSamplesWithIDs = function() {
		// Go through each row
		var result = false;
		var $sampleNameSelectors = self.getSampleNameSelectors();
		// console.log($sampleNameSelectors);
		$sampleNameSelectors.each(function(i) {
			if (jQuery(this).val() !== "") {
				result = true;
				// Stop iterating
				return false;
			}
		});
		return result;
	};

	self.handleAddButton = function() {

            //hide the original button and add a new button
            var btn = self.getTableSelector().find("button:contains('Add')");
            btn.hide();

            var newBtn = jQuery("<button class='button_search'>Add</button>").insertAfter(btn);
            newBtn.on("click", function (event) {
                //add a new row
                btn.trigger("click");
                //var lastRow = self.table.find("tr:last").prev().prev();
                
                self.configureUpdateFields();
                self.updateAllFields();
            	 
                event.preventDefault();
                return false;
            });
        };

	self.setup = function() {

//		console.log('hi');

		// Go through each row and add a listener to each blood type source
		// selector and asource selector number.

		// Go through each row
		self.configureUpdateFields();

//		console.log('there');

		// Add configuration step to add button
		jQuery('.button_search').bind('click.icgc', function() {
			self.configureUpdateFields();
		});

//		console.log('buddy');

		//Configure display logic on page
		var $bloodSamplesTakenControlSelectorFn = function() { return jQuery("span[data-id^=BloodSamplesTaken]").parent().parent().find("select"); };
		var $reasonNoSamplesTakenControlSelectorFn = function() { return jQuery("span[data-id=NoBloodSamplesTakenReason_1]").parent().parent().find("textarea"); };
		var $reasonNoSamplesTakenDisplaySelectorFn = function() { return jQuery("span[data-id=NoBloodSamplesTakenReason_1]").parent().parent(); };
		
		var $collectionNumberSelectorFn = function() { return jQuery("span[data-id=CollectionNumber_2]").parent().parent().find("input"); };
		 

		//Enable and disable fields when yes/no is toggled.
		var $tableSelectorFn = function() {
			return ICGC.BC.getTableSelector();
		};

		ICGC.DOM.initAndChange($bloodSamplesTakenControlSelectorFn(), function(s) {
			return function() {
				ICGC.DOM.enableControlForValue(s, "No", $reasonNoSamplesTakenControlSelectorFn(), true);
				ICGC.DOM.greyChildControlsWhenNotValue(s, "No", $reasonNoSamplesTakenDisplaySelectorFn());
				// Try and remove any rows
				ICGC.DOM.alterControlForValue(s, "No", function() {
					jQuery(".remove_button").each(function() {
						jQuery(this).click();
					});
				}, function() {
				});
				ICGC.DOM.showControlForValue(s, "Yes", $tableSelectorFn(), false);
			};
		}, "taken");

		//Copy the occurence number into the page
		$collectionNumberSelector = $collectionNumberSelectorFn();
		//console.log("$collectionNumberSelectorFn.val: '"+$collectionNumberSelector.val()+"'");
		//console.log("self.getOccurenceNumber(): '"+self.getOccurenceNumber()+"'");

		if ($collectionNumberSelector.val() === '' || $collectionNumberSelector.val() === undefined || $collectionNumberSelector.val() === null) {
			$collectionNumberSelector.val(self.getOccurenceNumber());
			$collectionNumberSelector.change();
		}

		// If not set, then set to yes.
		// If there are any blood samples on the page then set the control to Yes
		// (if it is not already Yes)
		var $bloodSamplesTakenControlSelector = $bloodSamplesTakenControlSelectorFn();
		if ($bloodSamplesTakenControlSelector.val() !== "No") {
			$bloodSamplesTakenControlSelector.val("Yes");
			$bloodSamplesTakenControlSelector.change();
		}
		if ($bloodSamplesTakenControlSelector.val() !== true && self.thereAreTissueSamplesWithIDs()) {
			$bloodSamplesTakenControlSelector.val("Yes");
			$bloodSamplesTakenControlSelector.change();
			// Lock it.
			$bloodSamplesTakenControlSelector.attr("disabled", "disabled");
		}
		;

		//Look for change in collection number
		ICGC.DOM.initAndChange($collectionNumberSelectorFn(), function(s) {
				return function() {
					self.updateAllFields();
				};
		}, "taken");

		//Stage of collection determines which fields are made available
		var $stageOfCollectionSelectorFn = function() { return jQuery("span[data-id=CollectionStage_2]").parent().parent().find("select"); };
		var $cycleSelectorFn = function() { return jQuery("span[data-id=CollectionStageCycle_1]").parent().parent().find("input"); };
		var $cycleSelectorTextFn = function() { return jQuery("span[data-id=CollectionStageCycle_1]").parent().parent(); };
		
		ICGC.DOM.initAndChange($stageOfCollectionSelectorFn(), function(s) {
			return function() {
				var stagingArrayValues = ["NCC","ACC","NRC","ARC"]; //Cycles
				ICGC.DOM.greyChildControlsWhenNotValueArray(s, stagingArrayValues, $cycleSelectorTextFn() );	
				ICGC.DOM.enableControlForValueArray(s, stagingArrayValues, $cycleSelectorFn(), true);	
				ICGC.DOM.showControlForValueArray(s, stagingArrayValues, $cycleSelectorFn(), false);		 
			};
		}, "cycle");

		//Post Op time
		var $CollectionStagePostOperationTimeSelectorFn = function() { return jQuery("span[data-id=CollectionStagePostOperationTime_1]").parent().parent().find("input"); };
		var $CollectionStagePostOperationTimeSelectorTextFn = function() { return jQuery("span[data-id=CollectionStagePostOperationTime_1]").parent().parent(); };

		var $CollectionStagePostOperationTimeUnitSelectorFn = function() { return jQuery("span[data-id=CollectionStagePostOperationTimeUnit_2]").parent().parent().find("select"); };
		var $CollectionStagePostOperationTimeUnitSelectorTextFn = function() { return jQuery("span[data-id=CollectionStagePostOperationTimeUnit_2]").parent().parent(); };

		ICGC.DOM.initAndChange($stageOfCollectionSelectorFn(), function(s) {
			return function() {
				var stagingArrayValues = ["POP"]; //Post-op
				ICGC.DOM.greyChildControlsWhenNotValueArray(s, stagingArrayValues, $CollectionStagePostOperationTimeSelectorTextFn() );		 
				ICGC.DOM.enableControlForValueArray(s, stagingArrayValues, $CollectionStagePostOperationTimeSelectorFn(), true);	
				ICGC.DOM.showControlForValueArray(s, stagingArrayValues, $CollectionStagePostOperationTimeSelectorFn(), false);	

				ICGC.DOM.greyChildControlsWhenNotValueArray(s, stagingArrayValues, $CollectionStagePostOperationTimeUnitSelectorTextFn() );		 			
				ICGC.DOM.enableControlForValueArray(s, stagingArrayValues, $CollectionStagePostOperationTimeUnitSelectorFn(), true);				
				ICGC.DOM.showControlForValueArray(s, stagingArrayValues, $CollectionStagePostOperationTimeUnitSelectorFn(), false);	

			};
		}, "postop");

		//Other - CollectionStageOther_2
		var $CollectionStageOtherSelectorFn = function() { return jQuery("span[data-id=CollectionStageOther_2]").parent().parent().find("input"); };
		var $CollectionStageOtherSelectorTextFn = function() { return jQuery("span[data-id=CollectionStageOther_2]").parent().parent(); };

		ICGC.DOM.initAndChange($stageOfCollectionSelectorFn(), function(s) {
			return function() {
				var stagingArrayValues = ["OTH"]; //Other
				ICGC.DOM.greyChildControlsWhenNotValueArray(s, stagingArrayValues, $CollectionStageOtherSelectorTextFn() );	
				ICGC.DOM.enableControlForValueArray(s, stagingArrayValues, $CollectionStageOtherSelectorFn(), true);	
				ICGC.DOM.showControlForValueArray(s, stagingArrayValues, $CollectionStageOtherSelectorFn(), false);		 
			};
		}, "other");

		//Disable column 11g (Blood preparation method)
		//self.hideBloodPreparationColumn();

		//Update all
		self.updateAllFields();
		self.handleAddButton();

	};

	return self;

}();

//console.log("Yo!");

 jQuery(document).ready(function($) { 
 	ICGC.BC.setup();
 });

//console.log("LOL");
//
//jQuery(ICGC.BC.getTableRowsSelector(0).find("td")[1]).find("input[type!=hidden]");
// jQuery(ICGC.BC.getTableRowsSelector(0).find("td")[1]).find("input[type!=hidden]").data("events");
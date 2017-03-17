//ICGC Library
//Version 1.0
//2013-Aug-23 Friday
//See associated icgcSpec.js for Jasmine-1.3.1.js definition.

/* For TC form copy the following into the right item text of the first question:
<script type="text/javascript" src="includes/icgc_tc_7.js"></script>
<script type="text/javascript">
    jQuery(document).ready(function($) { 
    		ICGC.TC.setup();
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

//This is for any generic DOM functions. Form specific functions should go elsewhere.
ICGC.DOM = function() {

	var self = {};
	
	/* This listens for changes in a table row count and calls the function if there is a change.
	 * 
	 */
	self.tableRowCountChangeDetector = function (jQueryTableRowSelectorText, onChangeFunction) {
		//Set initial value
		var previousRowCount = jQuery(jQueryTableRowSelectorText).length;
		
		setInterval(function() {	
				var currentRowCount = jQuery(jQueryTableRowSelectorText).length;
		    if(currentRowCount !== previousRowCount){
		    	previousRowCount = currentRowCount;
		    	onChangeFunction();
		    }
		}, 500);
	};
	
	
	
	/* Function which takes a set of items selected by jQuery and calls change on them.
	 * Usage example: 
	 *   ICGC.DOM.initAndChange(jQuery("#ET").parent().parent().find("select"), 
	 *   		function(s) {
   *				return function() {
   *          enableControlForValue(s, "yes", jQuery("#ETD").parent().parent().parent(), false);
   *        };
   *      }
   *   );
	 */
	self.initAndChange = function(sel, func, namespace) {
    sel.each(function() {
     var t = jQuery(this);
     t.on("change."+namespace,func(t));
     func(t)();
    });
   };
	
   self.alterControlForValue = 
  	 function(triggerControl, triggerValue, enableControlFunction, disableControlFunction) {        
     if (triggerControl.val() === triggerValue) {    
    	 enableControlFunction();
     } else {          
      disableControlFunction();
     }
    };
   
   /** Hides/Shows a control when another control has a particular value.
    */
   self.showControlForValue = function(triggerControl,
       triggerValue, targetControl, wipeOnHide) {   
  	 self.alterControlForValue(triggerControl, 
  			 triggerValue, 
  			 function() {targetControl.show();}, 
  			 function() {targetControl.hide(); 
  				 if (wipeOnHide && targetControl.val() !== "") {        
  		       targetControl.val("");
  		       targetControl.change();
  		      };  				 
  			 });
     };
   
     self.enableControlForValue = function(triggerControl,
         triggerValue, targetControl, wipeOnHide) {   
    	 
    	 self.alterControlForValue(triggerControl, 
    			 triggerValue, 
    			 function() {targetControl.removeAttr("disabled"); }, 
    			 function() {targetControl.attr("disabled", "disabled"); 
  				 if (wipeOnHide && targetControl.val() !== "") {        
  		       targetControl.val("");
  		       targetControl.change();
  		      };} );
     };
     
     self.greyChildControlsWhenNotValue = function(triggerControl,
         triggerValue, targetControl) {   
    	 
    	 self.alterControlForValue(triggerControl, 
    			 triggerValue, 
    			 function() {targetControl.children().attr("style", ""); }, 
    			 function() {targetControl.children().attr("style", "color:#E0E0E0"); }
    	 );
     };
    	      
	return self;
	
}();


ICGC.STUDYSUBJECT = function() {

	var self = {};
	
	var studySubjectIdRegExp = /OCCAMS\/[A-Z]{2}\/[0-9]{3}/g;
	
	//("OCCAMS/AH/001")).toEqual("OC/AH/001")
	self.ShortenStudySubject = function(studySubjectID) {
		
		if (studySubjectID === null) {
			return "";			
		}
		 
		//Matches and is same length OCCAMS/AZ/000 is 13 characters
		if (studySubjectID.length === 13 && studySubjectID.search(studySubjectIdRegExp) === 0) {
			return studySubjectID.replace("OCCAMS","OC");
		}	
		 
		return "";
	};
	
	return self;

}();


//Define TC sub-namesapce
ICGC.TC = function() {

	var self = {};	
	
	//Get the study subject from the page.	
	// THe path to the study subject on the page is: /html/body/div[4]/table/tbody/tr/td[2]/h1/span
	// jQuery("#centralContainer > table > tbody tr td[2] h1 span").
	self.getStudySubject = function() {
		
		return jQuery.trim(jQuery("#centralContainer > table > tbody > tr > td:eq(1) > h1 > span").text());
		
	};
	
	
	
	self.ComposeSampleName = function (studySubjectIdentifier, tissueType, tissueSource, sourceNumber) {
		var shortenedName = ICGC.STUDYSUBJECT.ShortenStudySubject(studySubjectIdentifier);
		if (shortenedName === "") return "";
		if (tissueType === null || tissueType === "") return "";
		if (tissueSource === null || tissueSource === "") return "";
		if (sourceNumber === null || sourceNumber === "") return "";
		return shortenedName + "/" + tissueType + "/" + tissueSource + sourceNumber;
	};
	
	self.getTableSelector = function() {		
		var $table = jQuery("#icgc_d").closest('table');		
		//console.log("Table Selector");
		//console.log ($table.get());
		return $table;
	};
	
	self.getTableTemplateRowSelector = function() {		
		var $tableBody = self.getTableSelector().find('tbody');		 
		var $tableRows = $tableBody.find('tr[repeat="template"]:eq(0)'); //First template row selector 
		return $tableRows;
	};
	
	self.getAllTableRowsSelector = function() {
		var $tableBody = self.getTableSelector().find('tbody');		 
		var $tableRows = $tableBody.find('tr[repeat][repeat!="template"]'); //[repeat!="template"]
		return $tableRows;
	};
	
	self.getTableRowsSelector = function(index) {
		var $tableBody = self.getTableSelector().find('tbody');		 
		var $tableRows = $tableBody.find('tr[repeat][repeat!="template"]:eq('+index+')'); //[repeat!="template"]
		return $tableRows;
	};
	
	self.getAllTableRowsSelector = function() {
		var $tableBody = self.getTableSelector().find('tbody');	
		var $tableRows = $tableBody.find('tr[repeat][repeat!="template"]'); //[repeat!="template"]
		return $tableRows;
	};
	
	//var pos_DC = 0; //TC_DateOfCollection_1 I
	var pos_TT = 1; //TC_TissueType_4 S
	var pos_TS = 2; //TC_TissueSource_3 S
	var pos_TSN = 3; //TC_TissueSourceNumber_2 S
	//var pos_DS = 4; //TC_DateSampleSentToCambridge_1 I
	var pos_SN = 5; //TC_SampleName_2 I
	
	//This gets an entire column
	self.getInputSelectors = function(pos) {		
		var $inputs = self.getAllTableRowsSelector().find('td:eq('+pos+') > input[type!="hidden"]');		
		//console.log("Input Selector: "+pos);
		//console.log($inputs.get());
		return $inputs;
	};
	
	self.getInputSelector = function(pos,index) {		
		var $inputs = self.getTableRowsSelector(index).find('td:eq('+pos+') > input[type!="hidden"]');		
		//console.log("Input Selector: "+pos);
		//console.log($inputs.get());
		return $inputs;
	};
	
	//This gets an enire column
	self.getSelectSelectors = function(pos) {		
		var $inputs = self.getAllTableRowsSelector().find('td:eq('+pos+') > select');		
		//console.log("Select Selector: "+pos);
		//console.log($inputs.get());
		return $inputs;
	};
	
	self.getSelectSelector = function(pos,index) {		
		var $inputs = self.getTableRowsSelector(index).find('td:eq('+pos+') > select');		
		//console.log("Select Selector: "+pos);
		//console.log($inputs.get());
		return $inputs;
	};
	
	/* NOT REQUIRED
	self.getDateOfCollectionSelector = function() {	
		return self.getInputSelector(pos_DC);
	};
	*/
	
	self.getTissueTypeSelector = function(index) {	
		return self.getSelectSelector(pos_TT,index);
	};
	
	self.getTissueSourceSelector = function(index) {	
		return self.getSelectSelector(pos_TS,index);
	};
	
	self.getTissueSourceNumberSelector = function(index) {	
		return self.getSelectSelector(pos_TSN,index);
	};
	
	//These get the entire column
	self.getTissueTypeSelectors = function() {	
		return self.getSelectSelectors(pos_TT);
	};
	
	self.getTissueSourceSelectors = function() {	
		return self.getSelectSelectors(pos_TS);
	};
	
	self.getTissueSourceNumberSelectors = function() {	
		return self.getSelectSelectors(pos_TSN);
	};
	
	/* NOT REQUIRED
	self.getDateSampleSentToCambridgeSelector = function() {	
		return self.getInputSelector(pos_DS);
	};
	*/
	
	self.getSampleNameSelector = function(index) {	
		return self.getInputSelector(pos_SN,index);
	};
	
	self.getSampleNameSelectors = function() {	
		return self.getInputSelectors(pos_SN);
	};
	
	self.countRows = function() {		
		return self.getAllTableRowsSelector().get().length;
	};
		
	
	
self.updateFields = function(index) {
		
		//console.log("update fields("+index+")");
	
		//Get old values
	
		var studySubjectIdentifier = self.getStudySubject();
		var tissueType = self.getTissueTypeSelector(index).val();
		var tissueSource = self.getTissueSourceSelector(index).val();
		var sourceNumber = self.getTissueSourceNumberSelector(index).val();
		var oldSampleName = self.getSampleNameSelector(index).val();
		
		//Calculate new value		
		var newSampleName = self.ComposeSampleName(studySubjectIdentifier, tissueType, tissueSource, sourceNumber);
		
		//Check to see if the value has changed - if not then do nothing.
		if (newSampleName !== oldSampleName) {
			//Sets value
			var control = self.getSampleNameSelector(index);			
			control.val(newSampleName);
			
			//Call changed
			control.change();			
		}		
	};

	self.updateAllFields = function() {
		//console.log("Update all fields");
		for (var i = 0; i < self.countRows(); i++) {			
			self.updateFields(i);	
		};	
	};
	
	self.configureUpdateFields = function () {
		
		var $TissueTypeSelectors =	self.getTissueTypeSelectors();			
		var $TissueSourceSelectors = self.getTissueSourceSelectors();			
		var $TissueSourceNumberSelectors = self.getTissueSourceNumberSelectors();
		var $SampleNameSelectors = self.getSampleNameSelectors();
		
		//console.log($TissueTypeSelectors);
		
		//Go through all selectors and bind an update.
		
		//.bind with namespace needs jQuery1.7.1 or later.
		$TissueTypeSelectors.on('change.icgc', function() {
			//console.log("c1");
			self.updateAllFields();
		});
		
		$TissueSourceSelectors.on('change.icgc',function() {
			//console.log("c2");
			self.updateAllFields();
		});
		
		$TissueSourceNumberSelectors.on('change.icgc',function() {
			//console.log("c3");
			self.updateAllFields();
		});
		
		$SampleNameSelectors.attr("readonly",true);		
	};


	self.thereAreTissueSamplesWithIDs = function() {
			//Go through each row
	var result = false;
		var $sampleNameSelectors = self.getSampleNameSelectors();
		//console.log($sampleNameSelectors);
		$sampleNameSelectors.each(function(i) {
	   if( jQuery(this).val() !== "") {
	  	result = true;
	  	//Stop iterating 
	  	return false;
	   }
	  });		
		return result;
	};
	
	self.setup = function() {
		
		//Go through each row and add a listener to each tissue type source selector and asource selector number.
		
		//Go through each row	 
		self.configureUpdateFields();			
	 		
		//Add configuration step to add button
		jQuery(
			'.button_search'
		).bind(
			'click.icgc',
		function() {
			self.configureUpdateFields();
		}
		);
		
		//Configure display logic on page
		var $tissueSamplesTakenControlSelectorFn = function() { return jQuery("#icgc_t").parent().parent().find("select"); };
		var $reasonNoSamplesTakenControlSelectorFn = function() { return jQuery("#icgc_r").parent().parent().find("select"); };
		var $reasonNoSamplesTakenDisplaySelectorFn = function() { return jQuery("#icgc_r").parent().parent(); };
		
		
		var $reasonNoSamplesTakenOtherControlSelectorFn = function() { return jQuery("#icgc_ro").parent().parent().find("textarea"); };
		var $reasonNoSamplesTakenOtherDisplaySelectorFn = function() { return jQuery("#icgc_ro").parent().parent(); };
		
		var $tableSelectorFn = function() { return ICGC.TC.getTableSelector(); };
				
		ICGC.DOM.initAndChange($tissueSamplesTakenControlSelectorFn(), 
     		function(s) {
 				return function() {
 					ICGC.DOM.enableControlForValue(s, "No", $reasonNoSamplesTakenControlSelectorFn(), true);
 					ICGC.DOM.greyChildControlsWhenNotValue(s, "No", $reasonNoSamplesTakenDisplaySelectorFn()); 
 					//Try and remove any rows
 					ICGC.DOM.alterControlForValue(s, "No", 
 							function() { jQuery(".remove_button").each(
 										function() { jQuery(this).click(); }
 									);
 					}, function() {});
 					ICGC.DOM.showControlForValue(s, "Yes", $tableSelectorFn(), false); 				
 				};
       },"taken");
		
		ICGC.DOM.initAndChange($reasonNoSamplesTakenControlSelectorFn(), 
     		function(s) {
 				return function() {
          ICGC.DOM.enableControlForValue(s, "Other (Specify)", $reasonNoSamplesTakenOtherControlSelectorFn(), true);
         	ICGC.DOM.greyChildControlsWhenNotValue(s, "Other (Specify)", $reasonNoSamplesTakenOtherDisplaySelectorFn()); 
         };
       },"reason");
		
		 
    //If there are any tissue samples on the page then set the control to Yes (if it is not already Yes)
		var $tissueSamplesTakenControlSelector = $tissueSamplesTakenControlSelectorFn();
		if ($tissueSamplesTakenControlSelector.val() !== true && self.thereAreTissueSamplesWithIDs()) {
			$tissueSamplesTakenControlSelector.val("Yes");
			$tissueSamplesTakenControlSelector.change();
			//Lock it.
			$tissueSamplesTakenControlSelector.attr("disabled","disabled");
		};		
	};
	
	return self;

}();

//

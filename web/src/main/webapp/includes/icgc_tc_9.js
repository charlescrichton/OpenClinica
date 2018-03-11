//ICGC Library
//Version 1.0
//TC Form
//See associated icgcSpec.js for Jasmine-1.3.1.js definition.

/* For TC form copy the following into the right item text of the first question:
 <script type="text/javascript" src="includes/icgc_bc_7.js"></script>
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
    var noop = function() {};
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
            };
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
            };
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
            };
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
            };
        });
    };


    self.greyChildControlsWhenNotValue = function(triggerControl, triggerValue, targetControl) {

        self.alterControlForValue(triggerControl, triggerValue, function() {
            targetControl.children().attr("style", "");
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
            return "XXX";
        }

        // Matches and is same length OCCAMS/AZ/000 is 13 characters
        if (studySubjectID.length === 13 && studySubjectID.search(studySubjectIdRegExp) === 0) {
            return studySubjectID.replace("OCCAMS", "OC");
        }

        return "";
    };

    return self;

}();

// Define TC sub-namespace
ICGC.TC = function() {

    var self = {};

    self.getSelf = function() { return self; }

    //Get the study subject from the page.	
    // The path to the study subject on the page is: /html/body/div[4]/table/tbody/tr/td[2]/h1/span
    // jQuery("#centralContainer > table > tbody tr td[2] h1 span").
    self.getStudySubject = function() {
        return jQuery.trim(jQuery("#centralContainer")
            .find("table")
            .find("tbody")
            .find("tr")
            .find("td:eq(1)")
            .find("h1")
            .find("span")
            .text()
        );
    };

    /* ### Tissue samples have the format:

    OC/{***site code***}/{***study subject number***}/{**Tissue type**}/{***Tissue source***}{***Tissue source number***}

    E.g. OC/XX/000/E/N1 

    Regexp: `^OC/[A-Z]{2,}/[0-9]{3}/(E|S|L|R)/(N|B|T|G|L|M)[0-9]{1,}$`

    - Site code is a two letter identifier.
    - Study subject number id a 3 digit number
    - Tissue types have the following meaning

    | Tissue preparation  code | Meaning          |
    | ------------------------ | ---------------- |
    | `E`                      | Endoscopy Tissue |
    | `S`                      | Surgical Tissue  |
    | `L`                      | Laparoscopy      |
    | `R`                      | EMR              |

    - Tissue sources are one of the following

    | Tissue source code | Meaning           |
    | ------------------ | ----------------- |
    | `N`                | Normal Oesophagus |
    | `B`                | Barrett's         |
    | `T`                | Tumour            |
    | `G`                | Normal Gastric    |
    | `L`                | Lymph-node        |
    | `M`                | Metastasis        |

    - Tissue sample number is a discriminator which can be used to discriminate between multiple samples of the same type, (usually) taken on the same day.
    */
    self.ComposeSampleName = function(studySubjectIdentifier, tissueType, tissueSource, sourceNumber) {
        var shortenedName = ICGC.STUDYSUBJECT.ShortenStudySubject(studySubjectIdentifier);
        if (shortenedName === "") return "";
        if (tissueType === null || tissueType === "") return "";
        if (tissueSource === null || tissueSource === "") return "";
        if (sourceNumber === null || sourceNumber === "") return "";
        return shortenedName + "/" + tissueType + "/" + tissueSource + sourceNumber;
    };

    //If the table is hidden this can return null.
    self.getTableSelector = function() {

        var $tag = jQuery("#icgc_d");
        //console.log("$tag = ");
        //console.log($tag);

        var $table = $tag.closest('table');
        //console.log($table);
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
    //var pos_DC = 0; //TC_DateOfCollection_1 I
    var pos_TT = 1; //TC_TissueType_5 S
    var pos_TS = 2; //TC_TissueSource_5 S
    var pos_TSN = 3; //TC_TissueSourceNumber_4 S
    // var pos_DBTN = 4; //Distance between tumour and normal
    var pos_SN = 5; //TC_SampleName_3 I
    //var pos_DS = 6; //TC_DateSampleSentToCambridge_1 I

    // This gets an entire column
    self.getInputSelectors = function(pos) {
        var $inputs = self.getAllTableRowsSelector().find('td:eq(' + pos + ')').find('input[type!="hidden"]');
        // console.log("Input Selector: "+pos);
        // console.log($inputs.get());
        return $inputs;
    };

    self.getInputSelector = function(pos, index) {
        var $inputs = self.getTableRowsSelector(index).find('td:eq(' + pos + ')').find('input[type!="hidden"]');
        // console.log("Input Selector: "+pos);
        // console.log($inputs.get());
        return $inputs;
    };

    // This gets an enire column
    self.getSelectSelectors = function(pos) {
        var $inputs = self.getAllTableRowsSelector().find('td:eq(' + pos + ')').find('select');
        // console.log("Select Selector: "+pos);
        // console.log($inputs.get());
        return $inputs;
    };

    self.getSelectSelector = function(pos, index) {
        var $inputs = self.getTableRowsSelector(index).find('td:eq(' + pos + ')').find('select');
        // console.log("Select Selector: "+pos);
        // console.log($inputs.get());
        return $inputs;
    };

    // Specific cell selectors

    self.getTissueTypeSelector = function(index) {
        return self.getSelectSelector(pos_TT, index);
    };

    self.getTissueSourceSelector = function(index) {
        return self.getSelectSelector(pos_TS, index);
    };

    self.getTissueSourceNumberSelector = function(index) {
        return self.getInputSelector(pos_TSN, index);
    };

    // Column selectors
    self.getTissueTypeSelectors = function() {
        return self.getSelectSelectors(pos_TT);
    };

    self.getTissueSourceSelectors = function() {
        return self.getSelectSelectors(pos_TS);
    };

    self.getTissueSourceNumberSelectors = function() {
        return self.getInputSelectors(pos_TSN);
    };

    self.getSampleNameSelector = function(index) {
        return self.getInputSelector(pos_SN, index);
    };

    self.getSampleNameSelectors = function() {
        return self.getInputSelectors(pos_SN);
    };

    // Needed so we can sensibly increment the tissue source number
    self.countRows = function() {
        return self.getAllTableRowsSelector().get().length;
    };

    /* Find the rows where there are identical Tissue Type and Tissue Source
     */
    self.getRowsWhereTheTissueTypeAppearsArray = function(tissueTypeToSelect, tissueSourceToSelect) {

        //We specially return an empty array when provided row information is not complete
        if (tissueTypeToSelect === null 
        	|| tissueTypeToSelect === "" 
        	|| tissueSourceToSelect === null 
        	|| tissueSourceToSelect==="") {
            return [];
        }

        var rows = [];

        var tissueTypeSelectors = self.getTissueTypeSelectors();
        var tissueSourceSelectors = self.getTissueSourceSelectors();

        var ttarray = [];
        for (var i = 0; i < tissueTypeSelectors.length; i++) {
        	ttarray = ttarray.concat(self.getTissueTypeSelector(i).val());
        }

         var tsarray = [];
        for (var i = 0; i < tissueSourceSelectors.length; i++) {
        	tsarray = tsarray.concat(self.getTissueSourceSelector(i).val());
        }

        for (var i = 0; i < tissueTypeSelectors.length; i++) {
        	var tissueType = self.getTissueTypeSelector(i).val();
        	var tissueSource = self.getTissueSourceSelector(i).val();
            if (tissueType === tissueTypeToSelect &&
                tissueSource === tissueSourceToSelect
            ) {
                rows = rows.concat(i);
            }
        }

        return rows;
    }

    self.positionOfValueInArray = function(array, value) {

        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i] === value) {
                return i;
            }
        }

        //Value for no position
        return -1;
    }

    self.bestNewValue = function(array, currentBest) {
    	var foundCurrentBest = false;
    	
		//var sourceNumber = self.getTissueSourceNumberSelector(index).val();
		var maxSourceNumber = 1;

         for (var j = array.length - 1; j >= 0; j--) {
        	var sourceNumber = self.getTissueSourceNumberSelector(array[j]).val();

        	if (sourceNumber !== null && sourceNumber !== "") {
				if (sourceNumber === ""+currentBest) {
					foundCurrentBest = true;
				}
        		maxSourceNumber = Math.max(maxSourceNumber,sourceNumber);
    		}
        }

        if (foundCurrentBest) {
        	return maxSourceNumber + 1;
        } else {
        	return currentBest;
        }
    }

    self.updateFields = function(index) {
        return self.updateFieldsImpl(index, true);
    }

    self.updateSourceNumberFields = function(index) {
        return self.updateFieldsImpl(index, false);
    }

    self.updateFieldsImpl = function(index, allowSourceNumberUpdate) {

        //console.log("update fields("+index+")");

        //Get old values

        var studySubjectIdentifier = self.getStudySubject();
        var tissueType = self.getTissueTypeSelector(index).val();
        var tissueSource = self.getTissueSourceSelector(index).val();
        var sourceNumber = self.getTissueSourceNumberSelector(index).val();
        var oldSampleName = self.getSampleNameSelector(index).val();

        //If there is a tissuetype, a tissue source, but no tissue source number calculate one.
        if (allowSourceNumberUpdate && 
        	(tissueType.trim() !== "" 
        	&& tissueSource.trim() !== "" 
        	&& sourceNumber.trim() === "")) {
            
        	//Work out which rows have matching tissue type and tissue source
            var rowsWhereTheTissueSampleAppearsArray 
        		= self.getRowsWhereTheTissueTypeAppearsArray(tissueType,tissueSource);

            //Work out the ideal value
            var calculatedTissueSampleSourceNumber 
            	= self.positionOfValueInArray(rowsWhereTheTissueSampleAppearsArray, index) + 1;

            //Check that this number is not currently in use - if it is then pick a higher number
            if (calculatedTissueSampleSourceNumber !== 0) {
            	calculatedTissueSampleSourceNumber 
            		= self.bestNewValue(
            			rowsWhereTheTissueSampleAppearsArray, 
            			calculatedTissueSampleSourceNumber);
            } else {
            	//We know there are no others - pick 1.
            	calculatedTissueSampleSourceNumber = 1;
            }

            //Push the value into the cell
            var tissueSourceNumberSelector = self.getTissueSourceNumberSelector(index);
            tissueSourceNumberSelector.val("" + calculatedTissueSampleSourceNumber);
            tissueSourceNumberSelector.change();
            sourceNumber = tissueSourceNumberSelector.val();
        }

        //Calculate new value
        var newSampleName = self.ComposeSampleName(studySubjectIdentifier, tissueType, tissueSource, sourceNumber);

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
        //console.log("Update all fields: "+rowCount);
        for (var i = 0; i < self.countRows(); i++) {
            self.updateFields(i);
        };
    };

    self.updateAllSourceNumberFields = function() {
        var rowCount = self.countRows();
        //console.log("Update all fields: "+rowCount);
        for (var i = 0; i < self.countRows(); i++) {
            self.updateSourceNumberFields(i);
        };
    };

    self.configureUpdateFields = function() {

        var $TissueTypeSelectors = self.getTissueTypeSelectors();
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

        $TissueSourceSelectors.on('change.icgc', function() {
            //console.log("c2");
            self.updateAllFields();
        });

        $TissueSourceNumberSelectors.on('change.icgc', function() {
            //console.log("c3");
            self.updateAllSourceNumberFields();
        });


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
        newBtn.on("click", function(event) {
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

        //Add listeners
        self.configureUpdateFields();

        // Add configuration step to add button
        jQuery('.button_search').bind('click.icgc', function() {
            self.configureUpdateFields();
        });


        //Configure display logic on page
        var $tissueSamplesTakenControlSelectorFn = function() { return jQuery("#icgc_t").parent().parent().find("select"); };
        var $reasonNoSamplesTakenControlSelectorFn = function() { return jQuery("#icgc_r").parent().parent().find("select"); };
        var $reasonNoSamplesTakenDisplaySelectorFn = function() { return jQuery("#icgc_r").parent().parent(); };


        var $reasonNoSamplesTakenOtherControlSelectorFn = function() { return jQuery("#icgc_ro").parent().parent().find("textarea"); };
        var $reasonNoSamplesTakenOtherDisplaySelectorFn = function() { return jQuery("#icgc_ro").parent().parent(); };

        //Enable and disable fields when yes/no is toggled.
        var $tableSelectorFn = function() {
            return ICGC.TC.getTableSelector();
        };

        ICGC.DOM.initAndChange($tissueSamplesTakenControlSelectorFn(),
            function(s) {
                return function() {
                    ICGC.DOM.enableControlForValue(s, "No", $reasonNoSamplesTakenControlSelectorFn(), true);
                    ICGC.DOM.greyChildControlsWhenNotValue(s, "No", $reasonNoSamplesTakenDisplaySelectorFn());
                    //Try and remove any rows
                    ICGC.DOM.alterControlForValue(s, "No",
                        function() {
                            jQuery(".remove_button").each(
                                function() { jQuery(this).click(); }
                            );
                        },
                        function() {});
                    ICGC.DOM.showControlForValue(s, "Yes", $tableSelectorFn(), false);
                };
            }, "taken");

        ICGC.DOM.initAndChange($reasonNoSamplesTakenControlSelectorFn(),
            function(s) {
                return function() {
                    ICGC.DOM.enableControlForValue(s, "Other (Specify)", $reasonNoSamplesTakenOtherControlSelectorFn(), true);
                    ICGC.DOM.greyChildControlsWhenNotValue(s, "Other (Specify)", $reasonNoSamplesTakenOtherDisplaySelectorFn());
                };
            }, "reason");

        //Update all
        self.updateAllFields();
        self.handleAddButton();
    };

    //Update all
    self.updateAllFields();
    self.handleAddButton();

    return self;

}();

//This runs the code on the page
jQuery(document).ready(function($) {
    ICGC.TC.setup();
});
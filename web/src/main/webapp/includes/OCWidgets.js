//OpenClinica Widgets
//version 0.0.6
//06.01.2015
var HPO_BUILD_NUMBER_VALUE = "OBO-Edit 2.3";



jQuery.noConflict();
jQuery.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});



function createOptionString(select,narrowTerms){

	var options = ""; 
	for (var i = 0; i < narrowTerms.length; i++) {
	    var name = "";
	    for(var level = 0 ; level < narrowTerms[i].depthLevel * 2; level++){
	    	name = name + "&nbsp;"
	    }
	    var option = "<option value='"+ narrowTerms[i].id +"'>" + name + narrowTerms[i].name + "</option>";
	    select.append(jQuery(option));	    
	}   		
}



jQuery.fn.basicOntologyTable = function(){
    var $self = jQuery(this);	
    
    
    var spinnerDiv = jQuery("div.OCSpinner")
    if(spinnerDiv.length == 0 )
    	spinnerDiv = jQuery("<div class='OCSpinner ui-widget-overlay ui-front'><img style='position: fixed;top: 50%;left: 50%;' src='includes/OCSpinner.gif'></img></div>").appendTo(document.body);
     
	//column mapping for each column in table
    var columns =  create_columnsMapping();  
    var study = jQuery.trim(jQuery("td b:contains('Study:')").parent("td").next("td").text());
    var diseasegroup =		jQuery("span[data-id='DiseaseGroup']").parent().parent().find('select').val(); 
    var subGroup	 =		jQuery("span[data-id='DiseaseSubgroup']").parent().parent().find('select').val();
    var specificDisorder =	jQuery("span[data-id='SpecificDisease']").parent().parent().find('select').val();
    
    if(diseasegroup == undefined) {// It is in edit mode, and the value is in a Text-Input
    	diseasegroup = jQuery("span[data-id='DiseaseGroup']").parent().parent().find('input').val(); 
    }
    if(subGroup == undefined){
        subGroup = jQuery("span[data-id='DiseaseSubgroup']").parent().parent().find('input').val();
    }
    if(specificDisorder == undefined){
        specificDisorder =	jQuery("span[data-id='SpecificDisease']").parent().parent().find('input').val();
    }
        
    var inputParams = {
		predefinedTermsSourceName : "DiseaseOntology.json",    	    
		diseaseGroup: 		diseasegroup, 
	    subGroup: 			subGroup,
	    specificDisorder:	specificDisorder,	    	
	    dataSourceName : "hp.obo",
	    loadNarrowTermsTreeFlat : "true"
    }; 
            
    
    //hide the last row which contains the Add button & the empty row
    $self.find("tr:last").prev().hide();    
    $self.find("tr:last").hide();
    
    //get all phenotypes related to this study 
	var phenotypes = undefined;						
	jQuery.ajax({
	    type: 'GET',
	    url: "/OCService/OntologyService/PredefinedTermsService",
	    dataType: 'json',
	    success: function(term) { 				
			phenotypes = term;
			applyBasicPhenotype($self,phenotypes,columns,study,spinnerDiv);
		},
		beforeSend: function() {
			spinnerDiv.show();
		},
		complete: function(){
			spinnerDiv.hide();
		},
	    data: inputParams,
	    async:true
	});	
	
    
   };

   
 function applyBasicPhenotype($self,phenotypes,columns,study,spinnerDiv){
	 
	 //If it is in NEW mode OR Edit mode with an empty row
	 if($self.find("tr").length == 4){
		 //when there is no Phenotype for this disease, just remove the default empty row
		 if(phenotypes == null || phenotypes == undefined || phenotypes.length == 0){
			var addBtn = $self.find("button:contains('Add')");
			addBtn.hide();		 
			 
			var deleteBtn = $self.find("button[stype='remove']");
			//if this button is disable (it happens when we have one empty row in edit mode)
			//then remove all the row
			if(deleteBtn.attr('disabled') == "disabled"){
				var lastRow = $self.find("tr:last").prev().prev();
				lastRow.remove();
			}else{
				deleteBtn.trigger('click');
			}
			return false
		 }
	 }else{
		 //if it is in EDIT mode & there are a number of rows
		//when there is no Phenotype for this disease, just remove the default empty row
		 if(phenotypes == null || phenotypes == undefined || phenotypes.length == 0){
			var addBtn = $self.find("button:contains('Add')");
			addBtn.hide();		 
			 
			var lastRow = $self.find("tr:last").prev().prev();
			lastRow.remove();
			return false
		 }
	 }
	 
	 var btn = $self.find("button:contains('Add')");
	    
	    // If this is the first time we're loading this page
	    //then load all the phenotypes for the specific disease from the external file   
	    //4 because [header + default row created by OC + blank row created by OC + row which has Add button (it is hidden now)]
	    if($self.find("tr").length == 4 && phenotypes != null)
	    {	
	    	spinnerDiv.show();
	    	for(var index = 0; index < phenotypes.length ; index++){
	     		var lastRow = null;    		
	    		
	    		if(index == 0){					
					//for the first time, the first row is located before those two blank rows
					lastRow = $self.find("tr:last").prev().prev();
					var header = $self.find("tr:first");
					hide_Headers(header,columns);
					add_newHeadersColumn(header); 					
				}else{					
				    btn.trigger('click');
				    //after the first row is updated, the next rows are added at the end of the list
				    lastRow = $self.find("tr:last").prev().prev();
				}
	    		hide_fields_inRow(lastRow,columns);
	    		updateRow(lastRow, columns,phenotypes,index);    		
	    	}  
	    	spinnerDiv.hide();
	    	    	
	    }// Otherwise, the table is already in place for us, and we just need to make these columns read-only
	    else{
	    
	    	var header = $self.find("thead tr:first");
	    	hide_Headers(header,columns);
			add_newHeadersColumn(header);					

			
			var allRows = $self.find("tbody tr");
			jQuery.each(allRows, function(index, initialRow){
				
				//as OC adds a blank<tr> + a <tr> for button
				//so we have to ignore those two
				if(index >= allRows.length-2)
					return false;
				
				var row = jQuery(initialRow);
				
	    		hide_fields_inRow(row,columns);

			
	    		row.find(columns.PHENOTYPE_DESCRIPTION).after("<select></select>");
	    		    		
	    		//fill this select based on the Phenotype Index it has
	    		if(phenotypes != undefined){ 
	    			//add options to select
	    			var options = createOptionString(row.find(columns.PHENOTYPE_DESCRIPTION_SELECT),phenotypes[index].narrowTerms);
			   		row.find(columns.PHENOTYPE_DESCRIPTION_SELECT).val(row.find(columns.PHENOTYPE_ID_UNHIDDEN).val())
	    		}else{
	    			//in case if the previous service couldn't load the phenotype
	    			//then at least add the single one that we have
	    			var option = jQuery('<option>' + row.find(columns.PHENOTYPE_DESCRIPTION).val() + '</option>').val(row.find(columns.PHENOTYPE_ID_UNHIDDEN).val());
	        		row.find(columns.PHENOTYPE_DESCRIPTION_SELECT).append(option);
	    		}
	    		    		
	    		
				//update phenoype id input & phenotype desc input when this select is changed
	    		row.find(columns.PHENOTYPE_DESCRIPTION_SELECT).change(function(){
	    			row.find(columns.PHENOTYPE_ID).val(jQuery(this).val());
	    			row.find(columns.PHENOTYPE_DESCRIPTION).val(jQuery.trim(jQuery(this).find("option:selected").text()));
	    			row.find(columns.PHENOTYPE_DESCRIPTION_HIDDEN).val(jQuery.trim(jQuery(this).find("option:selected").text()));
			    });
				
	    		
	    			
	 			row.find(columns.PHENOTYPE_ID).prop('readonly', 'readonly');
					
			 
				row.find("td:last").after("<td class='aka_padding_norm aka_cellBorders'><p class='modifiers'><p></td>");
				
				var laterality =  row.find(columns.LATERALITY_UNHIDDEN).val();			
				var onset =  row.find(columns.ONSET_UNHIDDEN).val();
				var progression =  row.find(columns.PROGRESSION_UNHIDDEN).val();
				var severity = row.find(columns.SEVERITY_UNHIDDEN).val();
				var spatialpattern = row.find(columns.SPATIAL_PATTERN_UNHIDDEN).val();
				
				var ul = jQuery('<ul></ul>');
				
				if(laterality!=null && laterality.length>0)
					ul.append('<li><strong>Laterality:</strong> '+laterality+'</li>');
				
				if(onset!=null  && onset.length>0)
					ul.append('<li><strong>Onset:</strong> '+onset+'</li>');
				
				if(progression!=null  && progression.length>0)
					ul.append('<li><strong>Progression:</strong> '+progression+'</li>');
				
				if(severity!=null  && severity.length>0)
					ul.append('<li><strong>Severity:</strong> '+severity+'</li>');
				
				if(spatialpattern!=null && spatialpattern.length>0)
					ul.append('<li><strong>Spatial Pattern:</strong> '+spatialpattern+'</li>');
				
				 
				row.find(columns.MODIFERS_TEXT).html(ul);	
				//add edit button next to the last column item
				var editBtn = jQuery("<td class='aka_padding_norm aka_cellBorders'><button>Edit</button></td>");
				editBtn.on('click',function(event){	
						var currentRow = jQuery(this).parent('tr');
						show_basicPhenotypeForm(currentRow,columns);
						//the following lines MUST be added, otherwise OC refreshes the page!!!
						event.preventDefault();
						return false;
					});							
				editBtn.insertAfter(row.find("td:last"));			
			   });
	    	}
	 
 }
   
   
jQuery.fn.additionalOntologyTable = function(){
	    var $self = jQuery(this);
	    
		//column mapping for each column in table
	    var columns =  create_columnsMapping();
	    
	    //hide the original button and add a new button
	    var btn = $self.find("button:contains('Add')");
	    btn.hide();	    
	    
	    	    
	    var newBtn = jQuery("<button id='newAdditionalOntologyBtn'>Add</button>").insertAfter(btn);
	    newBtn.on("click",function(event){
	    	//add a new row
	    	btn.trigger("click");
	    	var lastRow = $self.find("tr:last").prev().prev();
	    	hide_fields_inRow_additional(lastRow,columns);					
			add_newRow_additional(lastRow, columns);   
			//the following lines MUST be added, otherwise OC refreshes the page!!!
			event.preventDefault();
			return false;
	    });
	    
	    
	    // If this is the first time we're loading this page
	    //then load all the phenotypes for the specific disease from the external file   
	    //4 because [header + default row created by OC + blank row created by OC + row which has Add button (it is hidden now)]
	    
	    //if it is in a NEW FORM
	    var testRow = $self.find("tbody tr:first");
	    if($self.find("tr").length == 4 && testRow.find(columns.PHENOTYPE_DESCRIPTION).val().length == 0){
	    	 
			var firstRow = $self.find("tbody tr:first");		
			firstRow.find(columns.PHENOTYPE_PRESENT+"[value=unknown]").prop('checked', true);
			//firstRow.find(columns.PHENOTYPE_PRESENT).val("Unknown")
			
			var header  = $self.find("tr:first");
			hide_Headers(header,columns);
			add_newHeadersColumn(header);
			var lastRow = $self.find("tr:last").prev().prev();
			hide_fields_inRow_additional(lastRow,columns);					
			add_newRow_additional(lastRow, columns);
	 	    
	    }else{
	    	//IN EDIT MODE
			var cache = [];
	    	var header = $self.find("thead tr:first");
			hide_Headers(header,columns);
			add_newHeadersColumn(header);					

			
			var allRows = $self.find("tbody tr");
			jQuery.each(allRows, function(index, initialRow){
				
				//as OC adds a blank<tr> + a <tr> for button
				//so we have to ignore those two
				if(index >= allRows.length-2)
					return false;
				
				var row = jQuery(initialRow);
				
	    		hide_fields_inRow_additional(row,columns);

	    		row.find(columns.PHENOTYPE_DESCRIPTION).autocomplete({
	    			minLength : 3,
	    			source : function(request, response) {
	    				var term = request.term;	    
	    				if (term in cache) {
	    					response(cache[term]);
	    					return;
	    				}
	    				request["dataSourceName"] = "hp.obo";	
	    				jQuery.getJSON("/OCService/OntologyService/LookupService", request, function(data, status, xhr) {
	    					cache[term] = data;
	    					response(data);
	    				});
	    			},
	    			select : function(event, ui){				
	    				row.find(columns.PHENOTYPE_ID).val(ui.item.id);
	    			},
	    			change: function(event,ui){
    					//if no item is selected and invalid value is entered
    					if(ui.item == null){
    						jQuery(this).val("");
	    					row.find(columns.PHENOTYPE_ID).val("");
	    					
	    					row.find(columns.LATERALITY).val("");
	    					row.find(columns.ONSET).val("");
	    					row.find(columns.PROGRESSION).val("");
	    					row.find(columns.SEVERITY).val("");
	    					row.find(columns.SPATIAL_PATTERN).val("");
	    					
	    					row.find(columns.MODIFERS_TEXT).html("");
    					}
	    			}

	    		});
	    		
	 			row.find(columns.PHENOTYPE_ID).prop('readonly', 'readonly');
					
			 
				row.find("td:last").after("<td class='aka_padding_norm aka_cellBorders'><p class='modifiers'><p></td>");
				var laterality =  row.find(columns.LATERALITY_UNHIDDEN).val();
				var onset =  row.find(columns.ONSET_UNHIDDEN).val();
				var progression =  row.find(columns.PROGRESSION_UNHIDDEN).val();
				var severity = row.find(columns.SEVERITY_UNHIDDEN).val();
				var spatialpattern = row.find(columns.SPATIAL_PATTERN_UNHIDDEN).val();
				var ul = jQuery('<ul></ul>');
				
				if(laterality!=null && laterality.length>0)
					ul.append('<li><strong>Laterality:</strong> '+laterality+'</li>');
				
				if(onset!=null && onset.length>0)
					ul.append('<li><strong>Onset:</strong> '+onset+'</li>');
				
				if(progression!=null && progression.length>0)
					ul.append('<li><strong>Progression:</strong> '+progression+'</li>');
				
				if(severity!=null && severity.length>0)
					ul.append('<li><strong>Severity:</strong> '+severity+'</li>');
				
				if(spatialpattern!=null && spatialpattern.length>0)
					ul.append('<li><strong>Spatial Pattern:</strong> '+spatialpattern+'</li>');
				
				 
				row.find(columns.MODIFERS_TEXT).html(ul);	
				
				
							
				//add edit button next to the last column item
				row.find("td:last").after("<td class='aka_padding_norm aka_cellBorders' style='text-align: center;'></td>");
				
				var editBtn = jQuery("<button id='btnEdit'>Edit</button>");
				editBtn.bind('click',function(event){		
						//the row in which the Edit button is clicked
						var currentRow = jQuery(this).parent('td').parent('tr');	
						show_additionalPhenotypeForm(currentRow,columns);
						//the following lines MUST be added, otherwise OC refreshes the page!!!
						event.preventDefault();
						return false;
					});			
				row.find("td:last").append(editBtn);	
				
			   });	    	
	    }
	     	    
};
	   
	   
function create_columnsMapping(){
	var columns =  {};
	columns.PHENOTYPE_DESCRIPTION = "td:first-child input[type!='hidden']";
	columns.PHENOTYPE_DESCRIPTION_HIDDEN = "td:first-child input[type='hidden']";
	
	columns.PHENOTYPE_DESCRIPTION_SELECT = "td:first-child select";    
    columns.PHENOTYPE_DESCRIPTION_TD = "td:first-child";
	columns.PHENOTYPE_DESCRIPTION_HEADER = "th:first-child";	
		
	columns.PHENOTYPE_ID = "td:nth-child(2) input";
	columns.PHENOTYPE_ID_UNHIDDEN = "td:nth-child(2) input[type!=hidden]";
	columns.PHENOTYPE_ID_TD = "td:nth-child(2)";
	columns.PHENOTYPE_ID_HEADER = "th:nth-child(2)";
	
	columns.HPO_BUILD_NUMBER   = "td:nth-child(3) input";
	columns.HPO_BUILD_NUMBER_TD = "td:nth-child(3)";
	columns.HPO_BUILD_NUMBER_HEADER = "th:nth-child(3)";
		
	columns.PHENOTYPE_PRESENT_TD  = "td:nth-child(4)";
	
	//columns.PHENOTYPE_PRESENT  = "td:nth-child(4) input[type='radio']";	
	columns.PHENOTYPE_PRESENT  = "td:nth-child(4) :radio";
	
	
	columns.PHENOTYPE_PRESENT_HEADER = "th:nth-child(4)";	
		
	
	columns.LATERALITY  = "td:nth-child(5) select";
	columns.LATERALITY_UNHIDDEN =  "td:nth-child(5) select[type!=hidden]"
	columns.LATERALITY_TD  = "td:nth-child(5)";
	columns.LATERALITY_HEADER = "th:nth-child(5)";	
			

	columns.ONSET    = "td:nth-child(6) select";
	columns.ONSET_UNHIDDEN    = "td:nth-child(6) select[type!=hidden]";	
	columns.ONSET_TD = "td:nth-child(6)"; 
	columns.ONSET_HEADER = "th:nth-child(6)";

		
	columns.PROGRESSION    = "td:nth-child(7) select";
	columns.PROGRESSION_UNHIDDEN      = "td:nth-child(7) select[type!=hidden]";	
	columns.PROGRESSION_TD = "td:nth-child(7)";
	columns.PROGRESSION_HEADER = "th:nth-child(7)";
    

	columns.SEVERITY    = "td:nth-child(8) select";
	columns.SEVERITY_UNHIDDEN    = "td:nth-child(8) select[type!=hidden]";	
	columns.SEVERITY_TD = "td:nth-child(8)";
	columns.SEVERITY_HEADER = "th:nth-child(8)";
	
    
	columns.SPATIAL_PATTERN = "td:nth-child(9) select";
	columns.SPATIAL_PATTERN_UNHIDDEN    = "td:nth-child(9) select[type!=hidden]";	
	columns.SPATIAL_PATTERN_TD = "td:nth-child(9)";
	columns.SPATIAL_PATTERN_HEADER = "th:nth-child(9)";
	
    		
	columns.OC_DELETE = "td:nth-child(10) :button";
	columns.OC_DELETE_TD = "td:nth-child(10)";
	columns.OC_DELETE_HEADER = "th:nth-child(10)";
    
		
	//dynamically added column
    columns.MODIFERS_TEXT = "td p.modifiers";
    
    return columns;
}

function hide_Headers(header,columns){
	header.find(columns.HPO_BUILD_NUMBER_HEADER).hide();					 
	header.find(columns.LATERALITY_HEADER).hide();
	header.find(columns.ONSET_HEADER).hide();
	header.find(columns.PROGRESSION_HEADER).hide();
	header.find(columns.SEVERITY_HEADER).hide();
	header.find(columns.SPATIAL_PATTERN_HEADER).hide();	
	header.find(columns.OC_DELETE_HEADER).hide();	
}

function hide_fields_inRow(lastRow,columns){
	lastRow.find(columns.HPO_BUILD_NUMBER_TD).hide();	    		
	lastRow.find(columns.PHENOTYPE_DESCRIPTION).hide();	
	lastRow.find(columns.PHENOTYPE_DESCRIPTION_HIDDEN).hide();	
	
	lastRow.find(columns.LATERALITY_TD).hide();
	lastRow.find(columns.ONSET_TD).hide();
	lastRow.find(columns.PROGRESSION_TD).hide();
	lastRow.find(columns.SEVERITY_TD).hide();
	lastRow.find(columns.SPATIAL_PATTERN_TD).hide();
	lastRow.find(columns.OC_DELETE_TD).hide();
}


function hide_fields_inRow_additional(lastRow,columns){
	lastRow.find(columns.HPO_BUILD_NUMBER_TD).hide();	    		
	lastRow.find(columns.LATERALITY_TD).hide();
	lastRow.find(columns.ONSET_TD).hide();
	lastRow.find(columns.PROGRESSION_TD).hide();
	lastRow.find(columns.SEVERITY_TD).hide();
	lastRow.find(columns.SPATIAL_PATTERN_TD).hide();
	lastRow.find(columns.OC_DELETE_TD).hide();
}



function add_newHeadersColumn(header){
	//add action column
	header.find("th:last").after("<th class='aka_headerBackground aka_padding_large aka_cellBorders'>Modifiers</th>");
	header.find("th:last").after("<th class='aka_headerBackground aka_padding_large aka_cellBorders'>Actions</th>");
}



function updateRow(lastRow, columns,phenotypes,index){
	
	var desElement = lastRow.find(columns.PHENOTYPE_DESCRIPTION) 
	desElement.val(phenotypes[index].name);
	desElement.after("<select></select>");
	var selectElement = lastRow.find(columns.PHENOTYPE_DESCRIPTION_SELECT);
	//add FIX value for HPO_BUILD_NUMBER
	lastRow.find(columns.HPO_BUILD_NUMBER).val(HPO_BUILD_NUMBER_VALUE);
	
	//update phenoype id input & phenotype desc input when this select is changed
	selectElement.change(function(){
		lastRow.find(columns.PHENOTYPE_ID).val(jQuery(this).val());
		desElement.val(jQuery.trim(jQuery(this).find("option:selected").text()));
    });
	
	var options = createOptionString(selectElement,phenotypes[index].narrowTerms);  		
	selectElement.find("option[value='"+phenotypes[index].id+"']").attr('selected', 'selected');	
    lastRow.find(columns.PHENOTYPE_ID).val(phenotypes[index].id).prop('readonly', 'readonly');
	  
	lastRow.find(columns.PHENOTYPE_PRESENT+"[value=unknown]").prop('checked', true);
 			
	//add modifier text column
	lastRow.find("td:last").after("<td class='aka_padding_norm aka_cellBorders'><p class='modifiers'><p></td>");
	
	//add edit button next to the last column item
	var td = jQuery("<td class='aka_padding_norm aka_cellBorders'></td>");

	var editBtn = jQuery("<button id='btnEdit"+index+"'>Edit</button>");
	editBtn.bind('click',function(event){		
			//the row in which the Edit button is clicked
			var currentRow = jQuery(this).closest('tr');
			show_basicPhenotypeForm(currentRow,columns);
			//the following lines MUST be added, otherwise OC refreshes the page!!!
			event.preventDefault();
			return false;
		});	
	td.append(editBtn);
	td.insertAfter(lastRow.find("td:last"));
}



function add_newRow_additional(lastRow, columns){
	
	//update phenoype id input & phenotype desc input when this select is changed
//	lastRow.find(columns.PHENOTYPE_DESCRIPTION).change(function(){
//		lastRow.find(columns.PHENOTYPE_ID).val(jQuery(this).val());
//		lastRow.find(columns.PHENOTYPE_DESCRIPTION).val(jQuery(this).find("option:selected").text());
//    });
	var cache = [];
	//add FIX value for HPO_BUILD_NUMBER
	lastRow.find(columns.HPO_BUILD_NUMBER).val(HPO_BUILD_NUMBER_VALUE);
	
	
	lastRow.find(columns.PHENOTYPE_DESCRIPTION).autocomplete({
		minLength : 3,
		source : function(request, response) {
			var term = request.term;
			if (term in cache) {
				response(cache[term]);
				return;
			}
			request["dataSourceName"] = "hp.obo";	
			jQuery.getJSON("/OCService/OntologyService/LookupService", request, function(data, status, xhr) {
				cache[term] = data;
				response(data);
			});
		},
		select : function(event, ui){				
			lastRow.find(columns.PHENOTYPE_ID).val(ui.item.id);
		}

		,
		change: function(event,ui){
			//if no item is selected and invalid value is entered
			if(ui.item == null){
				jQuery(this).val("");
				lastRow.find(columns.PHENOTYPE_ID).val("");
				
				lastRow.find(columns.LATERALITY).val("");
				lastRow.find(columns.ONSET).val("");
				lastRow.find(columns.PROGRESSION).val("");
				lastRow.find(columns.SEVERITY).val("");
				lastRow.find(columns.SPATIAL_PATTERN).val("");
				
				row.find(columns.MODIFERS_TEXT).html("");
			}
		}
		
	});
	
		
	  		
 	lastRow.find(columns.PHENOTYPE_ID).prop('readonly', 'readonly');
 	
	lastRow.find(columns.PHENOTYPE_PRESENT+"[value=unknown]").prop('checked', true);
	//lastRow.find(columns.PHENOTYPE_PRESENT).val("Unknown")

	
			
	//add modifier text column
	lastRow.find("td:last").after("<td class='aka_padding_norm aka_cellBorders'><p class='modifiers'><p></td>");
	
	//add edit button next to the last column item
	lastRow.find("td:last").after("<td class='aka_padding_norm aka_cellBorders' style='text-align: center;'></td>");
	
	var editBtn = jQuery("<button  id='btnEdit'>Edit</button>");
	editBtn.bind('click',function(event){		
			//the row in which the Edit button is clicked
			var currentRow = jQuery(this).parent('td').parent('tr');
			show_additionalPhenotypeForm(currentRow,columns);
			//the following lines MUST be added, otherwise OC refreshes the page!!!
			event.preventDefault();
			return false;
		});			
	lastRow.find("td:last").append(editBtn);

	//add remove button beside edit button
	var removeBtn = jQuery("<button id='btnRemove'>Delete</button>");	
	removeBtn.bind('click',function(event){		
		//the row in which the Remove button is clicked
		var currentRow = jQuery(this).parent('td').parent('tr');
		currentRow.remove();
		//the following lines MUST be added, otherwise OC refreshes the page!!!
		event.preventDefault();
		return false;
	});
	lastRow.find("td:last").append(removeBtn);
}




function show_basicPhenotypeForm(currentRow,columns){

	//parent of a dialogue should be 'position:relative'
	//as this dialogue is added on the fly
	//it is a bug in jQuery UI 1.10.3
	//http://stackoverflow.com/questions/17212650/jquery-ui-dialog-jumps-to-the-bottom-of-page-in-chrome
	jQuery(document.body).css("position","relative");

	var $dialog = jQuery("<div></div>").load("dialogues/basicPhenotype.html",function (responseText, textStatus, req) {
        		
		if (textStatus == "error") {
            alert("Can not load dialogue content!");
            return;
          }
        
		var dialogElements = jQuery(this);		
		//get the values of the current row in the table
		var phenotype_id =  currentRow.find(columns.PHENOTYPE_ID_UNHIDDEN).val();
		
		var laterality =  currentRow.find(columns.LATERALITY_UNHIDDEN).val();
		var onset =  currentRow.find(columns.ONSET_UNHIDDEN).val();
		var progression =  currentRow.find(columns.PROGRESSION_UNHIDDEN).val();
		var severity = currentRow.find(columns.SEVERITY_UNHIDDEN).val();
		var spatialpattern = currentRow.find(columns.SPATIAL_PATTERN_UNHIDDEN).val();
		
		var present = currentRow.find(columns.PHENOTYPE_PRESENT+":checked").val();	
		
		var options = currentRow.find(columns.PHENOTYPE_DESCRIPTION_SELECT+" option");
		for (var i = 0; i < options.length; i++) {			
			jQuery(this).find("select.allNarrowPhenotypeNamesFlat").append(jQuery(options[i]).clone());
		}
		
		var selectedOption = currentRow.find(columns.PHENOTYPE_DESCRIPTION_SELECT).find(":selected").val();
		
		
		jQuery(this).find("select.allNarrowPhenotypeNamesFlat").val(selectedOption);
		jQuery(this).find("select.phenotypepresent").val(present);		    
		jQuery(this).find("input.phenotypeId").val(phenotype_id);			
		jQuery(this).find("select.laterality").val(laterality);
		jQuery(this).find("select.onset").val(onset);
		jQuery(this).find("select.progression").val(progression);
		jQuery(this).find("select.severity").val(severity);
		jQuery(this).find("select.spatialpattern").val(spatialpattern);
	});
	
							
	
	$dialog.dialog({
           autoOpen: false,
           modal: true,
           width: 380,
           title: "Basic Phenotype",
           draggable:true,
           open: function(event, ui) {
				
           },
           close:function(event,ui){
        	   
	        	 //return body postion into ints original status
	       		jQuery(document.body).css("position","static");
	       		
				var dialogue =jQuery(this);
				//remove the dialogue from the DOM, otherwise it remains there!
				$dialog.empty().remove();
           },
           buttons: {
               "Save": function() {								
					var dialogue = jQuery(this);
					
					//get all the values from the modal
					var phenotypeName = jQuery.trim(dialogue.find("select#phenotypeName").find(":selected").text());
					var phenotype_id  = dialogue.find("input#phenotypeId").val();		
					
					var phenotypepresent = dialogue.find("select#phenotypepresent").val();
					var laterality = dialogue.find("select#laterality").val();
					var onset	   = dialogue.find("select#onset").val();
					var progression= dialogue.find("select#progression").val();
					var severity		= dialogue.find("select#severity").val();
					var spatialpattern= dialogue.find("select#spatialpattern").val();
					var present = dialogue.find(".phenotypepresent").val();
						
					currentRow.find(columns.PHENOTYPE_PRESENT+"[value="+present+"]").prop('checked', true);
					currentRow.find(columns.PHENOTYPE_ID).val(phenotype_id);									
					currentRow.find(columns.PHENOTYPE_DESCRIPTION).val(phenotypeName);
					currentRow.find(columns.PHENOTYPE_DESCRIPTION_SELECT).val(phenotype_id);

					if(jQuery.trim(laterality).length == 0)
						laterality = null;
					
					if(jQuery.trim(onset).length == 0)
						onset = null;
					
					if(jQuery.trim(progression).length == 0)
						progression = null;
					
					if(jQuery.trim(severity).length == 0)
						severity = null;
					
					if(jQuery.trim(spatialpattern).length == 0)
						spatialpattern = null;
										
					currentRow.find(columns.LATERALITY).val(laterality);									
					currentRow.find(columns.ONSET).val(onset);
					currentRow.find(columns.PROGRESSION).val(progression);
					currentRow.find(columns.SEVERITY).val(severity);
					currentRow.find(columns.SPATIAL_PATTERN).val(spatialpattern);	
					
					var ul = jQuery('<ul></ul>');
					
					if(laterality!=null)
						ul.append('<li><strong>Laterality:</strong> '+laterality+'</li>');
					
					if(onset!=null)
						ul.append('<li><strong>Onset:</strong> '+onset+'</li>');
					
					if(progression!=null)
						ul.append('<li><strong>Progression:</strong> '+progression+'</li>');
					
					if(severity!=null)
						ul.append('<li><strong>Severity:</strong> '+severity+'</li>');
					
					if(spatialpattern!=null)
						ul.append('<li><strong>Spatial Pattern:</strong> '+spatialpattern+'</li>');
					
					currentRow.find(columns.MODIFERS_TEXT).html(ul);					
					
					jQuery( this ).dialog( "close" );
					
					//remove the dialogue from the DOM, otherwise it remains there!
					$dialog.empty().remove();
                   },
               Cancel: function() {
                	   jQuery( this ).dialog( "close" );
                	
                	//remove the dialogue from the DOM, otherwise it remains there!
                	$dialog.empty().remove();
               }
             }
       });
	
	$dialog.dialog('open');	
}



function show_additionalPhenotypeForm(currentRow,columns){
	
	
	//parent of a dialogue should be 'position:relative'
	//as this dialogue is added on the fly
	jQuery(document.body).css("position","relative");

        
	//load the content of the dialogue from an external HTML file
	//and pass the values of the current row to it
	var $dialog = jQuery("<div></div>").load("dialogues/additionalPhenotype.html",function(){	
		var dialogElements = jQuery(this);
		
		//get the values of the current row in the table
		var phenotype_id =  currentRow.find(columns.PHENOTYPE_ID_UNHIDDEN).val();
		var phenotype_name =  currentRow.find(columns.PHENOTYPE_DESCRIPTION).val();
		

		var laterality =  currentRow.find(columns.LATERALITY_UNHIDDEN).val();
		var onset =  currentRow.find(columns.ONSET_UNHIDDEN).val();
		var progression =  currentRow.find(columns.PROGRESSION_UNHIDDEN).val();
		var severity = currentRow.find(columns.SEVERITY_UNHIDDEN).val();
		var spatialpattern = currentRow.find(columns.SPATIAL_PATTERN_UNHIDDEN).val();
		
		var present = currentRow.find(columns.PHENOTYPE_PRESENT+":checked").val();
		

		jQuery(this).find("input#phenotypeName").val(phenotype_name)
		//this change() should be called as broader and narrower will be loaded 
		//if and only if PhenotypeId is changed in the dialogue
		jQuery(this).find("input.phenotypeId").val(phenotype_id).change();		  	    
		jQuery(this).find("select.phenotypepresent").val(present);		
		jQuery(this).find("select.laterality").val(laterality);
		jQuery(this).find("select.onset").val(onset);
		jQuery(this).find("select.progression").val(progression);
		jQuery(this).find("select.severity").val(severity);
		jQuery(this).find("select.spatialpattern").val(spatialpattern);
		
	});
							
	
	$dialog.dialog({
           autoOpen: false,
           modal: true,
           width: 380,
           title: "Additional Phenotype",
           open: function(event, ui) {
				
           },
           close:function(event,ui){
        	   
        	   //return body postion into ints original status
	       		jQuery(document.body).css("position","static");
	       		
				var dialogue = jQuery(this);
				//remove the dialogue from the DOM, otherwise it remains there!
				$dialog.empty().remove();
           },
           buttons: {        	   
               "Save": function() {								
					var dialogue = jQuery(this);
					
					//get all the values from the modal
					var phenotypeName = jQuery.trim(dialogue.find("input#phenotypeName").val());
					var phenotype_id  = dialogue.find("input#phenotypeId").val();		
					
					
					var phenotypepresent = dialogue.find("select#phenotypepresent").val();
					var laterality = dialogue.find("select#laterality").val();
					var onset	   = dialogue.find("select#onset").val();
					var progression= dialogue.find("select#progression").val();
					var severity		= dialogue.find("select#severity").val();
					var spatialpattern= dialogue.find("select#spatialpattern").val();
					var present = dialogue.find(".phenotypepresent").val();
						

					currentRow.find(columns.PHENOTYPE_PRESENT+"[value="+present+"]").prop('checked', true);
					currentRow.find(columns.PHENOTYPE_ID).val(phenotype_id);									
					currentRow.find(columns.PHENOTYPE_DESCRIPTION).val(phenotypeName);

					
					
					if(jQuery.trim(laterality).length == 0)
						laterality = null;
					
					if(jQuery.trim(onset).length == 0)
						onset = null;
					
					if(jQuery.trim(progression).length == 0)
						progression = null;
					
					if(jQuery.trim(severity).length == 0)
						severity = null;
					
					if(jQuery.trim(spatialpattern).length == 0)
						spatialpattern = null;
					
					
					currentRow.find(columns.LATERALITY).val(laterality);									
					currentRow.find(columns.ONSET).val(onset);
					currentRow.find(columns.PROGRESSION).val(progression);
					currentRow.find(columns.SEVERITY).val(severity);
					currentRow.find(columns.SPATIAL_PATTERN).val(spatialpattern);	
					
					var ul = jQuery('<ul></ul>');
					
					if(laterality!=null)
						ul.append('<li><strong>Laterality:</strong> '+laterality+'</li>');
					
					if(onset!=null)
						ul.append('<li><strong>Onset:</strong> '+onset+'</li>');
					
					if(progression!=null)
						ul.append('<li><strong>Progression:</strong> '+progression+'</li>');
					
					if(severity!=null)
						ul.append('<li><strong>Severity:</strong> '+severity+'</li>');
					
					if(spatialpattern!=null)
						ul.append('<li><strong>Spatial Pattern:</strong> '+spatialpattern+'</li>');
					
					currentRow.find(columns.MODIFERS_TEXT).html(ul);					
					
					if(jQuery.trim(phenotypeName).length == 0){
						
						currentRow.find(columns.LATERALITY).val("");									
						currentRow.find(columns.ONSET).val("");
						currentRow.find(columns.PROGRESSION).val("");
						currentRow.find(columns.SEVERITY).val("");
						currentRow.find(columns.SPATIAL_PATTERN).val("");	
						
						currentRow.find(columns.MODIFERS_TEXT).html("");
					}
					jQuery( this ).dialog( "close" );
					
					//remove the dialogue from the DOM, otherwise it remains there!
					$dialog.empty().remove();
                   },
               Cancel: function() {
                	   jQuery( this ).dialog( "close" );
                	
                	//remove the dialogue from the DOM, otherwise it remains there!
                	$dialog.empty().remove();
               }
             }
       });
	$dialog.dialog('open');	
}




jQuery.fn.ontologyInput = function(){
	var cache = {};
	jQueryy(this).css("width", "80%");
	jQuery(this).autocomplete({
		minLength : 3,
		source : function(request, response) {
			var term = request.term;
			if (term in cache) {
				response(cache[term]);
				return;
			}
			request["dataSourceName"] = "hp.obo";	
			jQuery.getJSON("/OCService/OntologyService/LookupService", request, function(data, status, xhr) {
				cache[term] = data;
				response(data);
			});
		},
		select : function(event, ui){				

			var nameInput = jQuery(this).closest("tr").find("td:nth-child(1) input");
			
			nameInput.change(); //Tell openclinica that the value changed
			
			var idInput = jQuery(this).closest("tr").find("td:nth-child(2) input");
			idInput.val(ui.item.id);
		        idInput.removeProp('readonly');
			idInput.change();  //Tell openclinica that the value changed
		        idInput.prop('readonly', 'readonly');
			
			var checkboxInput = jQuery(jQuery(this).closest("tr").find("td:nth-child(3) input")[2]);
			checkboxInput.prop("checked", true);
			checkboxInput.change(); //Tell openclinica that the value changed
			checkboxInput.fadeOut(200).fadeIn(200);		
			
		}

	});
	jQuery(this).on("change keyup", function() {
		jQuery(jQuery(this).closest("tr").find("td:nth-child(3) input")[2]).prop("checked", true);
		jQuery(jQuery(this).closest("tr").find("td:nth-child(3) input")[2]).change();			
		jQuery(jQuery(this).closest("tr").find("td:nth-child(3) input")[2]).fadeOut(200).fadeIn(200);	
	}); 
		jQuery(this).closest("tr").find("td:nth-child(2) input").prop('readonly', 'readonly');
        //jQuery(this).closest("tr").find("td:nth-child(2) input").addClass("disabled");

};

jQuery.fn.selectOther = function(){
	jQuery(this).append('<option value="other">Other (please select)</option>');
	jQuery(this).after('<div><br/><label>Please select: &nbsp;&nbsp;</label><input name="other"/></div>');
	jQuery(this).on("change keyup", function(){
		if(jQuery(this).val() == "other"){
			jQuery(this).next().show();
		}else{
			jQuery(this).next().hide();
		}
	});
	jQuery(this).trigger("change");
	
};

jQuery.fn.emailInput = function(){
	jQuery(this).on("change keyup", function() {
		if(validateEmail(this.value))
		{
			jQuery(this).addClass("correct");
			jQuery(this).removeClass("incorrect");
		}else{
			jQuery(this).addClass("incorrect");
			jQuery(this).removeClass("correct");
		}
	});
};
jQuery.fn.NHSNumInput = function(){
	jQuery(this).on("change keyup", function() {
		if(validateNhsNumber(this.value))
		{
			jQuery(this).addClass("correct");
			jQuery(this).removeClass("incorrect");
		}else{
			jQuery(this).addClass("incorrect");
			jQuery(this).removeClass("correct");
		}
	});
};

jQuery.fn.numInput = function(){
	jQuery(this).on("change keyup", function() {
		if(validateNumber(this.value))
		{
			jQuery(this).addClass("correct");
			jQuery(this).removeClass("incorrect");
		}else{
			jQuery(this).addClass("incorrect");
			jQuery(this).removeClass("correct");
		}
	});
};
jQuery.fn.regExInput = function(regex){
	jQuery(this).on("change keyup", function() {
		if(validateRegEx(this.value, regex))
		{
			jQuery(this).addClass("correct");
			jQuery(this).removeClass("incorrect");
		}else{
			jQuery(this).addClass("incorrect");
			jQuery(this).removeClass("correct");
		}
	});
};

jQuery.fn.phoneNumInput = function(){
	jQuery(this).on("change keyup", function() {
		if(validatePhoneNumber(this.value))
		{
			jQuery(this).addClass("correct");
			jQuery(this).removeClass("incorrect");
		}else{
			jQuery(this).addClass("incorrect");
			jQuery(this).removeClass("correct");
		}
	});
};




jQuery.fn.valueLookup = function (serviceURL) {
	var input = jQuery(this);

	//hide the input text for the lookup field
	input.hide();

	//add a <select> element after the hidden text box
	var select = jQuery("<select></select>").addClass('consentSelect').insertAfter(input);

	
	
	
 	//Load consentForms by calling consentForm lookup service
	//and add options
	jQuery.ajax({
		url: serviceURL,
		async: false,
		success: function (data) {
			var res = data.result;
			//add options into the select element
			var select = input.next("select.consentSelect");
			for (var i = 0; i < res.length; i++) {
				var option = select.append(jQuery("<option></option>")
				         .attr("value",res[i].name)
				         .text(res[i].name));
				
				//input has value,so it is in EDIT mode
				if(jQuery.trim(input.val()).toLowerCase() == jQuery.trim(res[i].name).toLowerCase()){					
					select.val(res[i].name);
				}
			}
		},
		dataType: 'json'
	});


	//add onChange event and
	//fill the hidden input when this element changed
	select.on("change", function () {
  		var val = jQuery(this).val();
  		jQuery(this).prev("input").val(val);
	});
		
	
	//trigger it to fill it for the first time after loading and
	//load the text field with the first option of the select
	select.trigger("change");
        return select;
};



jQuery.fn.diseaseSelector = function($subDiseaseInput, $specificDiseaseInput){
	var $this = this;
	
	//it is in EDIT mode
	if($this.val() != undefined && $this.val() != null && $this.val().length > 0){
		

		$this.attr('readonly', true);		
		$subDiseaseInput.attr('readonly', true);
		$specificDiseaseInput.attr('readonly', true);
		//Please do not, disable these. As in IE, it causes problem in saving OC pages!!!
		//$this.attr('disabled', 'disabled');
		//$subDiseaseInput.attr('disabled', 'disabled');
		//$specificDiseaseInput.attr('disabled', 'disabled');
 
 		
		//@Eligibility
		//If we are in clincial Tab, load the Eligibity version
		if ( jQuery("span[data-id='Hidden_1_ParticipantType']").length > 0){
			
			//Load all the diseases and then apply the eligibility
			//we have to load the diseases to find the eligibility version and date for creating the Link
			 jQuery.ajax({
					url:            '/OCService/lookupServices/DiseaseLookup',
					async :         false,
					success :       function(data){
					    Apply_Eligibility('edit',$this.val(),$subDiseaseInput.val(),$specificDiseaseInput.val(),data.result);
					},
						dataType :      'json'					    						
				}); 
		}
				
		jQuery.each(jQuery(".aka_group_header:contains('Basic Phenotyping')"), function(index, hd) {
		    //if it is IE, we need to have a short delay before loading the list
		    //as it seems that OC adds two empty rows in IE9,11 and then removes one after a random number of seconds
			var msie = window.navigator.userAgent.indexOf("MSIE ");
			if (msie > 0){  
				setTimeout(function(){ jQuery(hd).next("table").basicOntologyTable(); }, 2000);
			}else{
				jQuery(hd).next("table").basicOntologyTable();
			}
		});
	
		jQuery.each(jQuery(".aka_group_header:contains('Additional Phenotyping')"), function(index, hd) {
		    //if it is IE, we need to have a short delay before loading the list
		    //as it seems that OC adds two empty rows in IE9,11 and then removes one after a random number of seconds
		    var msie = window.navigator.userAgent.indexOf("MSIE ");
		    if (msie > 0){  
		    	setTimeout(function(){ jQuery(hd).next("table").additionalOntologyTable(); }, 2000);
		    }else{
		    	jQuery(hd).next("table").additionalOntologyTable();
		    }
		});
		
		return;
	}
		
    
    hideSection("PT_21", "FH_10");
    hideRepeatingGroup("Basic Phenotyping");
    hideRepeatingGroup("Additional Phenotyping");
    var $diseaseGroupSelect = swapInputForSelect($this, []);
    var $subDiseaseSelect = swapInputForSelect($subDiseaseInput, [{val: "", desc: "Please select..."}]);
    var $specificDiseaseSelect = swapInputForSelect($specificDiseaseInput, [{val: "", desc: "Please select..."}])
    var diseaseGroupList = [];

    // add the 'select this disease' button
    $diseaseButton = jQuery("<input type=\"button\" class=\"button_xlong\" value=\"Select this disease and continue...\"/>").hide();
    $specificDiseaseSelect.closest("table").after($diseaseButton);
    
    //hide save and show it after they have clicked on 'Select this disease and continue' button
    jQuery("input[value='Save']").hide();
    jQuery.ajax({
	url:            '/OCService/lookupServices/DiseaseLookup',
	async :         false,
	success :       function(data){
	    var res = data.result;
	    jQuery.each(res, function(index, dis) {
		diseaseGroupList.push({val: dis.name, desc: dis.name});
	    });
	    populateSelect($diseaseGroupSelect, diseaseGroupList);
	    $diseaseGroupSelect.on("change keyup", function(val){
			var selectedDiseaseGroup = $diseaseGroupSelect.val();
			$this.val(selectedDiseaseGroup);
			if(selectedDiseaseGroup == "")
			{
			    populateSelect($subDiseaseSelect,[]);
			    populateSelect($specificDiseaseSelect,[]);
	
			    // set the bottom two drop-downs to read-only
			    $subDiseaseSelect.attr('readonly', true);
			    $specificDiseaseSelect.attr('readonly', true);
			    $diseaseButton.hide();
			}
			else{
			    var subgroupList = [];
			    var selectedDisease = jQuery.grep(res, function(e){ return e.name == selectedDiseaseGroup; })[0];
			    jQuery.each(selectedDisease.subGroups, function(idx, sg){
			    	subgroupList.push({val: sg.name, desc: sg.name});
			    });
			    populateSelect($subDiseaseSelect, subgroupList); 
			    
			    $subDiseaseSelect.attr('readonly', false);
			    $specificDiseaseSelect.attr('readonly', true);
			    $diseaseButton.hide();
			    
			}
		
	    });
	    
	    $subDiseaseSelect.on("change keyup", function(val){
			var selectedDiseaseGroup = $diseaseGroupSelect.val();
			var selectedSubGroup = $subDiseaseSelect.val();
			$subDiseaseInput.val(selectedSubGroup);
	
			if(selectedSubGroup == "")
			{
			    populateSelect($specificDiseaseSelect,[]);
			    // set the bottom drop-downs to read-only
			    $specificDiseaseSelect.attr('readonly', true);
			    $diseaseButton.hide();
			}
			else{
			    var specificDiseaseList = [];
			    var selectedDisease = jQuery.grep(res, function(e){ return e.name == selectedDiseaseGroup; })[0];
			    var selectedSubgroup = jQuery.grep(selectedDisease.subGroups, function(e){ return e.name == selectedSubGroup; })[0];
			    jQuery.each(selectedSubgroup.specificDisorders, function(idx, sd){
			    	specificDiseaseList.push({val: sd.name, desc: sd.name});
			    });
			    populateSelect($specificDiseaseSelect, specificDiseaseList);
			    
			    $specificDiseaseSelect.attr('readonly', false);
			    $diseaseButton.hide();
			    
			}
		
	    });
	    $specificDiseaseSelect.on("change keyup", function(val){
			var selectedSpecificDisease = $specificDiseaseSelect.val();
			
			
			//@Eligibility
			//If we are in clincial Tab, load the Eligibity version
			if ( jQuery("span[data-id='Hidden_1_ParticipantType']").length > 0){				
				var selectedDiseaseGroup = $diseaseGroupSelect.val();
				var selectedSubGroup = $subDiseaseSelect.val();
				var selectedSpecificDisease = $specificDiseaseSelect.val();				
				Apply_Eligibility('new',selectedDiseaseGroup,selectedSubGroup,selectedSpecificDisease,res);
			}
			
			
			$specificDiseaseInput.val(selectedSpecificDisease);
			if(selectedSpecificDisease == ""){
			    $diseaseButton.hide();
			}
			else{
			    $diseaseButton.show();
			}    
		
	    });
	    $diseaseButton.on("click keyup", function(){
		    //show save button
		    jQuery("input[value='Save']").show();
			$diseaseGroupSelect.attr('readonly', true);
			$subDiseaseSelect.attr('readonly', true);
			$specificDiseaseSelect.attr('readonly', true);
			$diseaseGroupSelect.attr('disabled', 'disabled');
			$subDiseaseSelect.attr('disabled', 'disabled');
			$specificDiseaseSelect.attr('disabled', 'disabled');
			
			$diseaseButton.hide();
			showSection("PT_21", "FH_10");
			showRepeatingGroup("Basic Phenotyping");
			showRepeatingGroup("Additional Phenotyping");
			
			jQuery.each(jQuery(".aka_group_header:contains('Basic Phenotyping')"), function(index, hd) {
			    //if it is IE, we need to have a short delay before loading the list
			    //as it seems that OC adds two empty rows in IE9,11 and then removes one after a random number of seconds
			var msie = window.navigator.userAgent.indexOf("MSIE ");
			    if (msie > 0){  
			    	setTimeout(function(){ jQuery(hd).next("table").basicOntologyTable(); }, 2000);
			    }else{
			    	jQuery(hd).next("table").basicOntologyTable();
			    }
			});
		
			jQuery.each(jQuery(".aka_group_header:contains('Additional Phenotyping')"), function(index, hd) {
			    //if it is IE, we need to have a short delay before loading the list
			    //as it seems that OC adds two empty rows in IE9,11 and then removes one after a random number of seconds
			    var msie = window.navigator.userAgent.indexOf("MSIE ");
			    if (msie > 0){  
			    	setTimeout(function(){ jQuery(hd).next("table").additionalOntologyTable(); }, 2000);
			    }else{
			    	jQuery(hd).next("table").additionalOntologyTable();
			    }
			});
	
	    });
	    
	    $diseaseGroupSelect.trigger("change");
	},
	dataType :      'json'
    });
    
    
}

function Apply_Eligibility(mode,selectedDiseaseGroup,selectedSubGroup,selectedSpecificDisease,allDiseases){
	
	//@Eligibility, hide Eligibility verson input
	jQuery("[data-id='PB_8']").closest('td.table_cell_left').hide();
	
	
	var eligibityVersionInput= jQuery("[data-id='PB_8']").closest('table').find('input:text');
	var eligibityRadioText	 = jQuery("[data-id='PB_9']").closest('table').find("td:Contains('Eligible')");
	
	//give it more space to display the text
	eligibityRadioText.removeClass('aka_text_block');
	
    
	//find the eligibility version from the selected DiseaseGroup/Disease/Disorder
	var Disease_JSON_Object = jQuery.grep(allDiseases, function(e){ return e.name == selectedDiseaseGroup; })[0];
	var Subgroup_JSON_Object = jQuery.grep(Disease_JSON_Object.subGroups, function(e){ return e.name == selectedSubGroup; })[0];
	var Disorder_JSON_Object = jQuery.grep(Subgroup_JSON_Object.specificDisorders, function(e){ return e.name == selectedSpecificDisease; })[0];

	var eligibilityDate	= Disorder_JSON_Object.eligibilityQuestion.date;
	var eligibilityVersion = Disorder_JSON_Object.eligibilityQuestion.version;
	var elogibilityId = Disorder_JSON_Object.id;

	//If it is in NEW mode
	if(mode == 'new'){
		//Set the version value into the input 
		jQuery("[data-id='PB_8']").closest('table').find('input:text').val(eligibilityVersion);		
		//unchecked all radio
		jQuery("[data-id='PB_9']").closest('table').find('input:radio').prop('checked', false);
	}
	
	//create the link
	var eligibilityLink =  "/OCService/eligibility/default.html";// + elogibilityId + "-v" + eligibilityVersion + ".html"; 

	//create the display text
	var displayStr = "";
	
	//Check if the link exists :)
	jQuery.ajax({
	    url:eligibilityLink,
	    type:'HEAD',
	    async : false,
	    error: function()
	    {
	    	displayStr = "Is the patient eligible for this study?<br>" +
	    	"<a class='eligibilityLink' onclick=\" alert('Eligibility criteria is not available!');return false;\" href='"+ eligibilityLink +"'>Click here</a> to read the eligibility criteria (last updated " + eligibilityDate  + ")";
	    	
	    },
	    success: function()
	    {
	    	displayStr = "Is the patient eligible for this study?<br>" +
	    	"<a class='eligibilityLink' target='_blank' href='"+ eligibilityLink +"'>Click here</a> to read the eligibility criteria (last updated " + eligibilityDate  + ")";
	    	
	    }
	});
	
	
	//set the text to the radio button text
	eligibityRadioText.html(displayStr);
}


function swapInputForSelect($textInput, values){
    $textInput.hide();
    var $selector = jQuery("<select></select>").insertAfter($textInput);
    populateSelect($selector, values);
    return $selector;

}

function populateSelect($selector, values){
    $selector.empty();
    $selector.append("<option value=\"\">Please select...</option>");
    jQuery.each(values, function(index, value){
	$selector.append("<option value=\"" + value.val + "\">" + value.desc + "</option>");
    });
}

jQuery.fn.sectionHider = function (sectionDefns){
     // 'this' is a question identifier, which points to a radio button 
     // 'sectionDefns' is an array of sections, each defined as a start question identifier, and a last section identifier
     // The array should contain the same number of section definitions as there are radio buttons.
     var $radios = this.parent().parent().find("input:radio");
     $radios.on("change", function () {
	 var radioIdx = $radios.index($radios.parent().find("input:checked"));

	     jQuery.each(sectionDefns, function(index, sect){
		 hideSection(sect[0], sect[1]);
	     });
	 
	 if(radioIdx != -1)
	 {
	     showSection(sectionDefns[radioIdx][0], sectionDefns[radioIdx][1]);
	 }

     });   
    $radios.trigger("change");
}

function getQuestionTr(questionID){
    return jQuery(jQuery.find("span[data-id=" + questionID + "]").first()).closest("tr").parent().closest("tr").parent().closest("tr");
}

function hideSection(startQuestion, endQuestion){
    firstTr = getQuestionTr(startQuestion);
    lastTr = getQuestionTr(endQuestion);
    
    var header = firstTr.prev().prev();
    while(header.hasClass("aka_stripes")){
	header.hide();
	header = header.prev();
    }

    firstTr.hide();
    firstTr.nextUntil(lastTr).hide();
    lastTr.hide();
}

function hideRepeatingGroup(rgName){
    var $header = getRGHeader(rgName);
    jQuery($header).hide();
    var $table = jQuery($header).next();
    jQuery($table).hide();
}

function showRepeatingGroup(rgName){
    var $header = getRGHeader(rgName);
    jQuery($header).show();
    var $table = jQuery($header).next();
    jQuery($table).show();
}

function getRGHeader(rgName){
    var $header = jQuery.find(".aka_group_header:contains('" + rgName + "')");
    return $header;

}

function showSection(startQuestion, endQuestion){
    firstTr = getQuestionTr(startQuestion);
    lastTr = getQuestionTr(endQuestion);

    var header = firstTr.prev().prev();
    while(header.hasClass("aka_stripes")){
	header.show();
	header = header.prev();
    }
    
    firstTr.show();
    firstTr.nextUntil(lastTr).show();
    lastTr.show();

}


function validateEmail(email)
{
	var pattern = /^[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+(\.[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+)*@[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-\+]+)*(\.[A-Za-z]{2,})$/;
	return pattern.test(email);
}

function validateRegEx(string, regex)
{
	var re = new RegExp(regex,"g");
	return re.test(string);
}

function validateNhsNumber(nhsNumber)
{
	res = false;
	jQuery.ajax({
		url:            '/OCService/NHSNumService?NHSNumVal=' + nhsNumber,
		async :         false,
		success :       function(data){
			res = data.result;
		},
		dataType :      'json'
	});
	return res;

}

function validatePhoneNumber(phoneNumber)
{
        var pattern = /^([0{1}]|4{2})[0-9]{10}$/;

        return pattern.test(phoneNumber);
}

function validateNumber(number,from,to)
{
        var pattern = /^[-+]{0,1}\d*\.{0,1}\d+$/;

        var passes=pattern.test(number);
        if(!passes){return passes;}
        
        // non-limited number
        if(from!==0 && !from && to!==0 && !to)
        {
                return passes;
        }
        
        var n=Number(number);
        return (n>=from && n<=to);
}

jQuery.fn.pdfButton = function (text){
    var $self = this;
   
    hideSection("Hidden_R_2", "Hidden_R_11");
    getQuestionTr("Hidden_Cons_2").hide();
    getQuestionTr("Hidden_PB_9").hide();
    getQuestionTr("Hidden_2_ParticipantType").hide();
        	
    var yesRadio = $self.find("input:radio[value='yes']");
    var noRadio = $self.find("input:radio[value='no']");
    
    yesRadio.hide();
    noRadio.hide();
    $self.hide();
    $self.prev('td').empty().text("Click here to download the sample linkage form"); 
    
    
    //Check if those hidden fields are filled AND then show or hide the button
    var familyId    = jQuery("span[data-id='Hidden_R_2']").parent().parent().find('input');
    var dateOfBirth = jQuery("span[data-id='Hidden_R_3']").parent().parent().find('input');
    var nhsNumber   = jQuery("span[data-id='Hidden_R_4']").parent().parent().find('input');
    var surname		= jQuery("span[data-id='Hidden_R_8']").parent().parent().find('input');
    var forenames	= jQuery("span[data-id='Hidden_R_10']").parent().parent().find('input');
    var gender 		= jQuery("span[data-id='Hidden_R_11']").parent().parent().find('select');
    var consentGiven_Yes = jQuery("span[data-id='Hidden_Cons_2']").parent().parent().find("input[value='yes']:checked");
    var eligibile_Yes = jQuery("span[data-id='Hidden_PB_9']").parent().parent().find("input[value='yes']:checked");
    var participantType_Proband	 = jQuery("span[data-id='Hidden_2_ParticipantType']").parent().parent().find("input[value='Proband']:checked");
    var participantType_Relative  = jQuery("span[data-id='Hidden_2_ParticipantType']").parent().parent().find("input[value='Relative']:checked");
    var hospitalNumber = jQuery("span[data-id='Hidden_R_7']").parent().parent().find('input');

    
    var participantId = jQuery.trim(jQuery("span#participant_id").text());
    
    var study_identifier = jQuery.trim(jQuery("span#registration_id").attr("study-identifier"));
    var clinicId = "Demo";
    if(jQuery.trim(study_identifier).length>0 &&  study_identifier.split("-").length > 0)
    	clinicId = study_identifier.split("-")[0];
    
    
    //validate NHS number
    var nhsNumberIsValid = false;
    if(nhsNumber.length > 0){
    	try {
    		nhsNumberIsValid =  validateNhsNumber(nhsNumber.val())
	    }
	    catch(err) {
	    	nhsNumberIsValid  = false;
	    }
    }    
    
    var linkParameters = "participantId="+encodeURIComponent(participantId) +"&" + 
    					 "nhsNumber="	+ encodeURIComponent(nhsNumber.val()) 	+ "&"+
    					 "surname="  	+ encodeURIComponent(surname.val())   	+ "&"+
    					 "forenames="	+ encodeURIComponent(forenames.val()) 	+ "&"+
    					 "dateOfBirth="	+ encodeURIComponent(fomratOCDateForPDF(dateOfBirth.val()))	+ "&"+
    					 "sampleType="  + encodeURIComponent("DNA Blood Germline") + "&"+
    					 "clinicId="	+ encodeURIComponent(clinicId) + "&" +
    					 "hospitalNumber="	+ encodeURIComponent(hospitalNumber.val()) + "&" +
    					 "diseaseType=" + encodeURIComponent("Rare Diseases") +"&"+
    					 "familyId=" 	+ encodeURIComponent(familyId.val());
    
    var pdfButton = jQuery("<button class='button_xlong' style='margin-left:55px;'>Download Sample Linkage Form</button>");
    pdfButton.on('click',function(event){	
    		
    		//check the printed button
    		yesRadio.prop('checked', true);
    		
    		if(jQuery.trim(participantId).length == 0){
    			alert("Can not find participantId !");
    			//the following lines MUST be added, otherwise OC refreshes the page!!!
    			event.preventDefault();
    			return false;
    		}
    	
			var location = "/OCService/pdfService/participant?" + linkParameters;
			
    		var win = window.open(location, '_blank');
    		win.focus();
    	  

			//the following lines MUST be added, otherwise OC refreshes the page!!!
			event.preventDefault();
			return false;
		});			
    $self.next('td').append(pdfButton);	
    
    
    
    
    if (familyId.length > 0 && familyId.val().length > 0 && 
    	dateOfBirth.length >0 && dateOfBirth.val().length > 0 &&
        nhsNumber.length > 0 && nhsNumber.val().length > 0 && nhsNumberIsValid == true && 
        surname.length >0 && surname.val().length > 0 &&
        forenames.length>0 && forenames.val().length > 0 &&
        gender.length>0 && gender.val().length > 0 &&
        consentGiven_Yes.length >0 && // consent given is YES.
        (
           (participantType_Proband.length > 0 && eligibile_Yes.length > 0) || //if is is Proband, then all eligibilities should be YES
	       (participantType_Proband.length <= 0)
        ) &&
        (participantType_Proband.length + participantType_Relative.length > 0) && //one of these should have been selected, Proband or Relative
        formatOCDate(dateOfBirth.val()) <= getToday() ) // Born Today or before Today! 
    	{
    		pdfButton.removeAttr("disabled");
    		pdfButton.val('Download Sample Linkage Form');
    	}
    else{
    		pdfButton.attr("disabled", true);
    		pdfButton.html('<strike>Download Sample Linkage Form</strike>');
    		//pdfButton.hide();
    		//getQuestionTr("SampleLinkagePrinted").hide(); 
    		
    		var errorMessage = "You cannot yet download the Sample Linkage Form <br>because the following fields are incomplete or incorrect:<br>";
    		if(familyId.val().length == 0)
    			errorMessage = errorMessage + "&#149; Family Id is blank! <br>";
    		if(dateOfBirth.val().length == 0)
    			errorMessage = errorMessage + "&#149; Date of birth is blank! <br>";
    		if(nhsNumber.val().length == 0)
    			errorMessage = errorMessage + "&#149; NHS Number is blank! <br>";
    		if(nhsNumber.val().length > 0 && nhsNumberIsValid == false)
    			errorMessage = errorMessage + "&#149; NHS Number is not valid! <br>";
    		
    		if(surname.val().length == 0)
    			errorMessage = errorMessage + "&#149; Surname is blank! <br>";
    		if(forenames.val().length == 0)
    			errorMessage = errorMessage + "&#149; Forenames is blank! <br>";
    		if(gender.val().length == 0)
    			errorMessage = errorMessage + "&#149; Gender is not selected! <br>";
    		if(consentGiven_Yes.length == 0)
    			errorMessage = errorMessage + "&#149; Consent is not given! <br>";
    		if(participantType_Proband.length > 0 && eligibile_Yes.length == 0)
    			errorMessage = errorMessage + "&#149; Not Eligible! <br>";
    		if(participantType_Proband.length + participantType_Relative.length == 0)
    			errorMessage = errorMessage + "&#149; Participant type is not specified! <br>";
            if (formatOCDate(dateOfBirth.val()) > getToday() ) 
    			errorMessage = errorMessage + "&#149; Invalid date of birth!<br>";
            
            pdfButton.after("<p style='margin-left:55px;color:red;font-weight: bold;'>"+ errorMessage +"</p>");    		   		     	     
    	}
    
}
function getToday(){
	var today = new Date();
	var date = today.getDate() + "";	
	if(date.length == 1)
		date = "0" + date;	
	
	var month = (today.getMonth()+1) + "";
	if(month.length == 1)
		month = "0" + month;
	
	return 	today.getFullYear() + "/" + month + "/" + date;
}

function fomratOCDateForPDF(ocDate){
	ocDate = ocDate.toLowerCase();
	ocDate = ocDate.replace(/-/g,'/');	//replace all - with /
	//replace Jan,Feb,Mar,... with 01,02,03,...
	ocDate = ocDate.replace('jan','01');
	ocDate = ocDate.replace('feb','02');
	ocDate = ocDate.replace('mar','03');
	ocDate = ocDate.replace('apr','04');
	ocDate = ocDate.replace('may','05');
	ocDate = ocDate.replace('jun','06');
	ocDate = ocDate.replace('jul','07');
	ocDate = ocDate.replace('aug','08');
	ocDate = ocDate.replace('sep','09');
	ocDate = ocDate.replace('oct','10');
	ocDate = ocDate.replace('nov','11');
	ocDate = ocDate.replace('dec','12');	
	//now we have sth like 01/02/2014 OR 1/2/2014 BUT we will make them all in a
	//unique format like 01/02/2014
	var parts = ocDate.split('/');
	//in any case if it can not split it into three parts
	if(parts.length != 3)
		return ocDate;
	var date  = parts[0];
	var month = parts[1];
	var year  = parts[2];

	if(date.length == 1)
	  date  = "0" + date;
	if(month.length == 1)
	  month = "0" + month; 	
	return 	date + "/" + month + "/" + year;
}
function formatOCDate(ocDate){
	ocDate = ocDate.toLowerCase();
	ocDate = ocDate.replace(/-/g,'/');	//replace all - with /
	//replace Jan,Feb,Mar,... with 01,02,03,...
	ocDate = ocDate.replace('jan','01');
	ocDate = ocDate.replace('feb','02');
	ocDate = ocDate.replace('mar','03');
	ocDate = ocDate.replace('apr','04');
	ocDate = ocDate.replace('may','05');
	ocDate = ocDate.replace('jun','06');
	ocDate = ocDate.replace('jul','07');
	ocDate = ocDate.replace('aug','08');
	ocDate = ocDate.replace('sep','09');
	ocDate = ocDate.replace('oct','10');
	ocDate = ocDate.replace('nov','11');
	ocDate = ocDate.replace('dec','12');	
	//now we have sth like 01/02/2014 OR 1/2/2014 BUT we will make them all in a
	//unique format like 01/02/2014
	var parts = ocDate.split('/');
	//in any case if it can not split it into three parts
	if(parts.length != 3)
		return ocDate;
	var date  = parts[0];
	var month = parts[1];
	var year  = parts[2];

	if(date.length == 1)
	  date  = "0" + date;
	if(month.length == 1)
	  month = "0" + month; 	
	return 	year + "/" + month + "/" + date;
}

jQuery(document).ready(function() {
    
	
    jQuery.each(jQuery("span[data-type=EMAIL]"), function(index, sp) {
    	jQuery(sp).parent().parent().find("input").emailInput();
    });
    jQuery.each(jQuery("span[data-type=PHONE]"), function(index, sp) {
    	jQuery(sp).parent().parent().find("input").phoneNumInput();
    });
    jQuery.each(jQuery("span[data-type=NHS_NUMBER]"), function(index, sp) {
    	jQuery(sp).parent().parent().find("input").NHSNumInput();
    });
    jQuery.each(jQuery("span[data-type=REGEX]"), function(index, sp) {
    	jQuery(sp).parent().parent().find("input").regExInput(jQuery(sp).data("regex"));
    });

    
    jQuery("span[data-id=ParticipantType]").sectionHider([["PB_2","PB_17"], ["REL_1","REL_4"]]);

    
    if(jQuery("span[data-id=DiseaseGroup]").length>0){
    	var diseaseInput = jQuery("span[data-id=DiseaseGroup]").parent().parent().find("input");
        var subDiseaseInput = jQuery("span[data-id=DiseaseSubgroup]").parent().parent().find("input");
        var specificDiseaseInput = jQuery("span[data-id=SpecificDisease]").parent().parent().find("input");
        
        diseaseInput.diseaseSelector(subDiseaseInput, specificDiseaseInput);	
    }

   
    jQuery.each(jQuery("td.aka_text_block:contains('Has the sample linkage form been printed?')"), function(index, hd) {
	jQuery(hd).next('td').pdfButton(hd);
    });
    
    
    
    jQuery.each(jQuery("span[data-id=Cons_3]"), function (index, sp) {
    	
    	var input = jQuery(sp).parent().parent().find("input");
    	//it is in EDIT mode
    	if(input.val().length > 0){
        	var consentSelect = jQuery(sp).parent().parent().find("input").valueLookup("/OCService/lookupServices/ConsentForm");
        	jQuery("span[data-id='Cons_3']").parent().parent().find('select').css("width", "300px");

     	   	consentSelect.attr('disabled','disabled');
     	   	var mainTable =jQuery(".aka_group_header:contains('Consent details')").next('table') 
     	   	var rows = mainTable.find("tbody tr");
     	 
     	   	//hide add button
			var btn = mainTable.find("button:contains('Add')");
			btn.hide();		
			
			//hide delete column
			mainTable.find('thead tr:first th:nth-child(3)').hide();
			mainTable.find('tbody tr:first td:nth-child(3)').hide();
   			
			//replcae inputs with plain text
     	   for(var index = 0; index < rows.length-2; index++){     		   
				jQuery(rows[index]).find('td:nth-child(3)').hide();
				var input = jQuery(rows[index]).find("td:first input[type=text][type!='hidden']");				
				input.hide();
				jQuery("<span>"+ input.val() +"</span>").insertAfter(input);
     	   }
     	   
     	   //if the table is empty and there NOT any rows, hide the table as well
     	   if(rows.length <=3 ){
     		   
			  //find the delete button column in head and press it to remove the default row
     		  mainTable.find('tbody').find('button.button_remove').trigger('click');						
     		  
     		  //hide the table
     		  mainTable.hide();
     		  
			  //hide the header as there is no element in the table
     		  mainTable.find('tbody').parent().parent().find("div.aka_group_header:contains('Consent details')").hide();
     		  
     	   }
     		
     	   	return;    		
    	}
    	
    	var consentSelect = jQuery(sp).parent().parent().find("input").valueLookup("/OCService/lookupServices/ConsentForm");
    	jQuery("span[data-id='Cons_3']").parent().parent().find('select').css("width", "300px");
    	var PISrow = jQuery("span[data-id=Cons_4]");
    	

        var $consentShowButton = jQuery("<input type=\"button\" class=\"button_xlong\" value=\"Select consent and continue...\"/>");
        input.closest('table').after($consentShowButton);
        //Hide save button, and show it after they click on Select consent and continue
        jQuery("input[value='Save']").hide();
  

        
       $consentShowButton.on('click', function(){
    	   
    	   //show save button
    	   jQuery("input[value='Save']").show();
    	   
    	   showSection("Cons_2", "Cons_10");
    	   consentSelect.attr('disabled','disabled');
           PISrow.closest("tr").parent().closest("tr").parent().closest("tr").show();
           $consentShowButton.hide();
    	   
		    jQuery.ajax({
			url:            '/OCService/ConsentForm/Questions?consentFormName=' + consentSelect.val(),
			async :         false,
			success :       function(data){
			    var results = data;
			    jQuery.each(jQuery(".aka_group_header:contains('Consent details')"), function(index, hd) {
				var $self = jQuery(hd).next('table');
				//$self.find('tbody tr').hide();
				//hide the delete button column in head  
				$self.find('thead tr:first th:nth-child(3)').hide();
				//hide the delete button column in body
				$self.find('tbody tr:first td:nth-child(3)').hide();
	
				var results = data;
				for(var index = 0; index < results.length; index++){			    	
				    var result = results[index];
				    
				    if(index == 0){
						//change the first row which is actually empty
						var lastRow = $self.find("tbody tr:first");
						var input = lastRow.find("td:first input[type=text][type!='hidden']");	    	
						input.val(result);
						input.hide();				    	
						jQuery("<span>"+ result +"</span>").insertAfter(input);
				    }else{			    		
				
						var btn = $self.find("button:contains('Add')");
						btn.trigger('click');
						
						//var lastRow = $self.find("tbody tr:nth-child("+ (index+1) +")");//.prev().prev();
						var lastRow = $self.find("tbody tr:last").prev().prev()//.prev().prev();
						//hide delete column
						lastRow.find('td:nth-child(3)').hide();
						var input = lastRow.find("td:first input[type=text][type!='hidden']");
						input.val(result);
						input.hide();
						jQuery("<span>"+ result +"</span>").insertAfter(input);
				    }
				}
				
				//just remove the default consent question which is mandatory otherwise it will not save
				if(results.length == 0){
					//find the delete button column in head and press it to remove the default row
					$self.find('tbody').find('button.button_remove').trigger('click');						
					//hide the header as there is no element in the table
					$self.find('tbody').parent().parent().find("div.aka_group_header:contains('Consent details')").hide();
				}
				$self.find('thead').hide();
				$self.find("tr:last").prev().hide();    
				$self.find("tr:last").hide();			
			    });
			},
			dataType :      'json'
		    });	    
       });
       hideSection("Cons_2", "Cons_10");
       PISrow.closest("tr").parent().closest("tr").parent().closest("tr").hide();
	    //consentSelect.trigger('change');
    });
    

    jQuery.each(jQuery("span[data-id=Cons_4]"), function (index, sp) {
    	jQuery(sp).parent().parent().find("input").valueLookup("/OCService/lookupServices/PIS");
    	jQuery("span[data-id='Cons_4']").parent().parent().find('select').css("width", "300px");
	});

    jQuery.each(jQuery("span[data-id=WD_3]"), function (index, sp) {
    	jQuery(sp).parent().parent().find("input").valueLookup("/OCService/lookupServices/WithdrawalForm");
	});

    
    
    jQuery.each(jQuery("td.aka_text_block:contains('Has the sample linkage form been printed?')"), function(index, hd) {
    	jQuery(hd).next('td').pdfButton(hd);
	});


    
    // Hide or Disable Participant Type in Clinical section
    jQuery.each(jQuery("span[data-id='Hidden_1_ParticipantType']"), function(index, sp) {
    	
        getQuestionTr("Hidden_1_ParticipantType").hide();
        getQuestionTr("Hidden_REL_3").hide();
        
    	
    	//Check if it is Proband or Relative
    	var selectedItem = jQuery(sp).parent().parent().find("input:radio:checked");
    	
    	
    	//if it is Proband, then add red * to those eligibility questions
    	if (selectedItem.length > 0 && selectedItem.val() == 'Proband' ){
    		var flagEligibility_Verion  = jQuery("[data-id='PB_8']").parent().parent().find('a:not(.eligibilityLink)');
    		var flagEligibility_Answer = jQuery("[data-id='PB_9']").parent().parent().find('a:not(.eligibilityLink)');
    		
    		//add the red * after the flag, if it exists
    		if(flagEligibility_Verion.length > 0){
    			flagEligibility_Verion.before("<span class='alert'>*</span>");
    		}
    		
    		if(flagEligibility_Answer.length > 0){
    			flagEligibility_Answer.before("<span class='alert'>*</span>");
    		}
    	}    
    	else if (selectedItem.length > 0 && selectedItem.val() == 'Relative' ){
    		
                
            var selectInput = jQuery("span[data-id='Hidden_REL_3']").parent().parent().find("select");
            
            if(selectInput.val() == 'NotAffected' || selectInput.val() == 'NotKnown' || selectInput.val() == ''){
            	
            	
            	//return the diseaseSelector back to its normal Select status
            	//remove all the selector            	
            	jQuery("span[data-id=DiseaseGroup]").parent().parent().find("select").remove();
   	         	jQuery("span[data-id=DiseaseSubgroup]").parent().parent().find("select").remove();
   	         	jQuery("span[data-id=SpecificDisease]").parent().parent().find("select").remove();
   	         	
   	         	var diseaseInput = jQuery("span[data-id=DiseaseGroup]").parent().parent().find("input");
   	         	var subDiseaseInput = jQuery("span[data-id=DiseaseSubgroup]").parent().parent().find("input");
   	         	var specificDiseaseInput = jQuery("span[data-id=SpecificDisease]").parent().parent().find("input");
   	         	diseaseInput.val('');
   	         	subDiseaseInput.val('');
   	         	specificDiseaseInput.val('');   	        
   	         	diseaseInput.diseaseSelector(subDiseaseInput, specificDiseaseInput);
   	         	
            	getQuestionTr("DiseaseGroup").hide();
            	getQuestionTr("DiseaseSubgroup").hide();
            	getQuestionTr("SpecificDisease").hide();
            	hideSection("PT_21", "PT_24");
            	hideSection("RC_1", "RC_4");           
            	jQuery("input[value='Save']").show();      
            	
            	var disStr = "";
            	if(selectInput.val() == "")
            		disStr = "The Disease status in the Family tab is 'Blank',<br> so there are no questions on this tab.";
            	else
            		disStr= "The Disease status in the Family tab is '" + selectInput.val() +"',<br> so there are no questions on this tab.";
            	
            	        	
            	var td = jQuery("td.table_cell_left.aka_stripes:contains('Disease') b");
            	td.html(disStr);
            	
            	
            	
            }else if (selectInput.val() == 'AffectedSame' || selectInput.val() == 'AffectedOther'){
            
            	
            	//get the value of the DiseaseGroup to find, it is in New or Edit mode
            	var diseaseInput = jQuery("span[data-id=DiseaseGroup]").parent().parent().find("input");
            	
            	//if new then do not show
            	if(diseaseInput.val() == ''){
            		getQuestionTr("DiseaseGroup").show();
            		getQuestionTr("DiseaseSubgroup").show();
            		getQuestionTr("SpecificDisease").show();
            		hideSection("PT_21", "PT_24");
            		hideSection("RC_1", "RC_4");
            		jQuery("input[value='Save']").hide();
            	}else{
            		getQuestionTr("DiseaseGroup").show();
            		getQuestionTr("DiseaseSubgroup").show();
            		getQuestionTr("SpecificDisease").show();
            		showSection("PT_21", "PT_24");
            		showSection("RC_1", "PR_4");
            		jQuery("input[value='Save']").show();
            	}
            }
    		
        	//@Eligibility, hide table header
            jQuery("td.aka_stripes:contains('Eligibility')").hide();
            
        	//@Eligibility, UnCheck all input:radio in Eligibility section, in case if Participant was proband before and these were checked
        	jQuery("[data-id='PB_9']").closest('table').find('input:radio').prop('checked', false);
            jQuery("[data-id='PB_8']").closest('table').find('input:text').val('');
            
            //@Eligibility, hide Eligibility table
        	jQuery("[data-id='PB_8']").closest('td.table_cell_left').hide();
        	jQuery("[data-id='PB_9']").closest('td.table_cell_left').hide();
        }else{
        	
        	//return the diseaseSelector back to its normal Select status
        	//remove all the selector            	
        	jQuery("span[data-id=DiseaseGroup]").parent().parent().find("select").remove();
         	jQuery("span[data-id=DiseaseSubgroup]").parent().parent().find("select").remove();
         	jQuery("span[data-id=SpecificDisease]").parent().parent().find("select").remove();
         	
         	var diseaseInput = jQuery("span[data-id=DiseaseGroup]").parent().parent().find("input");
         	var subDiseaseInput = jQuery("span[data-id=DiseaseSubgroup]").parent().parent().find("input");
         	var specificDiseaseInput = jQuery("span[data-id=SpecificDisease]").parent().parent().find("input");
         	diseaseInput.val('');
         	subDiseaseInput.val('');
         	specificDiseaseInput.val('');   	        
         	diseaseInput.diseaseSelector(subDiseaseInput, specificDiseaseInput);
	         	
        	getQuestionTr("DiseaseGroup").hide();
        	getQuestionTr("DiseaseSubgroup").hide();
        	getQuestionTr("SpecificDisease").hide();
        	hideSection("PT_21", "PT_24");
        	hideSection("RC_1", "RC_4");
        	jQuery("input[value='Save']").show(); 
        	
        	
        	var disStr = " The Participant type in the Family tab is not specified. So there are no questions on this tab.";
		  	var td = jQuery("td.table_cell_left.aka_stripes:contains('Disease') b");
        	td.html(disStr);       	
        	
        	
        	//@Eligibility, hide Eligibility table
        	jQuery("[data-id='PB_8']").closest('td.table_cell_left').hide();
        	jQuery("[data-id='PB_9']").closest('td.table_cell_left').hide();
        }
    });
    


});

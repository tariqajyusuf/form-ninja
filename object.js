/* object.js - Provides the function front end of the form builder
 * Copyright 2012, Tariq Yusuf
 *
 * This file is part of Form Ninja.
 *
 * Form Ninja is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Form Ninja is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Form Ninja.  If not, see <http://www.gnu.org/licenses/>.
 */

// CONFIGURATION CONSTANTS
var IMAGE_DIRECTORY = "images";		// the directory holding required images

// Attributes not allowed to be manually set by the user
var RESTRICTED_ATTRIBUTES = ["name", "type", "class", "multiple"];

// Control type
var CONTROL_TYPES = ["Text", "Radio", "Drop-Down", "Checkbox", "File", "Time Chart", "Rich Text"];

// Property types
var NONE = -1;
var TEXT = 0;
var LIST = 1;
var BOOL = 3;
var NUMBER = 4;

// GLOBALS
var ___currApp = null;		// Reference to the working application
var ___editMode = false;	// Boolean indicating if we are editing something already

/*************************/
/* USER-CALLED FUNCTIONS */
/*************************/

// Initializes a form builder in the given element
function initializeFormBuilder(element, app) {
	var builder = $(document.createElement("div"));
	var editor = $(document.createElement("fieldset"));
	
	editor.attr("class", "fb_editor");
	editor.append("<legend></legend>");
	builder.attr("class", "formbuilder");
	element.empty();
	element.append(editor);
	element.append(builder);
	
	___currApp = app;
	refresh();
}

// Refreshes the sample
function refresh() {
	$(".formbuilder").empty();
	$(".formbuilder").append(___currApp.generateDisplaySample());
	___currApp.onRefresh();
}

/**********************/
/*  COMMON FUNCTIONS  */
/**********************/

// Gets corresponding control to the index
function getInstanceOfControlType(intVal) {
	var obj = null;
	switch(intVal) {
		case 0:
			obj = new TextBox();
			break;
		case 1:
			obj = new Radio();
			break;
		case 2:
			obj = new DropDown();
			break;
		case 3:
			obj = new CheckBox();
			break;
		case 4:
			obj = new File();
			break;
		case 5:
			obj = new TimeChart();
			break;
		case 6:
			obj = new CKEditor();
			break;
	}
	
	return obj;
}

// Renders a control panel for the specified commands
function controlPanel(commands) {
	var controlDiv = $("<div class=\"formBuilder_controls\">");
	var newControl = null;
	
	for(var i = 0; i < commands.length; i++) {
		switch(commands[i]) {
			case "addpage":
				controlDiv.append(generateControl("add", "page"));
				break;
			case "removepage":
				controlDiv.append(generateControl("remove", "page"));
				break;
			case "addsection":
				controlDiv.append(generateControl("add", "section"));
				break;
			case "removesection":
				controlDiv.append(generateControl("remove", "section"));
				break;
			case "addcontrol":
				controlDiv.append(generateControl("add", "control"));
				break;
			case "removecontrol":
				controlDiv.append(generateControl("remove", "control"));
				break;
			case "editapplication":
				controlDiv.append(generateControl("edit", "application"));
				break;
			case "editpage":
				controlDiv.append(generateControl("edit", "page"));
				break;
			case "editsection":
				controlDiv.append(generateControl("edit", "section"));
				break;
			case "editcontrol":
				controlDiv.append(generateControl("edit", "control"));
				break;
			default:
				throw "Invalid Commend Passed";
		}
	}
	
	return controlDiv;
}

// Render a control panel control
function generateControl(type, desc) {
	var a = $("<a class=\"" + type + desc + "\">");
	a.append("<img src=\"" + IMAGE_DIRECTORY + "/" + type + ".png\" alt=\"" + type + "\" />");
	a.append(desc);
	return a;
}

// Resets the edit interface
function exitEditMode() {
	$(".fb_editor").empty();
	$(".fb_editor").append("<legend></legend>");
	___editMode = false;
	refresh();
}

// Makes the function safe for forms
function namesafe(name) {
	name = $.trim(name.toLowerCase());
	name = name.replace(new RegExp(" ", 'g'), "_");
	name = name.replace(new RegExp("\\W|_", 'g'), "_");

	return name;
}

/*******************/
/* EDITING CLASSES */
/*******************/

// Edit Control
var EditableProperty = function() {
	this.name = "propertyName";				// The Property name
	this.type = NONE;						// The Property type
	this.desc = "Property Description:";	// The Property description
	this.value = null;						// The value of the property
};

// Edit Form
var EditForm = function() {
	this.properties = [];			// Array of EditableProperties
};

// Generate an edit form
EditForm.prototype.generateHTML = function(objToEdit) {
	if(!___editMode) {
		var dl = $(document.createElement("dl"));
		var submit = $(document.createElement("a"));
		var cancel = $(document.createElement("a"));
		var object = this;
	
		submit.addClass("ty-button");
		cancel.addClass("ty-button");

		dl.attr("class", "editform");
		submit.append("Edit");
		cancel.append("Cancel");
		___editMode = true;
		
		for(var i = 0; i < this.properties.length; i++) {
			var dt = $(document.createElement("dt"));
			var dd = $(document.createElement("dd"));
			var property = this.properties[i];
			
			dt.append(property.desc);
			
			switch(property.type) {
				case TEXT:
					dd.append(createTextEdit(property.name, property.value));
					break;
				case LIST:
					dd.append(createListEdit(property.name, property.value));
					break;
				case BOOL:
					dd.append(createBoolEdit(property.name, property.value));
					break;
				case NUMBER:
					dd.append(createNumberEdit(property.name, property.value));
					break;
			}
			
			dl.append(dt);
			dl.append(dd);
		};
		
		submit.click(function() {
			var inputs = dl.find("input");
			
			for(var i = 0; i < object.properties.length; i++) {
				var propertyName = object.properties[i].name;
				var currentControl = $(".editform input[name=edit_" + propertyName + "], .editform select[name=edit_" + propertyName + "]")
				
				if(currentControl.attr("type") == "radio") {
					objToEdit[propertyName] = (currentControl.filter(":checked").val() == 'true');
				} else if(currentControl[0].tagName.toLowerCase() == "input") {
					objToEdit[propertyName] = currentControl.val();
				} else if(currentControl[0].tagName.toLowerCase() == "select") {
					var options = currentControl.find('option');
					var optionValues = [];
					for(var j = 0; j < options.length; j++) {
						optionValues.push(options[j].text);
					}
					objToEdit[propertyName].length = 0;
					objToEdit[propertyName] = optionValues;
				}
			}
			exitEditMode();
		});
		cancel.click(exitEditMode);
		
		dl.append(submit);
		dl.append(cancel);
		
		return dl;	
	} else {
		alert("You are currently editing another object, please complete the edit before adding a new object");
	}
};

// Generate an EditForm based off control data provided as the object
// reference, array of property names, desired descriptions, and types.
function makeEditForm(object, names, descriptions, types) {
	var array = new Array();
	var editForm = new EditForm();
	for(var i = 0; i < names.length; i++) {
		var property = new EditableProperty();
		property.name = names[i];
		property.type = types[i];
		property.desc = descriptions[i];
		property.value = object[names[i]];
		array.push(property);
	}
	
	editForm.properties = array;
	return editForm;
}

// Creates the text property edit control
function createTextEdit(name, value) {
	var input = $(document.createElement("input"));
	
	input.attr("type", "text");
	input.attr("name", "edit_" + name);
	input.attr("value", value);
	
	return input;
}

// Creates an editable list
function createListEdit(name, value) {
	var span = $(document.createElement("span"));
	var select = $(document.createElement("select"));
	var addText = $(document.createElement("input"));
	var removeButton = $(document.createElement("a"));
	var addButton = $(document.createElement("a"));
	removeButton.addClass("ty-button");	
	addButton.addClass("ty-button");

	// Initialize select
	select.attr("size", 10);
	select.attr("multiple", true);
	select.attr("name", "edit_" + name);
	for(var i = 0; i < value.length; i++) {
		select.append("<option>" + value[i] + "</option>");
	}
	
	// Initialize textbox
	addText.attr("type", "text");
	
	// Initialize remove button
	removeButton.append("Remove");
	removeButton.click(function() {
		select.find("option:selected").remove();
	});
	
	// Initialize add button
	addButton.append("Add");
	addButton.click(function() {
		if(addText.val() != "") {
			select.append("<option>" + addText.val() + "</option>");
		}
	});
	
	// Add everything
	span.append(select);
	span.append("<br />");
	span.append(addText);
	span.append(addButton);
	span.append(removeButton);
	
	return span;

}

// Creates a yes/no selection
function createBoolEdit(name, value) {
	var span = $(document.createElement("span"));
	var labelYes = $(document.createElement("label"));
	var radioYes = $(document.createElement("input"));
	var labelNo = $(document.createElement("label"));
	var radioNo = $(document.createElement("input"));
	
	// Initialize yes
	radioYes.attr("value", "true");
	radioYes.attr("name", "edit_" + name);
	radioYes.attr("type", "radio");
	labelYes.append(radioYes);
	labelYes.append("Yes");
	if(value) {
		radioYes.attr("checked", true);
	}
	
	// Initialize no
	radioNo.attr("value", "false");
	radioNo.attr("name", "edit_" + name);
	radioNo.attr("type", "radio");
	labelNo.append(radioNo);
	labelNo.append("No");
	if(!value) {
		radioNo.attr("checked", true);
	}
	
	// Append to span
	span.append(labelYes);
	span.append(labelNo);
	return span;
}

// Creates the number property edit control
function createNumberEdit(name, value) {
	var input = $(document.createElement("input"));
	
	input.attr("type", "text");
	input.attr("name", "edit_" + name);
	input.attr("value", value);
	input.keyup(function() {
		if(isNaN(input.val()))
			input.attr("value", input.val().substring(0, input.val().length - 1));
	});
	
	return input;
}

// Removes the current object
function removeCurrentObj(object) {
	object.parent.removeControl(object.controlIndex);
	refresh();
}

// Add a new object
function addControlToObject(object) {
	if(!___editMode) {
		var submit = $(document.createElement("a"));
		var cancel = $(document.createElement("a"));
		submit.addClass("ty-button");
		cancel.addClass("ty-button");

		// Initialize
		___editMode = true;
		submit.id = "fb_edit_submit";
		cancel.id = "fb_edit_cancel";
		
		// Add radio buttons
		for(var i = 0; i < CONTROL_TYPES.length; i++) {
			var radio = $(document.createElement("input"));
			radio.attr("type", "radio");
			radio.attr("name", "control");
			radio.val(i);
			$(".fb_editor").append(radio);
			$(".fb_editor").append(CONTROL_TYPES[i] + "<br />");
		}
		
		// Set button events
		submit.click(function() {
			var selection = parseInt($("input[name=control]:checked").val());
			object.addControl(getInstanceOfControlType(selection));
			cancel.click();
		});
		submit.append("Add");
		cancel.click(exitEditMode);
		cancel.append("Cancel");
		
		// Append
		$(".fb_editor").append(submit);
		$(".fb_editor").append(cancel);
		$(".fb_editor legend").empty();
		$(".fb_editor legend").append("Add Control");
	} else {
		alert("You are currently editing another object, please complete the edit before adding a new object");
	}
}

// Edits an object using the generated edit form
function editObject(domNode) {
		$(".fb_editor").empty();
		$(".fb_editor").append(domNode);
		$(".fb_editor legend").empty();
		$(".fb_editor legend").append("Editing Control...");
}

/*****************/
/*    CLASSES    */
/*****************/

// TextBox Control
var TextBox = function() {
	this.label = "Text Box";	// The text to display as a label and the field name
	this.required = false;		// Boolean indicating if input is required
	this.attributes = {};		// JSON object that represents key/value pairs of
								// additional attributes.
	this.controlIndex = -1;		// The control's index to keep em' organized
	this.parent = null;			// The control's parent container
};

// Creates an edit form for the object
TextBox.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required"],
		["Instructions:", "Required:"],
		[TEXT, BOOL]);
};

// Returns a jQuery DOM Element representing the object
TextBox.prototype.generateDOMNode = function() {
	var object = this;
	var input = $(document.createElement("input"));
	var label = $(document.createElement("label"));
	var hidden = $(document.createElement("input"));
	
	// Prepare input tag
	input.attr("name", namesafe(this.label));
	input.attr("type", "text");
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			input.attr(key, this.attributes[key]);
		}
	}
	
	// Prepare label tag
	label.append(this.label);
	label.append(input);
	
	// Append control index data
	hidden.attr("type", "hidden");
	hidden.attr("name", "controlIndex");
	hidden.attr("value", this.controlIndex);
	label.append(hidden);
	
	// Append CP
	label.prepend(controlPanel(["removecontrol", "editcontrol"]));
	label.find(".removecontrol:first").click(function() {removeCurrentObj(object);});
	label.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});
	
	return label;
};

// Returns a jQuery XML Element representing the object
TextBox.prototype.generateXMLNode = function() {
	var text = $("<text>");
	
	// Add attributes
	text.attr("name", namesafe(this.label));
	text.attr("label", this.label);
	text.attr("required", (this.required ? "yes" : "no"));
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			input.attr(key, this.attributes[key]);
		}
	}
	
	return text;
};

// Radio Control
var Radio = function() {
	this.label = "Radio Buttons";	// The text to display as a label and field name
	this.required = false;			// Boolean indicating if input is required
	this.attributes = {};			// JSON object that represents key/value pairs of
									// additional attributes.
	this.choices = 
		["Choice A", "Choice B",
		"Choice C"];				// The choices for the radio button
	this.controlIndex = -1;			// The control's index to keep em' organized
	this.parent = null;				// The control's parent container
};

// Creates an edit form for the object
Radio.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required", "choices"],
		["Instructions:", "Required:", "Options:"],
		[TEXT, BOOL, LIST]);
};

// Returns a jQuery DOM Element representing the object
Radio.prototype.generateDOMNode = function() {
	var object = this;
	var span = $(document.createElement("span"));
	var input = $(document.createElement("input"));
	
	// Prepare display span
	span.attr("class", "radio");
	span.append(this.label);
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			span.attr(key, this.attributes[key]);
		}
	}
	
	// Loop through choices
	for(var i = 0; i < this.choices.length; i++) {
		var label = $(document.createElement("label"));
		var radio = $(document.createElement("input"));
		
		// Prepare input
		radio.attr("name", namesafe(this.label));
		radio.attr("type", "radio");
		radio.attr("value", this.choices[i]);
		
		// Prepare label and append
		label.append(radio);
		label.append(this.choices[i]);
		span.append(label);
	}
	
	// Append control index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	span.append(input);
	
	// Append CP
	span.prepend(controlPanel(["removecontrol", "editcontrol"]));
	span.find(".removecontrol:first").click(function() {removeCurrentObj(object);});
	span.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});

	return span;
};

// Returns a jQuery XML Element representing the object
Radio.prototype.generateXMLNode = function() {
	var radio = $("<radio>");
	
	// Prepare radio element
	radio.attr("name", namesafe(this.label) + "[]");
	radio.attr("label", this.label);
	radio.attr("required", (this.required ? "yes" : "no"));
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			radio.attr(key, this.attributes[key]);
		}
	}
	
	// Prepare and append choices
	for(var i = 0; i < this.choices.length; i++) {
		var choice = $("<choice>");
		choice.append(this.choices[i]);
		radio.append(choice);
	}
	
	return radio;
};

// DropDown Control
var DropDown = function() {
	this.label = "Drop Down";		// The text to display as a label and field name
	this.required = false;			// Boolean indicating if input is required
	this.multiple = false;			// Boolean indiciating if multiple selection is enabled
	this.attributes = {};			// JSON object that represents key/value pairs of
									// additional attributes.
	this.choices = 
		["Choice A", "Choice B",
		"Choice C"];				// The choices for the radio button
	this.controlIndex = -1;			// The control's index to keep em' organized
	this.parent = null;				// The control's parent container
};

// Creates an edit form for the object
DropDown.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required", "choices", "multiple"],
		["Instructions:", "Required:", "Options:", "Allow multiple select?"],
		[TEXT, BOOL, LIST, BOOL]);
};

// Returns a jQuery DOM Element representing the object
DropDown.prototype.generateDOMNode = function() {
	var object = this;
	var label = $(document.createElement("label"));
	var select = $(document.createElement("select"));
	var input = $(document.createElement("input"));
	
	// Prepare select
	select.attr("name", namesafe(this.label));
	select.attr("multiple", this.multiple);
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			select.attr(key, this.attributes[key]);
		}
	}
	
	// Prepare label
	label.attr("class", "dropdown");
	label.append(this.label);
	label.append(select);
	
	// Loop through choices
	for(var i = 0; i < this.choices.length; i++) {
		var option = $(document.createElement("option"));
		
		// Prepare option
		option.append(this.choices[i]);
		select.append(option);
	}
	
	// Append control index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	label.append(input);
	
	// Append CP
	label.prepend(controlPanel(["removecontrol", "editcontrol"]));
	label.find(".removecontrol:first").click(function() {removeCurrentObj(object);});	
	label.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});

	return label;
};

// Returns a jQuery XML Element representing the object
DropDown.prototype.generateXMLNode = function() {
	var dropDown = $("<dropdown>");
	
	// Prepare dropdown element
	dropDown.attr("name", namesafe(this.label) + "[]");
	dropDown.attr("label", this.label);
	dropDown.attr("required", (this.required ? "yes" : "no"));
	dropDown.attr("multiple", this.multiple);
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			dropDown.attr(key, this.attributes[key]);
		}
	}
	
	// Prepare and append choices
	for(var i = 0; i < this.choices.length; i++) {
		var choice = $("<choice>");
		choice.append(this.choices[i]);
		dropDown.append(choice);
	}
	
	return dropDown;
};

// CheckBox Control
var CheckBox = function() {
	this.label = "Check Box";		// The text to display as a label and field name
	this.required = false;			// Boolean indicating if input is required
	this.attributes = {};			// JSON object that represents key/value pairs of
									// additional attributes.
	this.choices = 
		["Choice A", "Choice B",
		"Choice C"];				// The choices for the radio button
	this.controlIndex = -1;			// The control's index to keep em' organized
	this.parent = null;				// The control's parent container
};

// Creates an edit form for the object
CheckBox.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required", "choices"],
		["Instructions:", "Required:", "Options:"],
		[TEXT, BOOL, LIST]);
};

// Returns a jQuery DOM Element representing the object
CheckBox.prototype.generateDOMNode = function() {
	var object = this;
	var span = $(document.createElement("span"));
	var input = $(document.createElement("input"));
	
	// Prepare display span
	span.attr("class", "checkbox");
	span.append(this.label);
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			span.attr(key, this.attributes[key]);
		}
	}
	
	// Loop through choices
	for(var i = 0; i < this.choices.length; i++) {
		var label = $(document.createElement("label"));
		var chkbox = $(document.createElement("input"));
		
		// Prepare input
		chkbox.attr("name", namesafe(this.label));
		chkbox.attr("type", "checkbox");
		chkbox.attr("value", this.choices[i]);
		
		// Prepare label and append
		label.append(chkbox);
		label.append(this.choices[i]);
		span.append(label);
	}
	
	// Append control index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	span.append(input);
	
	// Append CP
	span.prepend(controlPanel(["removecontrol", "editcontrol"]));
	span.find(".removecontrol:first").click(function() {removeCurrentObj(object);});
	span.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});

	return span;
};

// Returns a jQuery XML Element representing the object
CheckBox.prototype.generateXMLNode = function() {
	var radio = $("<checkbox>");
	
	// Prepare radio element
	radio.attr("name", namesafe(this.label) + "[]");
	radio.attr("label", this.label);
	radio.attr("required", (this.required ? "yes" : "no"));
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			radio.attr(key, this.attributes[key]);
		}
	}
	
	// Prepare and append choices
	for(var i = 0; i < this.choices.length; i++) {
		var choice = $("<choice>");
		choice.append(this.choices[i]);
		radio.append(choice);
	}
	
	return radio;
};

// File Control
var File = function() {
	this.label = "File";			// The text to display as a label and field name
	this.required = false;			// Boolean indicating if input is required
	this.attributes = {};			// JSON object that represents key/value pairs of
									// additional attributes.
	this.controlIndex = -1;			// The control's index to keep em' organized
	this.parent = null;				// The control's parent container
};

// Creates an edit form for the object
File.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required"],
		["Instructions:", "Required:"],
		[TEXT, BOOL]);
};

// Returns a jQuery DOM Element representing the object
File.prototype.generateDOMNode = function() {
	var object = this;
	var label = $(document.createElement("label"));
	var file = $(document.createElement("input"));
	var input = $(document.createElement("input"));
	
	// Prepare file
	file.attr("name", namesafe(this.label));
	file.attr("type", "file");
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			file.attr(key, this.attributes[key]);
		}
	}
	
	// Prepare label and append
	label.attr("class", "file");
	label.append(this.label);
	label.append(file);
	
	// Append control index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	label.append(input);
	
	// Append CP
	label.prepend(controlPanel(["removecontrol", "editcontrol"]));
	label.find(".removecontrol:first").click(function() {removeCurrentObj(object);});
	label.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});
	
	return label;
};

// Returns a jQuery XML Element representing the object
File.prototype.generateXMLNode = function() {
	var file = $("<file>");
	
	// Prepare file element
	file.attr("name", namesafe(this.label));
	file.attr("label", this.label);
	file.attr("required", (this.required ? "yes" : "no"));
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			file.attr(key, this.attributes[key]);
		}
	}
	
	return file;
};

// TimeChart Control
var TimeChart = function() {
	this.label = "Time Chart";		// The text to display as a label and field name
	this.required = false;			// Boolean indicating if input is required
	this.startHour = 0;				// The start hour of the time chart
	this.endHour = 23;				// The end hour of the time chart
	this.value = "";				// The value?
	this.attributes = {};			// JSON object that represents key/value pairs of
									// additional attributes.
	this.controlIndex = -1;			// The control's index to keep em' organized
	this.parent = null;				// The control's parent container
};

// Creates an edit form for the object
TimeChart.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required", "startHour", "endHour"],
		["Instructions:", "Required:", "Earliest Start Time:", "Latest End Time:"],
		[TEXT, BOOL, NUMBER, NUMBER]);
};

// Returns a jQuery DOM Element representing the object
TimeChart.prototype.generateDOMNode = function() {
	var object = this;
	var span = $(document.createElement("span"));
	var input = $(document.createElement("input"));
	
	span.append("Time Chart - " + this.label + "(" + this.startHour + ":00 - " + this.endHour + ":00)");
	span.attr("class", "timechart");
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			span.attr(key, this.attributes[key]);
		}
	}
	
	// Append control index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	span.append(input);
	
	// Append CP
	span.prepend(controlPanel(["removecontrol", "editcontrol"]));
	span.find(".removecontrol:first").click(function() {removeCurrentObj(object);});
	span.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});
	
	return span;
};

// Returns a jQuery XML Element representing the object
TimeChart.prototype.generateXMLNode = function() {
	var timechart = $("<time-chart>");
	
	// Prepare timechart
	timechart.attr("start", this.startHour);
	timechart.attr("end", this.endHour);
	timechart.attr("name", namesafe(this.label));
	timechart.attr("value", this.value);
	timechart.attr("label", this.label);
	timechart.attr("required", (this.required ? "yes" : "no"));
	for(var key in this.attributes) {
		key = key.toLowerCase();
		if(this.attributes.hasOwnProperty(key) &&
			$.inArray(key, RESTRICTED_ATTRIBUTES) == -1) {
			timechart.attr(key, this.attributes[key]);
		}
	}
	
	return timechart;
};

// CKEditor Control
var CKEditor = function() {
	this.label = "CKEditor";		// The text to display as a label and field name
	this.required = false;			// Boolean indicating if input is required
	this.controlIndex = -1;			// The control's index to keep em' organized
	this.parent = null;				// The control's parent container
};

// Creates an edit form for the object
CKEditor.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label", "required"],
		["Instructions:", "Required:"],
		[TEXT, BOOL]);
};

// Returns a jQuery DOM Element representing the object
CKEditor.prototype.generateDOMNode = function() {
	var object = this;
	var span = $(document.createElement("span"));
	var input = $(document.createElement("input"));
	
	span.append("CKEditor - " + this.label);
	span.attr("class", "timechart");
	
	// Append control index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	span.append(input);
	
	// Append CP
	span.prepend(controlPanel(["removecontrol", "editcontrol"]));
	span.find(".removecontrol:first").click(function() {removeCurrentObj(object);});	
	span.find(".editcontrol:first").click(function() {editObject(object.createEditForm().generateHTML(object));});

	return span;
};

// Returns a jQuery XML Element representing the object
CKEditor.prototype.generateXMLNode = function() {
	var timechart = $("<ckeditor>");
	
	// Prepare timechart
	timechart.attr("name", namesafe(this.label));
	timechart.attr("label", this.label);
	timechart.attr("required", (this.required ? "yes" : "no"));
	
	return timechart;
};

// Page Class
var Page = function() {
	this.label = "My Page";				// Human-readable name for the page
	this.controls = [];					// Array of objects to display, use adding methods to ensure safety
	this.pageIndex = -1;				// The index of the page to keep em' organized
	this.parent = null;					// The page's parent application
};

// Creates an edit form for the object
Page.prototype.createEditForm = function() {
	return makeEditForm(this,
		["label"],
		["Name:"],
		[TEXT]);
};

// Clears all the controls
Page.prototype.clearControls = function() {
	this.controls = [];
	refresh();
};

// Adds a new control, returns true if added, false otherwise
Page.prototype.addControl = function(control) {
	// Check if control has required functions
	if(typeof control.generateDOMNode === 'undefined' ||
		typeof control.generateXMLNode === 'undefined')
		return false;
	else {
		control.controlIndex = this.controls.length;
		control.parent = this;
		this.controls.push(control);
	}
	refresh();
};

// Removes a specific control, returns true if removed, false otherwise
Page.prototype.removeControl = function(index) {
	// Check if index is within array bounds
	if(index < 0 || index >= this.controls.length)
		return false;
	else {
		this.controls.splice(index, 1);
	
		// Modify other indices
		for(var i = index; i < this.controls.length; i++)
			this.controls[i].controlIndex = i;
		return true;
	
		return true;
	}
	refresh();
};

// Swaps two controls, returns true if successful, false otherwise
Page.prototype.swapControls = function(index1, index2) {
	// Check if index is within array bounds
	if((index1 < 0 || index1 >= this.controls.length) && (index2 < 0 || index2 >= this.controls.length))
		return false;
	else {
		var a = this.controls[index1];
		var b = this.controls[index2];
	
		this.controls.splice(index1, 1, b);
		b.controlIndex = index1;
		this.controls.splice(index2, 1, a);
		a.controlIndex = index2;
		return true;
	}
	refresh();
};

// Generates HTML for the page example display
Page.prototype.generateDisplaySample = function() {
	var object = this;
	var div = $(document.createElement("div"));
	var h2 = $(document.createElement("h2"));
	var input = $(document.createElement("input"));
	
	h2.append(this.label);
	h2.attr("class", "page-header");
	
	div.attr("class", "page");
	div.append(h2);
	
	// Append controls
	for(var i = 0; i < this.controls.length; i++) {
		div.append(this.controls[i].generateDOMNode());
		div.append($(document.createElement("br")));
	}
	
	// Append page index data
	input.attr("type", "hidden");
	input.attr("name", "pageIndex");
	input.attr("value", this.pageIndex);
	div.append(input);
	
	// Append CP
	div.prepend(controlPanel(["addsection", "addcontrol", "removepage", "editpage"]));
	div.find(".addsection:first").click(function() {object.addControl(new Section());});
	div.find(".addcontrol:first").click(function() {addControlToObject(object);});
	div.find(".removepage:first").click(function() {object.parent.removePage(object.pageIndex);refresh();});
	div.find(".editpage:first").click(function() {editObject(object.createEditForm().generateHTML(object));});
	
	return div;
};

// Generates XML for the Page
Page.prototype.generateXML = function() {
	var app = $("<page>");
	app.attr("label", this.label);
	
	// Append controls
	for(var i = 0; i < this.controls.length; i++) {
		app.append(this.controls[i].generateXMLNode());
		app.append("<br />");
	}
	
	return app;
};

// Section Class
var Section = function() {
	this.label = "My Page";		// Human-readable name for the page
	this.controls = [];			// Array of objects to display, use adding methods to ensure safety
	this.attributes = {};		// JSON object that represents key/value pairs of
								// additional attributes.
	this.controlIndex = -1;		// The control's index to keep em' organized
	this.parent = null;			// The control's parent container
};

Section.prototype.createEditForm = Page.prototype.createEditForm;
Section.prototype.clearControls = Page.prototype.clearControls;
Section.prototype.addControl = Page.prototype.addControl;
Section.prototype.removeControl = Page.prototype.removeControl;
Section.prototype.swapControls = Page.prototype.swapControls;

// Generates HTML for the page example display
Section.prototype.generateDOMNode = function() {
	var object = this;
	var div = $(document.createElement("div"));
	var fieldset = $(document.createElement("fieldset"));
	var legend = $(document.createElement("legend"));
	var input = $(document.createElement("input"));
	
	fieldset.attr("class", "section");
	legend.append(this.label);
	legend.attr("class", "section-header");
	fieldset.append(legend);
	
	// Append controls
	for(var i = 0; i < this.controls.length; i++) {
		fieldset.append(this.controls[i].generateDOMNode());
		fieldset.append("<br />");
	}
	
	// Append control's index data
	input.attr("type", "hidden");
	input.attr("name", "controlIndex");
	input.attr("value", this.controlIndex);
	fieldset.append(input);
	
	// Append CP
	div.append(fieldset);
	div.prepend(controlPanel(["addcontrol", "removesection", "editsection"]));
	div.find(".addcontrol:first").click(function() {addControlToObject(object);});
	div.find(".removesection:first").click(function() {object.parent.removeControl(object.controlIndex);});
	div.find(".editsection:first").click(function() {editObject(object.createEditForm().generateHTML(object));});
	
	return div;
};

// Generates XML for the page example display
Section.prototype.generateXMLNode = function() {
	var fieldset = $("<section>");
	
	fieldset.attr("label", this.label);
	
	// Append controls
	for(var i = 0; i < this.controls.length; i++) {
		fieldset.append(this.controls[i].generateXMLNode());
		fieldset.append("<br />");
	}
	
	return fieldset;
};

// Application Class
var Application = function() {
	this.name = "My Application";		// Human-readable name of the Application
	this.pages = [];					// Array of pages to display, use adding methods to ensure safety
};

// Creates an edit form for the object
Application.prototype.createEditForm = function() {
	return makeEditForm(this,
		["name"],
		["Name:"],
		[TEXT]);
};

// Clears all the pages
Application.prototype.clearPages = function() {
	this.pages = [];
	refresh();
};

// Adds a new page
Application.prototype.addPage = function() {
	if(!___editMode) {
		var page = new Page();
		page.pageIndex = this.pages.length;
		page.parent = this;
		this.pages.push(page);
		refresh();
	} else {
		alert("You are currently editing another object, please complete the edit before adding a new object");
	}
};

// Removes a specific page, returns true if removed, false otherwise
Application.prototype.removePage = function(index) {
	if(!___editMode) {
		// Check if index is within array bounds
		if(index < 0 || index >= this.pages.length)
			return false;
		else {
			this.pages.splice(index, 1);
			
			// Modify other indices
			for(var i = index; i < this.pages.length; i++)
				pages[i].pageIndex = i;
			return true;
		}
		refresh();	
	} else {
		alert("You are currently editing another object, please complete the edit before adding a new object");
	}
};

// Swaps two controls, returns true if successful, false otherwise
Application.prototype.swapPages = function(index1, index2) {
	if(!___editMode) {
		// Check if index is within array bounds
		if((index1 < 0 || index1 >= this.controls.length) && (index2 < 0 || index2 >= this.controls.length))
			return false;
		else {
			var a = this.controls[index1];
			var b = this.controls[index2];
			
			this.controls.splice(index1, 1, b);
			b.pageIndex = index1;
			this.controls.splice(index2, 1, a);
			a.pageIndex = index2;
			return true;
		}
		refresh();
	} else {
		alert("You are currently editing another object, please complete the edit before adding a new object");
	}
};

// Generates HTML for the application example display
Application.prototype.generateDisplaySample = function() {
	var object = this;
	var div = $(document.createElement("div"));
	var pages = $(document.createElement("div"));
	
	/*div.attr("class", "application");
	div.append("<h1>" + this.name + "</h1>");
	pages.attr("class", "pages");*/
	
	// Append pages
	for(var i = 0; i < this.pages.length; i++) {
		pages.append(this.pages[i].generateDisplaySample());
	}
	div.append(pages);
	
	/*// Make the div sortable
	pages.sortable();
	pages.disableSelection();*/
	
	// Append CP
	div.prepend(controlPanel(["addpage"]));
	div.find(".addpage:first").click(function() {object.addPage();});
	//div.find(".editapplication:first").click(function() {editObject(object.createEditForm().generateHTML(object));});
	
	return div;
};

// Generates XML for the application
Application.prototype.generateXML = function() {
	var app = $("<application>");
	app.attr("name", this.name);
	
	// Append controls
	for(var i = 0; i < this.pages.length; i++) {
		app.append(this.pages[i].generateXML());
	}
	
	return app;
};

// Reads in an application from an XML file
Application.prototype.readXML = function(xmlString) {
	var xml = $(xmlString);
	var app = this;
	
	// Process each page in the XML
	this.pages = [];
	xml.find("page").each(function() {
		// Add basic page information
		app.addPage();
		var curPage = app.pages[app.pages.length - 1]
		curPage.label = $(this).attr("label");
		
		processChildren(curPage, $(this));
	});
};

// Helper function for readXML: Processes the children of a node
function processChildren(container, element) {
	element.children().each(function() {
		var control = null;
		switch(this.nodeName.toLowerCase()) {
			case "text":
				control = new TextBox();
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				break;
			case "radio":
				control = new Radio();;
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				control.choices = [];
				$(this).find("choice").each(function() {
					control.choices.push($(this).text());
				});
				break;
			case "section":
				control = new Section();
				control.label = $(this).attr("label");
				processChildren(control, $(this));
				break;
			case "dropdown":
				control = new DropDown();
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				control.multiple = ($(this).attr("multiple") == "multiple");
				control.choices = [];
				$(this).find("choice").each(function() {
					control.choices.push($(this).text());
				});
				break;
			case "checkbox":
				control = new CheckBox();
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				control.choices = [];
				$(this).find("choice").each(function() {
					control.choices.push($(this).text());
				});
				break;
			case "file":
				control = new File();
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				break;
			case "time-chart":
				control = new TimeChart();
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				control.startHour = $(this).attr("start");
				control.endHour = $(this).attr("end");
				control.value = $(this).attr("value");
				break;
			case "ckeditor":
				control = new CKEditor();
				control.name = $(this).attr("name");
				control.label = $(this).attr("label");
				control.required = ($(this).attr("required") == "yes");
				break;
		}
		if(control != null) container.addControl(control);
	});
}

// Event Trigger for application refresh
Application.prototype.onRefresh = function() {};

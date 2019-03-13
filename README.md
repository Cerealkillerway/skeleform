      ___________          .__          _____
     /   _____/  | __ ____ |  |   _____/ ____\___________  _____
     \_____  \|  |/ // __ \|  | _/ __ \   __\/  _ \_  __ \/     \
     /        \    <\  ___/|  |_\  ___/|  | (  <_> )  | \/  Y Y  \
    /_______  /__|_ \\___  >____/\___  >__|  \____/|__|  |__|_|  /
            \/     \/    \/          \/                        \/

### 0 INTRO

**Skeleform** package is part of the **Skeletor** project and is not meant be used alone.

Inside a Skeletor app this package is used to build and validate forms; it supports a large number of field types and options and it's extensible.
It is built on top of Skeletor and MaterializeCSS.
If you have any problem using it, please have a look to the "troubleshooting" section at the bottom.


### 1 SCHEMA OPTIONS

- **__collection**: *[string] (required)* name of collection that is manipulated by this form;
- **__subManager**: *[string] (optional)* name of the subscription manager to use;
- **__toolbar**: *[object] (optional)*
    - **template**: *[string] (optional)* name of alternative template to use as a toolbar; it receives the skeleform's data context as data context;
    - **containerId**: *[string] (optional/available only if "template"option is used)* id of DOM element to place the toolbar in;
    - **extrasCreate**: *[string] (optional)* template for extra buttons to be added to standard create toolbar;
    - **extrasUpdate**: *[string] (optional)* template for extra buttons to be added to standard update toolbar;
- **printFunctions**: *[object] (optional)* if defined *skeleform* will enable print functionalities for forms created from the current schema;
    - **printPreviewContainer**: *[string] (optional)* a string representing a jquery selector of the element where to append the skeleform's print area; if omitted the print area is appended directly below the form itself;
- **__autoScrollTop**: *[boolean] (optional)* by default every skeleform instance auto scrolls to `offset = 0` inside `onRendered`; set this property to false to disable this behavior;
- **__autoFocusFirst**: *[boolean] (optional)* by default every skeleform instance auto focus on the first input element inside `onRendered`; set this property to false to disable this behavior;
- **__paths**: *[object] (optional)* dictionary of paths to be used in different situations:
    - **undoPath**: *[string, object] (required)* specify the path to be used for cancel button; the string is the path definition (can contain ":" params), and the object is the params dictionary (NOT optional, pass empty object if no params are needed); the string 'this' used as a value in params object means that the value must be taken from skeleform's gathered data object. For itemLang param, the value 'auto' means that it is taken from the current route's URL;
    - **redirectOnCreate**: *[string, object] (optional)* specify the path to be used as a redirect after a succesful create; the string is the path definition (can contain ":" params), and the object is the params dictionary (NOT optional, pass empty object if no params are needed); the string 'this' used as a value in params object means that the value must be taken from skeleform's gathered data object. For itemLang param, the value 'auto' means that it is taken from the current route's URL; (default behaviour: clean the form and be ready for a new document);
    - **redirectOnUpdate** : *[string, Object] (optional)* specify the path to be used as a redirect after a succesful update; the string is the path definition (can contain ":" params), and the object is the params dictionary (NOT optional, pass empty object if no params are needed); the string `this` used as a value in params object means that the value must be taken from skeleform's gathered data object. For itemLang param, the value 'auto' means that it is taken from the current route's URL; (default behaviour: stay on the same page);
- **__options**:
    - **loadingModal** *[boolean] (optional)*: if true use a loading modal while performing skeleform operations; default to false;
    - **tracked**: *[boolean] (optional)* if true save to each document data about user and timestamp of creation and last update; default to false;
- **__methods**: *[object] (optional)* a dictionary of custom methods that skeleform and skelelist will use to create, update, delete documents on this schema; (default to standard skeleform methods)
    - **create**: *[string] (optional)* nane of custom method to be called for new documents creation (default to `skeleCreateDocument`);
    - **update**: *[string] (optional)* name of custom method to be called when updating a document (default to `skeleUpdateDocument`);
    - **delete**: *[string] (optional)* name of custom method to be called for deleting documents (default to `skeleDeleteDocument`);
- **__listView**: *[object] (optional)* skelelist options; see the **Skelelist package**'s *readme* for details;
- **fields**: *[Array of Objects] (mandatory)* each object in this array represents a field that can have the properties listed in paragraph 2.1 (common options) and following (field type specific options);
- **extraFieldsAllowed**: *[Array of Objects] (optional)* each object in this array contains name and validation rules for extra fields (computed, dynamically added...) that, if not listed here, will be rejected by validation...
- **formCallbacks**: *[object] (optional)* dictionary of callbacks executed on the form;
    - **onRendered(currentDocument, formInstance)**: *[function] (optional)* callback fired when the form is rendered; it receives the currentDocument (if any) and the form instance as arguments;
    - **beforeSave(formDataContext, gatheredValue)**: *[function] (optional)* callback executed just before saving (before creating and before updating) the form; it receives the form's data context and the values of all form's field gathered by Skeleform;
    - **onClose(currentDocument, formInstance)**: *[function] (optional)* callback fired when the form is destroyed: it receives the currentDocument (if any) and the form instance as arguments;

### 2 SCHEMA FIELDS OPTIONS

#### 2.1 Generic options (available for all kind of fields)

- **__listView**: *[object] (optional)* options for the field in the list view; see the **Skelelist package**'s *readme* for details;
- **name**: *[String] (required)* the name of the field **(MUST be an UNIQUE identifier)**;
- **output**: *[String] (required)* form element (available valuse: *"none", "container", "staticTitle", "input", "checkBox", "editor", "select", "datePicker", "timePicker", "clockPicker"*);
- **i18n**: *[boolean] (optional)* specify that the field will be prefixed with *"<:currentLang>---"*; this identifies the field as internationalized; by default the option is enabled; you should use this option only if you want to set it to false; (default *true*);
- **size**: *[string] (optional)* materialize's grid system classes; default to *"s12 m6"*;
- **style**: *[string] (optional)* wrapper css class for custom styling of the field;
- **callbacks**: *[object] (optional)* dictionary of callbacks;
    - **onChange(value, fieldInstance)**: *[function] (optional)* a callback to be performed when the value of the field changes; it receives the field's value and the field's instance as parameters;
    - **onCreated(fieldInstance)**: a callback fired when the field is created; it receives the field's instance as parameter;
    - **onRendered(fieldInstance)**: a callback fired when the field has finished rendering; it receives the field's instance as parameter;
- **validation**: *[object]* set the validation rules:
    - **type**: *[string] (optional)* validation match (available values: *"string", "number", "email", "url", "date", "time"*); **IMPORTANT**: *"date"* and *"time"* are validated against the plugin's *"formatSubmit"*;
    - **min**: *[number] (optional)* minimun length; if the value returned by the field is an object, this parameter is referred to the number of its properties; setting min to 1 on a boolean field (ex. checkbox) is interpreted as "field required"; any other value is ignored for those kind of fields;
    - **max**: *[number] (optional)* maximum length; if the value returned by the field is an object, this parameter is referred to the number of its properties; on input fields this will automatically set the "maxLength" property on the html `<input>` tag;
    - **unique**: *[boolean / string] (optional)* specifies that field's value should be unique; can be true/false or 'autoset', that means that if unicity validation fails, a random id is appended to the field's value to make it unique; **Important**: the 'autoset' option is available only for *input* fields;
    - **ignoreCaseForUnicity**: *[boolean] (optional)* if set to *true* the unicity check will be case insensitive; default *false*;
    - **collectionForUnicityCheck**: *[string] (optional)* the collection where to perform unicity check for the field; if omitted, the unicity check is performed against schema's *__collection*;
    - **showErrorOn**: *[string / array of strings]* the name (or array of names) of another field where to show errors relative of this field; this is useful if the current field is hidden and generated starting from other fields values (for example a hidden url-slug parameter generated dasherizing the field "name"; setting this to "name" will show validation errors for the url-slug field, that is invisible, on the "name" field, that is visible);
    - **showErrorFor**: *[string / array of strings]* the name (or array of names) of special error.reason(s) that needs to be displayed on this field; this will handle special errors not due to field's validation rules (for example "Email already exists." error when creating a new meteor user);
- **showOnly**: *[string ('create'/'update')] (optional)* defines if the field should be rendered only on creation or only on update; **IMPORTANT**: this option can be set also on a *skeleformGroup* object and will take effect on all fields of the group;
- **replicaSet**: *[object] (optional)* defines the group as a replica set; that means that the field(s) will be replicable by the user who will be able to add or remove copies of this field(s);
  *Important:* this option doesn't work on a single field, but only on a skeleformGroup; if you need a single replicable field, you should define it inside a skeleformGroup.
  - **name**: *[string] (mandatory)* the name for the replica set; must be unique in the form;
  - **i18n**: *[boolean] (optional)* specify that the field will be prefixed with *"<:currentLang>---"*; this identifies the field as internationalized; by default the option is enabled; you should use this option only if you want to set it to false; (default *true*);
  - **template**: *[string] (optional)* the name of the template to be used for replica actions; by default it's "skeleformDefaultReplicaBtns", a built-in template that will render a "+" and "-" buttons, that will make possible for the user to add or remove copies of the replica set;
  - **minCopies**: *[number] (optional)* the minimum number of copies of the replica set allowed (default *1*);
  - **maxCopies**: *[number] (optional)* the maximum number of copies of the replica set allowed (default *infinite*);
  - **initCopies**: *[number] (optional)* the number of copies of the replica set to include in the form during the first render (default *1*);
  - **indexes**: *[boolean] (optional)* if set to true will update a DOM element with class `skeleformReplicaIndex` within each replica with its current positional order; this is useful if you want to show the positional order of each set in the replica set; the DOM element with class `skeleformReplicaIndex` is added automatically;
  - **sortable**: *[boolean] (optional)* makes the replica set sortable;
  - **setClasses**: *[array of strings] (optional)* array of classes to use on the replica set's container div;
  - **frameClasses**: *[array of strings] (optional)* array of classes to use on each replica item;
- **mapTO:** *[function] (optional)* used to map the field's name property to another name in the database; the function receives the `fieldInstance` as a parameter and must return a string that is the name used for the field in the database;

#### 2.2 Field specific options:

Other than the previous options, each field can have specific options depending on its *output* type:

#### 2.2.1 none

A filed with `output: "none"` will not be displayed (and so it's never gathered or validated by **Skeleform**);
this is just for debug purposes (to temporarily disable a field);


#### 2.2.2 container

Creates a container `<div>` (empty); it's useful for putting into it any runtime-generated data you want to dynamically add to the form's DOM.
- **classes**: *[array of strings] (optional)* array of classes to use on the *tag*;

#### 2.2.3 staticTitle

Displays a non-editable string; useful to create titles, subtitles, ...

- **subscription**: *[function]* this function offers the chance to subscribe to data needed by the field and not already subscribed by the parent template; it receives the field's instance as a parameter and must return a ready handle;
- **tag**: *[string] (optional)* the tag to use to wrap the title (default `<h3>`);
- **classes**: *[array of strings] (optional)* array of classes to use on the *tag*;
- **labelType**: *[string] (optional)* defines the suffix used for the lookup of the label's i18n string (default *_lbl*; available values: `title` for *_title*, `text` for *text*);
- **content**: *[function] (optional)* a function that receives the field's instance as a parameter and returns the value to be displayed for the field; if undefined the value displayed is created from `labelType` and `name` properties;

#### 2.2.4 input

- **icon**: *[string] (optional)* materialize's icon class;
- **renderAs**: *[string] (optional)* type of input field to render (available values: *"password", "text", "textarea", "date"*, ...); default to "text"; when using the *"password"* option, the field is not gathered for submit if left empty; **IMPORTANT**: when using *"password"* option don't set *"max"* validation option, since the value is hashed with sha256 (becomes longer);
- **shadowConfirm**: *[boolean] (optional)* activates a "re-type" input field that invalidates if its value is not the same of the main field (ex.: to be used with renderAs: "password"); default to "false";
- **formatAs**: *[string] (optional)* specific format to use for the field's data (available values: *"currency", "float" , "integer"*); default to *"undefined"*;
- **autoNumericOptions**: *[object] (optional)* dictionary of parameters for autonumeri plugin (used if "formatAs" is defined); list of available plugin's options: [autonumeric website](http://autonumeric.org/guide), plugin's guide: [autonumeric github page](https://github.com/autoNumeric/autoNumeric/blob/master/README.md);
- **autoRange**: *[boolean] (optional)* autoselect inner text when reached the max length defined for this field (default *false*);
- **charCounter**: *[number] (optional)* enables the materializeCSS's character counter plugin; **IMPORTANT**: the character counter does not set the *"maxlength"* property on the input (this is done by using validation -> max);
- **autocomplete**: *[object] (optional)* dictionary of options for the autocomplete plugin;
    - **maxHeight**: *[string] (optional)* a css value for maxHeight property of the suggstions' container (default `301px`);

    - **showOnFocus**: *[boolean] (optional)* decides if the suggestion list should be opened also when the input gets the focus, while normally it's shown only when the user types in (default false);

    - **data**: *[array of objects/function] (required)* data source for the autocomplete plugin; it can be an array of objects or a function that returns an array of objects (in this case the function is re-executed every time the input's value is changed by the user); it receives as parameters the current field's value, the current input box's value and the field's instance;
      each object in the array can have the following properties:

        - **name**: *[string] (required)* the name displayed in the suggestions list;
        - **value**: *[string] (optional)* the value that will be used to fill the input when user selects the suggestion; if no value is provided, `name` will be used instead;
        - **icon**: *[string] (optional)* a google material design icon's name to display next of the suggestion's text;
        - **image**: *[string] (optional)* path to an image that will be displayed before the suggestion's text (should be square);

      if data is a function that requires a subscription to get some documents, it should return an object with the following properties:

      -   **subscription**: *[subscription handle] (required)* the subscription handle of the required subscription;
      -   **onReadyCallback**: *[function] (required)* a function the returns the actual data (an array of objects with the properties listed above);

      this will ensure that *Skeleform* will properly wait the subscription to be ready before executing the *onReadyCallback*; it will also add a loading bar to the suggestions panel to show the load in progress;

    - **getName**: *[function] (optional)* if defined this function is called for every value when setting it on the field to retrieve the name to show for the selected value (if different from the value itself); the function receives the current value as parameter; if  this function is `undefined` the value is used also as name; if the data for the name to display comes from other documents, you should subscribe here to that data and put the desired return value in the *onReady* callback of the subscription;


#### 2.2.5 checkBox

- **renderAs**: *[string] (optional)* type of boolean selector to display (available values: *"checkbox", "switch"*); default to *"checkbox"*;
- **labels**: *[object] (optional)* to be used with *renderAs: "switch"*; can contain 2 (optionals) keys (*"on", "off"*) containing the two strings to be used as i18n strings for the respectives switch states; if it's not provided, the default *"yes_lbl"* and *"no_lbl"* are used;
    - **on**: *[string] (optional)* i18n string for switch *"on"* state (default *"yes_lbl"*; note that *"_lbl"* is appended automatically);
    - **off**: *[string] (optional)* i18n string for switch *"off"* state (default *"no_lbl"*; note that *"_lbl"* is appended automatically);


#### 2.2.6 editor

- **staticOffset**: *[integer]* (optional) specifies the offset (in pixels) for the static bar function of the editor; useful if the current view already has another static and the editor's bar need to stack after it;
- **toolbar**: *[string] (optional)* specifies the toolbar to use (available values: *"minimal", "default", "full"*);
- **height**: *[integer] (optional)* the pre-setted editor's height in pixels (default 400);
- **minHeight**: *[integer] (optional)* the pre-setted editor's minimum height in pixels (default 100);
- **image**: *[object] (optional)* an object that defines parameters to be used while inserting images:
    - **quality**: *[float 0 ~ 1] (optional)* the quality of jpeg created;
    - **width**: *[integer] (optional)* with of the image created;
    - **height**: *[integer] (optional)* height of the image created;
- **video**: *[object] (optional)* an object that defines parameters to be used while embeeding videos:
    - **width**: *[integer] (optional)* width of the video frame;
    - **height**: *[integer] (optional)* height of the video frame;

#### 2.2.7 select

-   **subscription**: *[function]* this function offers the chance to subscribe to data needed by the field and not already subscribed by the parent template; it receives the field's instance as a parameter and must return a ready handle;
-   **source**: *[array of objects / mongo cursor / function] (required)* data source for options; it receives the field's instance as a parameter and must return an array of objects used to create the options of the field; the array can come from:

- - **possibility 1** *[array of objects]* an hard-coded array of objects; each object should be in this form:
    ​    - **label**: *[string] (required)* the i18n string to be used when displaying the option;
    ​    - **value**: *[string/numeric/boolean] (required)* the value to be used for the option;
    ​    - **image**: *[string] (optional)* path to the image to be used for the option;
    ​    - **imageClasses**: *[array of strings] (optional)* a list of classes to assign to the option's image;
    - **possibility 2**: *[mongo cursor]* a cursor from a query on a mongo collection;
    - **possibility 3**: *[function]* a function returning an array of objects or a mongo cursor; it receives the fieldInstance as a parameter;
- **sourceValue**: *[string] (required if "source" is of type 2 or 3)* the name of the documents' field to be used as value in the option; it is possible to use the segment *":itemLang---"* that will be translated into the current language prefix;
- **sourceName**: *[string] (required if "source" is of type 2 or 3)* the name of the documents' field to be used as display name in the option; it is possible to use the segment *":itemLang---"* that will be translated into the current language prefix;
- **sourceNameTransformation**: *[object] (optional)* can contain two methods: *transform* and *antiTransform*, explained below;
    - **transform(value, item)**: *[function] (required if *sourceNameTransformation* is defined)* a callback executed on every source's item; it receives the current *sourceName*'s value and the current item; transforms the value to be displayed in another form;
    - **antiTransform()** TO IMPLEMENT...
- **icons**: *[boolean] (optional)* used to assign *"icons"* class for icons on options dropdown; **IMPORTANT**: it is required to be *true* if source is of type *1* and "icon" is setted on its elements;
- **allowBlank**: *[boolean] (optional)* allow select none (default 'none' option is created automatically);
- **blankValue**: *[string] (optional)* set the value to use for the default 'none' option (default: `''`, `undefined` and `null` are not allowed);
- **multi**: *[boolean] (optional)* defines the select as a *"multiple select"*; default to *false*;

**note**: if you want to dinamically add options to a select field, then you need to re-initialize the materialize's plugin by calling `material_select()` on it.


#### 2.2.8 datePicker

- **icon**: *[string] (optional)* materialize's icon class;
- **pickerOptions**: *[object] (optional)* dictionary of init options to override when starting the pickadate plugin (more info at http://amsul.ca/pickadate.js/date/);


#### 2.2.9 timePicker

- **icon**: *[string] (optional)* materialize's icon class;
- **pickerOptions**: *[object] (optional)* dictionary of init options to override when starting the pickatime plugin (more info at http://amsul.ca/pickadate.js/time);


#### 2.2.10 clockPicker

- **icon**: *[string] (optional)* materialize's icon class;
- **pickerOptions**: *[object] (optional)* dictionary of init options to override when starting the clockpicker plugin (more info at https://github.com/weareoutman/clockpicker and https://github.com/chingyawhao/materialize-clockpicker);


#### 2.2.11 imageUpload

This type of field automatically tests that the selected file(s) matches an image type;

- **icon**: *[string] (optional)* materialize's icon class;
- **iconClasses**: *[string / array of strings] (optional)* class(es) to be used on the icon (default to 'left');
- **placeholder**: *[string] (optional)* a i18n string to be used as placeholder in the input field;
- **multiple**: *[boolean] (optional)* enable the file chooser to select multiple files at once (default false);
- **thumbnail**: *[object] (optional)* dictionary of options for the thumbnail(s) to be created for selected images;
    - **width**: *[number] (optional)* the width in pixels for the image thumbnail (default to 200);
    - **height**: *[number] (optional)* the height in pixels for the image thumbnail (default to 200);
- **image**: *[object] (optional)* dictionary of options for the image(s) to be uploaded;
    - **maxWidth**: *[number] (optional)* max width in pixels for the image to be uploaded (default to 1000);
    - **maxHeight**: *[number] (optional)* max height in pixels for the image to be uploaded (default to 1000);
    - **quality**: *[number 0~1] (optional)* the quality used for dataUrl conversion of the image (default 1);

#### 2.2.12 list

Used to display a list of eventually sortable items using [sortablejs](https://github.com/SortableJS/Sortable) plugin;

-   **subscription**: *[function]* this function offers the chance to subscribe to data needed by the field and not already subscribed by the parent template; it receives the field's instance as a parameter and must return a ready handle;

-   **source**: *[array of objects / mongo cursor / function] (required)* data source for options; must be an array of objects used to create the options of the field; it receives the field's instance as a parameter;

-   **value**: [function / object] (required) if an object, tells skeleform which one is the value of `source` property to use as `data-id` attribute for every source's item; this is the value that will be gathered from skeleform and saved in the db; it has the following properties:

    -   **name**: *[string] (required)* the name of a filed of every item returned by `source` to be used as `data-id`;

    if a function, should return the value to be used as `data-id` for each item in the list; the function receives two parameters: the `fieldInstance` and `sourceData` (the current item's source data);

-   **displayValues**: *[function] (mandatory)* a function that receives the template instance and returns an array of objects; every object can have the following properties:
    -   **name**: *[string] (mandatory alternative to value)* the name of an attribute from the elements of `source` that will be displayed in the template;
    -   **value**: *[string] (mandatory alternative to name)* a value to display for each element of `source`;
    -   **isIcon**: *[boolean] (optional)* tells if the current source element's value is a material icon's name (default to false);
    -   **transform** *[function] (optional)* a function that receives the current value and the fieldInstance and returns the value to be displayed;

-   **emptyLabel**: *[string] (optional)* the name of an i18n string to be displayed when the list is empty (default "empty_lbl");

-   **sortable**: *[boolean]* decides if the list is sortable;

-   **dragHandle**: *[string] (optional)* name of a material design's icon to use as drag handle; (default to "drag_handle");

#### 2.2.13 chart

Organizes data in charts using [chartist](https://gionkunz.github.io/chartist-js/getting-started.html) plugin;

-   **subscription**: *[function]* this function offers the chance to subscribe to data needed by the field and not already subscribed by the parent template; it receives the field's instance as a parameter and must return a ready handle;
-   **source**: *[array of objects / mongo cursor / function] (required)* data source for options; must be an array of objects used to create the options of the field; it receives the field's instance as a parameter;

### 3 SKELEFORMGROUP (DISPLAYING INLINE)

By default every field is wrapped in a `<div class="row">`, but it's possible to display two or more fields in the same row by wrapping them into an object in the schema; this object must have this form:

- **skeleformGroup**: *[boolean] (mandatory)* indicates that the object represents a group of inline fields (*true* is the only value possible);
- **size**: *[string] (optional)* materialize's grid system classes; by default the group does not create any column and inside of it each field creates its own;
- **id**: *[string] (optional)* an optional id to assign to the skeleformGroup's `.row` wrapper div;
- **classes**: *[array] (optional)* array of custom classes for the group's div container;
- **fields**: *[array] (optional)* the normal schema of the fields to be displayed in the same row;


### 4 CUSTOM FIELDS CREATION

Every field in *Skeleform* must implement this methods:

- **i18n(currentLang)**: *[function] (optional)* special handling required for i18n on the field; it receives the *"currentLang"* as a parameter;
- **getValue()**: *[function] (mandatory)* must return the value of the field (formatted and ready to be saved in the db); if the field has *"shadowConfirm"* set to *true*, this method must return an object with two keys:
    - **standard**: *[any] (required)* the normal field's value;
    - **shadow**: the shadow-field's value;
- **isValid()**: *[function] (mandatory)* must perform validation on the field's value; it is called by skeleform before gathering values to be saved in the db; normally this is done by calling `Skeleform.validate.checkOptions()` from this method;
- **setValue(value)**: *[function] (mandatory)* receives the current unformatted field value; must format it to be displayed (if required) and set it on the proper *DOM* element of the field;

Inside these methods (and everywhere in the field's code) calling `Skeleform.utils.$getFieldById(templateInstance, schema)` is the preferred way to get the jQuery object wrapping the DOM of the main field's input element.

Every field must register itself by calling `Skeleform.utils.registerField(this)` inside the `onCreated` callback.
Every field must initialize a reactive var called `isActivated` in the `onCreated` callback and set it `true` when the field finished rendering.
So wrapping up the above, every field `onCreated` callback should look like:

```javascript
Template.myCustomFieldName.onCreated(function() {
	Skeleform.utils.registerField(this);
    this.isActivated = new ReactiveVar(false);
    
    let fieldSchema = this.data.fieldSchema.get();
    
    //(...)
    this.getValue = () => {
       //(...)
    };
    
    this.isValid = () => {
        //usual way:
        let formContext = this.data.formContext;
        
        return Skeleform.validate.checkOptions(this.getValue(), fieldSchema, formContext.schema, formContext.item);
    };
        
    this.setValue = (value) => {
        //(...)
    };
        
    //(...)
});
```

`skeleformGeneralHelpers` is a dictionary of common helpers usually used by all fields; so it will probably needed by every custom field:

```
Template.myCustomFieldName.helpers(skeleformGeneralHelpers)
```

Outside from the skeleform package the general helpers are available as `Skeletor.Skeleform.helpers.skeleformGeneralHelpers`.

The `onRendered` callback is the right place to initialize any required external plugin on the field.
Finally, when destroyed the field must unregister from the form instance, this way:

```javascript
Template.myCustomFieldName.onDestroyed(function() {
   let fields = this.data.formContext.fields;
    
   fields.removeAt(fields.indexOf(this));
});
```




### 5 TIPS ABOUT THE CALLBACKS

#### 5.1 UPDATE FIELD VALUES

If you want to update another field's value from within a field's callback, you should call the `setValue()` method on that field's instance;
for convenience there is a function you can use to get a field's instance by name: `Skeletor.SkeleUtils.GlobalUtilities.getFieldInstance(formContext, fieldName)`; the formContext it's accessible from any fieldInstance in this way: `fieldInstance.data.formContext`;

**Ex.:**
In this example we will update the value of `username` field from within the `userId`'s `onChange` callback.

```javascript
{
    name: 'userId',
    output: 'input',
    i18n: false,
    callbacks: {
        onChange: function(value, fieldInstance) {
            let userDocument = Skeletor.Data.Users.findOne({_id: value});

            // setting the value on the formInstance's item object will reactively
            // update the value of the 'username' field
            Skeletor.SkeleUtils.GlobalUtilities.getFieldInstance(fieldInstance.data.formContext, 'username').setValue(userDocument.username)
        }
    }
}
```

#### 5.2 UPDATE FIELD SCHEMAS

Sometimes you need to alter some field(s) schema(s) at runtime;
you can always access all field(s) properties starting from a `fieldInstance` and update any of them; it's all reactive;

Let' say that in the `userId.onChange` callback just seen here above you need to update the schema of the `email` field to make it required;  
The schema of every fiels is wrapped inside a reactive var, that means that calling `set()` on it will cause the rerun of every function that uses 'get()' from it; in other words setting a new value on a field' schema will re-render it;

As seen above, the *SkeleUtils* package, that is part of the *Skeletor* project (as *Skeleform* is) has an handy function to retrieve a fieldInstance starting from the formContext (accessible from within any fieldInstance at `fieldInstance.data.formContext`) called `SkeleUtils.GlobalUtilities.getFieldInstance()`; *SkeleUtils* is exported by *Skeletor* so it's accessible from within your app by calling `Skeletor.Skeleutils`; so our example would be:

```javascript
{
    name: 'userId',
    output: 'input',
    i18n: false,
    callbacks: {
        onChange: function(value, fieldInstance) {
            let emailField = Skeletor.SkeleUtils.GlobalUtilities.getFieldInstance(fieldInstance.data.formContext, 'email');
            let emailSchema = emailField.data.fieldSchema.get();

            // make the field required reactively
            emailSchema.validation = {min: 3};

            // set the new schema (this will refresh the field)
            emailField.data.fieldSchema.set(emailSchema);
        }
    }
}
```

#### 5.3 AVAILABLE SKELEFORM FUNCTIONS

It is also possible to call some *Skeleform*'s functions if needed:

#### `Skeletor.Skeleform.validate.skeleformResetStatus(fieldName)`  
resets validation classes on the field;  
**parameters**
- *fieldName*: [string] the name of the field to be resetted; (accessible from the *fieldInstance* at `fieldInstance.data.schema.name`);  

#### `Skeletor.Skeleform.validate.skeleformSuccessStatus(fieldName, fieldSchema)`  
sets valid class on the field (eventually resets its invalid state);  
**parameters**
- *fieldName*: [string] the name of the field to be resetted; (accessible from the *fieldInstance* at `fieldInstance.data.schema.name`);
- *schema*: [object] the field's schema (accessible from the *fieldInstance* at `fieldInstance.data.schema`);

#### `Skeletor.Skeleform.validate.skeleformErrorStatus(name, errorString, schema)`  
sets invalid class on the field and shows error (eventually resets its valid state);  
**parameters**
- *fieldName*: [string] the name of the field to be resetted; (accessible from the *fieldInstance* at `fieldInstance.data.schema.name`);
- *errorString*: [string] a string describing the validation error occurred;
- *schema*: [object] the field's schema (accessible from the *fieldInstance* at `fieldInstance.data.schema`);

### 6 VALIDATION

The method `isValid()` defined on every field (`fieldInstance.isValid()`) should perform the field's validation when required and return a *"result"* object with this form:

- **valid**: *[boolean] (mandatory)* if the field's current value is valid or not;
- **reasons**: *[array of strings] (mandatory)* a set of strings describing the validity checks failed (should match the name of *validation types* (see *validation -> type*));

The `Skeleform.validate.checkOptions()` global function is the standard way to perform validity check; it implements all needed *type*, *length* and *unicity* checks;


##### 6.1 CUSTOM INVALID MESSAGE

If it's necessary to use a custom invalid message it is possible to add the field *"invalidMessages"* to the "result" object returned by `isValid()`;

- **invalidMessages**: *[object] (optional)* should be a dictionary of custom i18n strings to use for each validation type;


### 7 ABOUT METHODS

Skeleforms invokes a **Meteor method** once gathered and validated the form's data to persist it on the server;  
It is set to use 3 default methods for the 3 basic operations:

- `skeleCreateDocument`: for new documents creation;
- `skeleUpdateDocument`: for updating documents;
- `skeleDeleteDocument`: for deleting documents;

These methods, before doing the actual document creation, update or delete perform the followings:

 - call `SkeleUtils.Permissions.checkPermissions()` to check that the current user have the right permissions to perform the operation;
 - for create or update, validate the collected data against the schema; this provide a client and server-side security check on the data to be saved;
 - if required add the "tracked" objects to store informations about the current action (see `__options.tracked` in the **schema options** - chapter 1);

### 8 TROUBLESHOOTING

Experimenting errors in your form? Try the followings:

- double check that every field has a different **"name"** property; different fields with the same name can lead to errors and anyway your data will be incomplete in this case.
- double check your schema structure and that you have included all required keys for every form and field objects.

- write an issue ;)

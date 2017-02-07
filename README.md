      ___________          .__          _____
     /   _____/  | __ ____ |  |   _____/ ____\___________  _____
     \_____  \|  |/ // __ \|  | _/ __ \   __\/  _ \_  __ \/     \
     /        \    <\  ___/|  |_\  ___/|  | (  <_> )  | \/  Y Y  \
    /_______  /__|_ \\___  >____/\___  >__|  \____/|__|  |__|_|  /
            \/     \/    \/          \/                        \/

#### INTRO
**Skeleform** package is part of the **Skeletor** project and is not meant be used alone.

Inside a Skeletor app this package is used to build and validate forms; it supports a large number of field types and options and it's extensible.
It is built on top of Skeletor and MaterializeCSS.
If you have any problem using it, please have a look to the "troubleshooting" section at the bottom.

#### MPORTANT NOTES

Please remember the followings:

** In this version i18n fields MUST be on the top level (i18n nested fields are NOT supported); **


### SCHEMA OPTIONS

- **__collection**: *[string] (required)* name of collection that is manipulated by this form;
- **__toolbar**: *[object] (optional)*
- - **template**: *[string] (optional)* name of alternative template to use as a toolbar; it receives the skeleform's data context as data context;
- - **containerId**: *[string] (optional/available only if "template"option is used)* id of DOM element to place the toolbar in;
- - **extrasCreate**: *[string] (optional)* template for extra buttons to be added to standard create toolbar;
- - **extrasUpdate**: *[string] (optional)* template for extra buttons to be added to standard update toolbar;
- **__autoScrollTop**: *[boolean] (optional)* by default every skeleform instance auto scrolls to `offset = 0` inside `onRendered`; set this property to false to disable this behavior;
- **__autoFocusFirst**: *[boolean] (optional)* by default every skeleform instance auto focus on the first input element inside `onRendered`; set this property to false to disable this behavior;
- **__paths**: *[object] (optional)* dictionary of paths to be used in different situations:
- - **undoPath**: *[string, object] (required)* specify the path to be used for cancel button; the string is the path definition (can contain ":" params), and the object is the params dictionary (NOT optional, pass empty object if no params are needed); the string 'this' used as a value in params object means that the value must be taken from skeleform's gathered data object. For itemLang param, the value 'auto' means that it is taken from the current route's URL;
- - **redirectOnCreate**: *[string, object] (optional)* specify the path to be used as a redirect after a succesful create; the string is the path definition (can contain ":" params), and the object is the params dictionary (NOT optional, pass empty object if no params are needed); the string 'this' used as a value in params object means that the value must be taken from skeleform's gathered data object. For itemLang param, the value 'auto' means that it is taken from the current route's URL; (default behaviour: clean the form and be ready for a new document);
- - **redirectOnUpdate** : *[string, Object] (optional)* specify the path to be used as a redirect after a succesful update; the string is the path definition (can contain ":" params), and the object is the params dictionary (NOT optional, pass empty object if no params are needed); the string 'this' used as a value in params object means that the value must be taken from skeleform's gathered data object. For itemLang param, the value 'auto' means that it is taken from the current route's URL; (default behaviour: stay on the same page);
- **__options**:
- - **loadingModal** *[boolean] (optional)*: if true use a loading modal while performing skeleform operations; default to false;
- - **tracked**: *[boolean] (optional)* if true save to each document data about user and timestamp of creation and last update; default to false;
- **__listView**: *[object] (optional)* skelelist options; see the **Skelelist package**'s *readme* for details;
- **fields**: *[Array of Objects] (mandatory)* each object in this array represents a field that can have the following properties:
- **formCallbacks**: *[object] (optional)* dictionary of callbacks executed on the form;
- - **onRendered(currentDocument, formInstance)**: *[function] (optional)* callback fired when the form is rendered; it receives the currentDocument (if any) and the form instance as arguments;
- - **beforeSave(formDataContext, gatheredValue)**: *[function] (optional)* callback executed just before saving (before creating and before updating) the form; it receives the form's data context and the values of all form's field gathered by Skeleform;

### SCHEMA FIELDS OPTIONS

#### Generic options (available for all kind of fields)

- **__listView**: *[object] (optional)* options for the field in the list view; see the **Skelelist package**'s *readme* for details;
- **name**: *[String] (required)* the name of the field **(MUST be an UNIQUE identifier)**;
- **output**: *[String] (required)* form element (available valuse: *"none", "staticTitle", "input", "checkBox", "editor", "select", "datePicker", "timePicker", "clockPicker"*);
- **i18n**: *[boolean] (optional)* specify that the field will be prefixed with *"<:currentLang>---"* object; (default *true*);
- **size**: *[string] (optional)* materialize's grid system classes; default to *"s12 m6"*;
- **callbacks**: *[object] (optional)* dictionary of callbacks;
- - **onChange(value, fieldInstance)**: *[function] (optional)* a callback to be performed when the value of the field changes; it receives the field's value and the field's instance as parameters;
- - **onCreated(fieldInstance)**: a callback fired when the field is created (on the field component's onCreated callback); it receives the field's instance as parameter;
- **validation**: *[object]* set the validation rules:
- - **type**: *[string] (optional)* validation match (available values: *"string", "number", "email", "url", "date", "time"*); **IMPORTANT**: *"date"* and *"time"* are validated against the plugin's *"formatSubmit"*;
- - **min**: *[number] (optional)* minimun length; if the value returned by the field is an object, this parameter is referred to the number of its properties; setting min to 1 on a boolean field (ex. checkbox) is interpreted as "field required"; any other value is ignored for those kind of fields;
- - **max**: *[number] (optional)* maximum length; if the value returned by the field is an object, this parameter is referred to the number of its properties; on input fields this will automatically set the "maxLength" property on the html `<input>` tag;
- - **unique**: *[boolean] (optional)* specifies that field's value should be unique;
- - **ignoreCaseForUnicity**: *[boolean] (optional)* if set to *true* the unicity check will be case insensitive; default *false*;
- - **collectionForUnicityCheck**: *[string] (optional)* the collection where to perform unicity check for the field; if omitted, the unicity check is performed against schema's *__collection*;
- **style**: *[string] (optional)* wrapper css class for custom styling of the field;
- **showOnly**: *[string ('create'/'update')] (optional)* defines if the field should be rendered only on creation or only on update; **IMPORTANT**: this option can be set also on a *skeleformGroup* object and will take effect on all fields of the group;
- **replicaSet**: *[object] (optional)* defines the field (or the group) as a replica set; that means that the field(s) will be replicable by the user who will be able to add or remove copies of this field(s);
- - **name**: *[string] (mandatory)* the name for the replica set; must be unique in the form;
- - **template**: *[string] (optional)* the name of the template to be used for replica actions; by default it's "skeleformDefaultReplicaBtns", a built-in template that will render a "+" and "-" buttons, that will make possible for the user to add or remove copies of the replica set;
- - **minCopies**: *[number] (optional)* the minimum number of copies of the replica set allowed (default *1*);
- - **maxCopies**: *[number] (optional)* the maximum number of copies of the replica set allowed (default *infinite*);
- - **initCopies**: *[number] (optional)* the number of copies of the replica set to include in the form during the first render (default *1*);

#### Field specific options:

Other than the previous options, each field can have specific options depending on its *output* type:

##### none

A filed with `output: "none"` will not be displayed (and so it's never gathered or validated by **Skeleform**)

##### staticTitle

- **tag**: *[string] (optional)* the tag to use to wrap the title (default `<h3>`);
- **classes**: *[array of strings] (optional)* array of classes to use on the *tag*;

##### input

- **icon**: *[string] (optional)* materialize's icon class;
- **renderAs**: *[string] (optional)* type of input field to render (available values: *"password", "text", "textarea"*); default to "text"; when using the *"password"* option, the field is not gathered for submit if left empty; **IMPORTANT**: when using *"password"* option don't set *"max"* validation option, since the value is hashed with sha256 (becomes longer);
- **shadowConfirm**: *[boolean] (optional)* activates a "re-type" input field that invalidates if its value is not the same of the main field (ex.: to be used with renderAs: "password"); default to "false";
- **formatAs**: *[string] (optional)* specific format to use for the field's data (available valuse: *"currency", "float"*); default to *"undefined"*;
- **autoRange**: *[boolean] (optional)* autoselect inner text when reached the max length defined for this field (default *false*);
- **charCounter**: *[number] (optional)* enables the materializeCSS's character counter plugin; **IMPORTANT**: the character counter does not set the *"maxlength"* property on the input (this is done by using validation -> max);


##### checkBox

- **renderAs**: *[string] (optional)* type of boolean selector to display (available values: *"checkbox", "switch"*); default to *"checkbox"*;
- **labels**: *[object] (optional)* to be used with *renderAs: "switch"*; can contain 2 (optionals) keys (*"on", "off"*) containing the two strings to be used as i18n strings for the respectives switch states; if it's not provided, the default *"yes_lbl"* and *"no_lbl"* are used;
- - **on**: *[string] (optional)* i18n string for switch *"on"* state (default *"yes_lbl"*; note that *"_lbl"* is appended automatically);
- - **off**: *[string] (optional)* i18n string for switch *"off"* state (default *"no_lbl"*; note that *"_lbl"* is appended automatically);


##### editor

- **toolbar**: *[string] (optional)* specifies the toolbar to use (available values: *"minimal", "default", "full"*);
- **image**: *[object] (optional)* an object that defines parameters to be used while inserting images:
- - **quality**: *[float 0 ~ 1] (optional)* the quality of jpeg created;
- - **width**: *[integer] (optional)* with of the image created;
- - **height**: *[integer] (optional)* height of the image created;
- **video**: *[object] (optional)* an object that defines parameters to be used while embeeding videos:
- - **width**: *[integer] (optional)* width of the video frame;
- - **height**: *[integer] (optional)* height of the video frame;


##### select

- **source**: *[array of objects / mongo cursor] (required)* data source for options; must be an array of objects used to create the options of the field;each element of the array can be:
- - **possibility 1** *[object]* an object with these fields:
- - - **name**: *[string] (required)* the i18n string to be used when displaying the option;
- - - **value**: *[string/numeric/boolean] (required)* the value to be used for the option;
- - - **icon**: *[string] (optional)* path to the icon to be used for the option;
- - **possibility 2**: a document from a query on a mongo collection;
- **sourceValue**: *[string] (required if "source" is of type 2)* the name of the documents' field to be used as value in the option; it is possible to use the segment *":itemLang---"* that will be translated into the current language prefix;
- **sourceName**: *[string] (required if "source" is of type 2)* the name of the documents' field to be used as display name in the option; it is possible to use the segment *":itemLang---"* that will be translated into the current language prefix;
- **sourceNameTransformation**: *[object] (optional)* can contain two methods: *transform* and *antiTransform*, explained below;
- - **transform(value, item)**: *[function] (required if *sourceNameTransformation* is defined)* a callback executed on every source's item; it receives the current *sourceName*'s value and the current item; transforms the value to be displayed in another form;
- -  **antiTransform()** TO IMPLEMENT...
- **icons**: *[boolean] (optional)* used to assign *"icons"* class for icons on options dropdown; **IMPORTANT**: it is required to be *true* if source is of type *1* and "icon" is setted on its elements;
- **allowBlank**: *[boolean] (optional)* allow select none (default undefined option is created automatically); this options is meant to be used only if "source" is of type 2; otherwise is ignored, since with type 1 you can manually define the *"blank option"* in the array used as *"source"*;
- **multi**: *[boolean] (optional)* defines the select as a *"multiple select"*; default to *false*;

##### datePicker

- **icon**: *[string] (optional)* materialize's icon class;
- **pickerOptions**: *[object] (optional)* dictionary of init options to override when starting the pickadate plugin (more info at http://amsul.ca/pickadate.js/date/);


##### timePicker

- **icon**: *[string] (optional)* materialize's icon class;
- **pickerOptions**: *[object] (optional)* dictionary of init options to override when starting the pickatime plugin (more info at http://amsul.ca/pickadate.js/time);

##### clockPicker
- **icon**: *[string] (optional)* materialize's icon class;
- **pickerOptions**: *[object] (optional)* dictionary of init options to override when starting the clockpicker plugin (more info at https://github.com/weareoutman/clockpicker and https://github.com/chingyawhao/materialize-clockpicker);

##### imageUpload

(WORK IN PROGRESS...)
- can have options (image, thumb) that decides what will be created and uploaded [object]; both are objects with these properties:
- - [float 0 ~ 1] the quality of jpeg created
- - width [integer]
- - height [integer]

#### DISPLAYING INLINE

By default every field is wrapped in a `<div class="row">`, but it's possible to display two or more fields in the same row by wrapping them into an object in the schema; this object must have this form:

- **skeleformGroup**: *[boolean] (mandatory)* indicates that the object represents a group of inline fields (*true* is the only value possible);
- **size**: *[string] (optional)* materialize's grid system classes; by default the group does not create any column and inside of it each field creates its own;
- **classes**: *[array] (optional)* array of custom classes for the group's div container;
- **fields**: *[array] (optional)* the normal schema of the fields to be displayed in the same row;

### CUSTOM FIELDS CREATION

Every field in *Skeleform* must implement this methods:

- **i18n(currentLang)**: *[function] (optional)* special handling required for i18n on the field; it receives the *"currentLang"* as a parameter;
- **getValue()**: *[function] (mandatory)* must return the value of the field (formatted and ready to be saved in the db); if the field has *"shadowConfirm"* set to *true*, this method must return an object with two keys:
- - **standard**: *[any] (required)* the normal field's value;
- - **shadow**: the shadow-field's value;
- **isValid()**: *[function] (mandatory)* must perform validation on the field's value; it is called by skeleform before gathering values to be saved in the db; normally this is done by calling `Skeleform.validate.checkOptions()` from this method;
- **setValue(value)**: *[function] (mandatory)* receives the current unformatted field value; must format it to be displayed (if required) and set it on the proper *DOM* element of the field;

Inside these methods (and everywhere in the field's code) calling `$getFieldById(templateInstance, schema)` is the preferred way to get the jQuery object wrapping the DOM of the main field's input element.

### VALIDATION

The method `isValid()` should perform the field's validation when required and return a *"result"* object with this form:

- **valid**: *[boolean] (mandatory)* if the field's current value is valid or not;
- **reasons**: *[array of strings] (mandatory)* a set of strings describing the validity checks failed (should match the name of *validation types* (see *validation -> type*));

The `Skeleform.validate.checkOptions()` global function is the standard way to perform validity check; it implements all needed *type*, *length* and *unicity* checks;

##### CUSTOM INVALID MESSAGE

If it's necessary to use a custom invalid message it is possible to add the field *"invalidMessages"* to the "result" object;

- **invalidMessages**: *[object] (optional)* should be a dictionary of custom i18n strings to use for each validation type;

### OTHER THAN SCHEMA

Skeleforms invokes a **Meteor method** once gathered and validated the form's data; the method persists the data on the server; it is set to use a default method that will persist your data as a new document in the collection defined on the schema; anyway it is possible to make it call a custom method;
the metod to use is not defined on the schema but is part of the data context passed to the skeleform instance.
Ex.: the *userCreate* template:

    Template.userCreate.helpers({
        data: function() {
            const instance = Template.instance();
            let context = {};
            let username = FlowRouter.getParam('username');

            if (username && instance.skeleSubsReady.get()) {
                context.item = Skeletor.Data.Users.findOne({username: username});
                context.item.userEmail = context.item.emails[0].address;
            }

            context.schemaName = 'Users_default';
            context.schema = Skeletor.Schemas.Users_default;
            context.methods = {
                insert: 'insertUser',
                update: 'updateUser'
            };
            context.skeleSubsReady = instance.skeleSubsReady;

            return context;
        }
    });

it provides *methods* object in the data context; than the template will invoke **Skeleform** passing that data context to it:

    {{> skeleform data}}

### TROUBLESHOOTING

Experimenting errors in your form? Try the followings:

- double check that every field has a different **"name"** property; different fields with the same name can lead to errors and anyway your data will be incomplete in this case.
- double check your schema structure and that you have included all required keys for every form and field objects.

- write an issue ;)

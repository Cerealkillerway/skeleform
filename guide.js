// Schemas examples and guide
// schemas are defined using a standard javascript object
Schemas = {
  Roles_default: {
        __collection: "Roles",
        name: {
            type: "text",
            output: "input",
            min: 3,
            max: 50,
            unique: true
        }
    },
};

/* 
GUIDE
================================
SCHEMA OPTIONS:
--------------------------------
__collection: name of collection that is manipulated by this form [string]
__toolbar: (optional) name of alternative template to use as a toolbar [string] (default skeleformCreate/UpdateButtons)

SCHEMA FIELDS OPTIONS
--------------------------------
output: form element [input, editor, select, imageUpload, datePicker, password, multiSelectLabels]
    
    Field specific options:
    ------------------------------
    input: icon -> materialize's icon class [string]
           renderAs -> type of input field to render [string] (password, text); default to "text";
                       when using the "password" option, the field is not gathered for submit if left empty;
                       IMPORTANT: when using "password" option don't set max length, since the value is hashed with sha256 (becomes longer);
           shadowConfirm -> [boolean] activates a re-type input field that invalidates if its value is not equal (ex.: to be used with renderAs: "password");
           formatAs -> specific format to use for the field's data [string] (currency, float, undefined); default to undefined

    editor: toolbar -> specifies the toolbar to use (minimal, default, full) [string]
            image -> an object that defines parameters to be used while inserting images [object]:
                    -> quality [float 0 ~ 1] the quality of jpeg created
                    -> width [integer]
                    -> height [integer]
            video -> an object that defines parameters to be used while embeeding videos [object]:
                    -> width [integer]
                    -> height [integer]

    select: source -> data source for options; must be an array of objects with name and value fields [array]

    imageUpload: can have options (image, thumb) that decides what will be created and uploaded [object]; both are objects with these properties:
                        -> quality [float 0 ~ 1] the quality of jpeg created
                        -> width [integer]
                        -> height [integer]

    datePicker: icon -> materialize's icon class [string]
                startDate -> [object] is an object that define the initial date used by the popup calendar; can have these properties: (optional)
                                    -> year [integer] 
                                    -> month [integer] (optional), default to 1
                                    -> day [integer] (optional), default to 1

    multiSelectLabels -> source is the data origin for options (must be an array of objects with at least the properties used as sourceValue and sourceName)
                      -> sourceValue is the attribute name of source to use as value
                      -> sourceName is the attribte name of source to use as text

Common options:
-------------------------------
i18n: specify that the field will be nested under "currentLang" object; (default true)
size: materialize's grid system classes [string]; default to "s12 m6"
type: validation match (string, number, email, url, date) [string]
min: optional minimun length [number]; if the value returned by the field is an object, this parameter is referred to the number of its properties
max: optional maximum length [number]; if the value returned by the field is an object, this parameter is referred to the number of its properties
unique: specifies that field's value should be unique [true]
style: wrapper css class for custom styling of the field [string]
*/

Package.describe({
    name: 'cerealkiller:skeleform',
    version: '2.18.1',
    summary: 'form from schema creator',
    // URL to the Git repository containing the source code for this package.
    git: '',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    // namespace
    api.addFiles('namespace.js');

    api.versionsFrom('METEOR@1.6.1');

    // dependencies
    api.use([
        'session',
        'jquery',
        'fourseven:scss@4.5.4',
        'cerealkiller:materialnote@2.0.0',
        'blaze-html-templates@1.1.2'
    ],
    ['client']);

    api.use([
        'check',
        'ecmascript',
        'underscore',
        'cerealkiller:skeleutils@2.0.0',
        'cerealkiller:skeletor@3.0.0'
    ],
    ['client', 'server']);

    // styles
    api.addFiles([
        'styles/skeleform.scss',
        'styles/_clockpicker.primary.scss',
        'styles/_file-uploader.scss'
    ],
    ['client']);

    // templates
    api.addFiles([
        'templates/skeleform.html',
        'templates/skeleformToolbars.html',
        'templates/components/skeleformReplicaSet.html',
        'templates/test/skelePanelTest.html',
        'templates/toolbars/createButtons.html',
        'templates/toolbars/updateButtons.html',
        'templates/toolbars/printFunctions.html',
        'formComponents/templates/skeleformDatePicker.html',
        'formComponents/templates/skeleformEditor.html',
        'formComponents/templates/ckMaterialNotePlugins.html',
        'formComponents/templates/skeleformImageUpload.html',
        'formComponents/templates/skeleformInput.html',
        'formComponents/templates/skeleformSelect.html',
        'formComponents/templates/skeleformStaticTitle.html',
        'formComponents/templates/skeleformCheckBox.html',
        'formComponents/templates/skeleformTimePicker.html',
        'formComponents/templates/skeleformClockPicker.html',
        'formComponents/templates/skeleformContainer.html'
    ],
    ['client']);

    // libraries
    api.addFiles([
        'lib/editEvents.js',
        'lib/autoNumeric.js',
        'lib/utils.js',
        //'lib/materialize.clockpicker.js',
        //'lib/timepickersConflictResolver.js',
        //'lib/picker.time.js',
        //'lib/jquery.multi-select.js',

        'events/skeleformEvents.js',
        'events/toolbarsEvents.js',
        'events/toolbars/createButtonsEvents.js',
        'events/toolbars/updateButtonsEvents.js',
        'events/toolbars/printFunctionsEvents.js',
        'events/components/replicaSetEvents.js',
        'events/testEvents.js',

        'helpers/commonHelpers.js',
        'helpers/skeleformHelpers.js',
        'helpers/components/replicaSetHelpers.js',
        'helpers/skeleformToolbarsHelpers.js',
        'helpers/toolbars/createButtonsHelpers.js',
        'helpers/toolbars/updateButtonsHelpers.js'
    ],
    ['client']);

    api.addFiles(['lib/validate.js'], ['client', 'server']);

    // form components
    api.addFiles([
        'formComponents/lib/skeleformDatePicker.js',
        'formComponents/lib/skeleformEditor.js',
        'formComponents/lib/skeleformImageUpload.js',
        'formComponents/lib/skeleformInput.js',
        'formComponents/lib/skeleformSelect.js',
        'formComponents/lib/skeleformStaticTitle.js',
        'formComponents/lib/skeleformCheckBox.js',
        'formComponents/lib/skeleformTimePicker.js',
        'formComponents/lib/skeleformClockPicker.js',
        'formComponents/lib/skeleformContainer.js'
    ],
    ['client']);

    // assets
    api.addAssets([
        'public/icons/ok.png',
        'public/icons/cancel.png'
    ],
    ['client']);


    // exports
    api.export(['Skeleform']);
});

Npm.depends({
    'sortablejs': '1.7.0'
});

Package.onTest(function(api) {
    api.use([
        'tinytest',
        'cerealkiller:skeleform'
    ]);

    api.addFiles(['skeleform-tests.js']);
});

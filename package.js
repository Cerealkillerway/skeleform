Package.describe({
    name: 'cerealkiller:skeleform',
    version: '2.17.17',
    summary: 'form from schema creator',
    // URL to the Git repository containing the source code for this package.
    git: '',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    // namespace
    api.addFiles('namespace.js');

    // dependencies
    api.use([
        'session',
        'jquery',
        'fourseven:scss',
        'cerealkiller:materialnote@2.0.0',
        'blaze-html-templates'
    ],
    ['client']);

    api.use([
        'check',
        'ecmascript',
        'underscore@1.0.0',
        'cerealkiller:skeleutils',
        'cerealkiller:skeletor'
    ],
    ['client', 'server']);

    // styles
    api.addFiles([
        'styles/skeleform.scss',
        'styles/_clockpicker.primary.scss',
        'styles/_multi-select.scss'
    ],
    ['client']);

    // templates
    api.addFiles([
        'templates/skeleform.html',
        'templates/components/skeleformDefaultReplicaBtns.html',
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
        //'lib/materialize.clockpicker.js',
        //'lib/timepickersConflictResolver.js',
        //'lib/picker.time.js',
        'lib/jquery.multi-select.js',
        'helpers/commonHelpers.js',
        'helpers/skeleformHelpers.js',
        'events/skeleformEvents.js',
        'events/componentsEvents.js'
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

Package.onTest(function(api) {
    api.use([
        'tinytest',
        'cerealkiller:skeleform'
    ]);

    api.addFiles(['skeleform-tests.js']);
});

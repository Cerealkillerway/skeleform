Package.describe({
    name: 'cerealkiller:skeleform',
    version: '4.1.12',
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
        'blaze-html-templates@1.1.2',
        'ostrio:i18n@3.1.0'
    ],
    ['client']);

    api.use([
        'check',
        'ecmascript',
        'underscore',
        'cerealkiller:skeleutils',
        'cerealkiller:skeletor'
    ],
    ['client', 'server']);

    // styles
    api.addFiles([
        'styles/skeleform.scss'
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
        'templates/toolbars/timeMachineFunctions.html',
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
        'formComponents/templates/skeleformContainer.html',
        'formComponents/templates/skeleformList.html',
        'formComponents/templates/skeleformChart.html',
        'formComponents/templates/skeleformButton.html'
    ],
    ['client']);

    // libraries
    api.addFiles([
        'lib/editEvents.js',
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
        'events/toolbars/timeMachineEvents.js',
        'events/components/replicaSetEvents.js',
        'events/testEvents.js',

        'helpers/commonHelpers.js',
        'helpers/skeleformHelpers.js',
        'helpers/components/replicaSetHelpers.js',
        'helpers/skeleformToolbarsHelpers.js',
        'helpers/toolbars/createButtonsHelpers.js',
        'helpers/toolbars/updateButtonsHelpers.js',
        'helpers/toolbars/timeMachineHelpers.js'
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
        'formComponents/lib/skeleformContainer.js',
        'formComponents/lib/skeleformList.js',
        'formComponents/lib/skeleformChart.js',
        'formComponents/lib/skeleformButton.js'
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
    'sortablejs': '1.7.0',
    'autonumeric': '4.5.1',
    'chart.js': '2.7.3'
});

Package.onTest(function(api) {
    api.use([
        'tinytest',
        'cerealkiller:skeleform'
    ]);

    api.addFiles(['skeleform-tests.js']);
});

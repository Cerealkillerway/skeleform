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
    api.addFiles(['namespace.js'], ['client', 'server']);

    api.versionsFrom('METEOR@1.8.0.2');

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
        'templates/components/skeleform-replica-set.html',
        'templates/test/skele-panel-test.html',
        'templates/toolbars/create-buttons.html',
        'templates/toolbars/update-buttons.html',
        'templates/toolbars/print-functions.html',
        'templates/toolbars/time-machine-functions.html',
        'formComponents/templates/skeleform-date-picker.html',
        'formComponents/templates/skeleform-editor.html',
        'formComponents/templates/skeleform-image-upload.html',
        'formComponents/templates/skeleform-input.html',
        'formComponents/templates/skeleform-select.html',
        'formComponents/templates/skeleform-static-title.html',
        'formComponents/templates/skeleform-checkbox.html',
        'formComponents/templates/skeleform-time-picker.html',
        'formComponents/templates/skeleform-clock-picker.html',
        'formComponents/templates/skeleform-container.html',
        'formComponents/templates/skeleform-list.html',
        'formComponents/templates/skeleform-chart.html',
        'formComponents/templates/skeleform-button.html'
    ],
    ['client']);

    // libraries
    api.addFiles([
        'lib/edit-events.js',
        'lib/utils.js',

        'events/skeleform-events.js',
        'events/toolbars-events.js',
        'events/toolbars/create-buttons-events.js',
        'events/toolbars/update-buttons-events.js',
        'events/toolbars/print-functions-events.js',
        'events/toolbars/time-machine-events.js',
        'events/components/replica-set-events.js',
        'events/test-events.js',

        'helpers/common-helpers.js',
        'helpers/skeleform-helpers.js',
        'helpers/components/replica-set-helpers.js',
        'helpers/skeleform-toolbars-helpers.js',
        'helpers/toolbars/create-buttons-helpers.js',
        'helpers/toolbars/update-buttons-helpers.js',
        'helpers/toolbars/time-machine-helpers.js'
    ],
    ['client']);

    api.addFiles([
        'lib/validate.js'
    ],
    ['client', 'server']);

    // form components
    api.addFiles([
        'formComponents/lib/skeleform-date-picker.js',
        'formComponents/lib/skeleform-editor.js',
        'formComponents/lib/skeleform-image-upload.js',
        'formComponents/lib/skeleform-input.js',
        'formComponents/lib/skeleform-select.js',
        'formComponents/lib/skeleform-static-title.js',
        'formComponents/lib/skeleform-checkBox.js',
        'formComponents/lib/skeleform-time-picker.js',
        'formComponents/lib/skeleform-clock-picker.js',
        'formComponents/lib/skeleform-container.js',
        'formComponents/lib/skeleform-list.js',
        'formComponents/lib/skeleform-chart.js',
        'formComponents/lib/skeleform-button.js'
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

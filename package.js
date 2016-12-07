Package.describe({
    name: 'cerealkiller:skeleform',
    version: '0.9.6',
    // Brief, one-line summary of the package.
    summary: 'form from schema creator',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
    // namespace
    api.addFiles('namespace.js');

    // packages
    api.use('jquery', 'client');
    api.use('underscore@1.0.0');
    api.use('check');
    api.use('fourseven:scss@3.2.0', 'client');
    api.use('tap:i18n@1.7.0');
    api.use('cerealkiller:materialnote@1.0.0', 'client');
    api.use('blaze-html-templates', 'client');
    api.use('materialize:materialize@=0.97.7', 'client');
    api.use('cerealkiller:utils@1.0.0');
    // if skeletor is in use, load it before
    api.use('cerealkiller:skeletor@0.0.3', {weak: true});

    // exports
    api.export('Skeleform');   // package namespace

    // styles
    api.addFiles('styles/skeleform.scss', 'client');


    // templates
    api.addFiles('templates/skeleform.html', 'client');
    api.addFiles('formComponents/templates/skeleformDatePicker.html', 'client');
    api.addFiles('formComponents/templates/skeleformEditor.html', 'client');
    api.addFiles('formComponents/templates/ckMaterialNotePlugins.html', 'client');
    api.addFiles('formComponents/templates/skeleformImageUpload.html', 'client');
    api.addFiles('formComponents/templates/skeleformInput.html', 'client');
    api.addFiles('formComponents/templates/skeleformSelect.html', 'client');
    api.addFiles('formComponents/templates/skeleformStaticTitle.html', 'client');


    // i18n
    api.addFiles('i18n/it.i18n.json');
    api.addFiles('i18n/en.i18n.json');


    // libraries
    api.addFiles('lib/jquery.alterClass.js', 'client');
    api.addFiles('lib/validate.js');
    api.addFiles('lib/editEvents.js', 'client');
    api.addFiles('lib/autoNumeric.js', 'client');

    api.addFiles('helpers/commonHelpers.js', 'client');
    api.addFiles('helpers/skeleformHelpers.js', 'client');

    api.addFiles('events/skeleformEvents.js', 'client');

    api.addFiles('formComponents/lib/skeleformDatePicker.js', 'client');
    api.addFiles('formComponents/lib/skeleformEditor.js', 'client');
    api.addFiles('formComponents/lib/skeleformImageUpload.js', 'client');
    api.addFiles('formComponents/lib/skeleformInput.js', 'client');
    api.addFiles('formComponents/lib/skeleformSelect.js', 'client');
    api.addFiles('formComponents/lib/skeleformStaticTitle.js', 'client');

    // assets
    api.addAssets('public/icons/ok.png', 'client');
    api.addAssets('public/icons/cancel.png', 'client');
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('cerealkiller:skeleform');
    api.addFiles('skeleform-tests.js');
});




// UTILITIES
// get list of all files in a folder
function getFilesFromFolder(packageName, folder){
    // local imports
    var _ = Npm.require("underscore");
    var fs = Npm.require("fs");
    var path = Npm.require("path");
    // helper function, walks recursively inside nested folders and return absolute filenames
    function walk(folder){
        var filenames = [];
        // get relative filenames from folder
        var folderContent=fs.readdirSync(folder);
        // iterate over the folder content to handle nested folders
        _.each(folderContent,function(filename){
            // build absolute filename
            var absoluteFilename=folder + path.sep + filename;
            // get file stats
            var stat=fs.statSync(absoluteFilename);
            if (stat.isDirectory()){
                // directory case => add filenames fetched from recursive call
                filenames=filenames.concat(walk(absoluteFilename));
            }
            else {
                // file case => simply add it
                filenames.push(absoluteFilename);
            }
        });
        return filenames;
    }
    // save current working directory (something like "/home/user/projects/my-project")
    var cwd = process.cwd();
    // chdir to our package directory
    process.chdir("packages" + path.sep + packageName);
    // launch initial walk
    var result = walk(folder);
    // restore previous cwd
    process.chdir(cwd);
    return result;
}

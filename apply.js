var PLUGIN_NAME = "cordova-plugin-androidx-adapter";
var ARTIFACT_MAPPINGS_FILE = "artifact-mappings.json";
var CLASS_MAPPINGS_FILE = "class-mappings.json";
var SRC_PATH = "./platforms/android/app/src/main";
var BUILD_GRADLE_PATH = "./platforms/android/app/build.gradle";
var PROJECT_PROPERTIES_PATH = "./platforms/android/project.properties";
var MANIFEST_PATH = "./platforms/android/app/src/main/AndroidManifest.xml";
var TARGET_FILE_REGEX = /(\.java|\.xml)/;

var deferral, fs, path, perf_hooks, recursiveDir;

function log(message) {
    console.log(PLUGIN_NAME + ": " + message);
}

function onFatalException(ex){
    log("EXCEPTION: " + ex.toString());
    deferral.resolve(); // resolve instead of reject so build doesn't fail
}

function run() {
    try {
        fs = require('fs');
        path = require('path');
        recursiveDir = require("recursive-readdir");
        perf_hooks = require('perf_hooks');
    } catch (e) {
        throw("Failed to load dependencies: " + e.toString());
    }

    var startTime = perf_hooks.performance.now();

    var artifactMappings = JSON.parse(fs.readFileSync(path.join(__dirname, '.', ARTIFACT_MAPPINGS_FILE)).toString()),
        buildGradle = fs.readFileSync(BUILD_GRADLE_PATH).toString(),
        projectProperties = fs.readFileSync(PROJECT_PROPERTIES_PATH).toString(),
        androidManifest = fs.readFileSync(MANIFEST_PATH).toString();

    // Replace artifacts in build.gradle, project.properties & AndroidManifest.xml
    for (var oldArtifactName in artifactMappings) {
        var newArtifactName = artifactMappings[oldArtifactName];
        buildGradle = replaceArtifact(buildGradle, oldArtifactName, newArtifactName);
        projectProperties = replaceArtifact(projectProperties, oldArtifactName, newArtifactName);
    }
    fs.writeFileSync(BUILD_GRADLE_PATH, buildGradle, 'utf8');
    fs.writeFileSync(PROJECT_PROPERTIES_PATH, projectProperties, 'utf8');

    var classMappings = JSON.parse(fs.readFileSync(path.join(__dirname, '.', CLASS_MAPPINGS_FILE)).toString());

    // Replace class/package names in AndroidManifest.xml
    for (var oldClassName in classMappings){
        androidManifest = replaceClassName(androidManifest, oldClassName, classMappings[oldClassName]);
    }
    fs.writeFileSync(MANIFEST_PATH, androidManifest, 'utf8');

    // Replace class/package names in source code
    recursiveDir(SRC_PATH, [function(file, stats){
        if(stats.isDirectory()){
            return false;
        }
        return !file.match(TARGET_FILE_REGEX);
    }], attempt(function(err, files){
        if(err) throw err;

        for(var filePath of files){
            var fileContents = fs.readFileSync(filePath).toString();
            for (var oldClassName in classMappings){
                fileContents = replaceClassName(fileContents, oldClassName, classMappings[oldClassName]);
            }
            fs.writeFileSync(filePath, fileContents, 'utf8');
        }
        log("Processed " + files.length + " source files in " + parseInt(perf_hooks.performance.now() - startTime) + "ms");
        deferral.resolve();
    }));
}

function replaceArtifact(target, oldName, newName){
    return target.replace(new RegExp(sanitiseForRegExp(oldName) + ':[0-9.+]+', 'gm'), newName);
}

function replaceClassName(target, oldName, newName){
    oldName = '(?:'+sanitiseForRegExp(oldName)+')([^a-zA-Z0-9]+)';
    return target.replace(new RegExp(oldName, 'g'), newName+'$1');
}

function sanitiseForRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function attempt(fn) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            onFatalException(e);
        }
    }
}

module.exports = function (ctx) {
    try{
        deferral = require('q').defer();
    }catch(e){
        e.message = 'Unable to load node module dependency \'q\': '+e.message;
        onFatalException(e);
        throw e;
    }
    attempt(run)();
    return deferral.promise;
};

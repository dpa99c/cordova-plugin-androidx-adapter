var PLUGIN_NAME = "cordova-plugin-androidx-adapter";
var ARTIFACT_MAPPINGS_FILE = "artifact-mappings.json";
var CLASS_MAPPINGS_FILE = "class-mappings.json";
var JAVA_SRC_PATH = "./platforms/android/app/src/main/java";
var BUILD_GRADLE_PATH = "./platforms/android/app/build.gradle";

var deferral, fs, path, now, recursiveDir;

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
        now = require("performance-now")
    } catch (e) {
        throw("Failed to load dependencies: " + e.toString());
    }

    var startTime = now();

    var buildGradle = fs.readFileSync(BUILD_GRADLE_PATH).toString(),
        artifactMappings = JSON.parse(fs.readFileSync(path.join(__dirname, '.', ARTIFACT_MAPPINGS_FILE)).toString());

    for(var oldName in artifactMappings){
        var oldRegExpStr = sanitiseForRegExp(oldName) + '[^"]+';
        var newName = artifactMappings[oldName];
        buildGradle = buildGradle.replace(new RegExp(oldRegExpStr, 'gm'), newName);
    }
    fs.writeFileSync(BUILD_GRADLE_PATH, buildGradle, 'utf8');

    var classMappings = JSON.parse(fs.readFileSync(path.join(__dirname, '.', CLASS_MAPPINGS_FILE)).toString());
    recursiveDir(JAVA_SRC_PATH, [function(file, stats){
        return !file.match(".java");
    }], attempt(function(err, files){
        if(err) throw err;

        for(var filePath of files){
            var fileContents = fs.readFileSync(filePath).toString();
            for (var oldName in classMappings){
                fileContents = fileContents.replace(new RegExp(oldName, 'g'), classMappings[oldName]);
            }
            fs.writeFileSync(filePath, fileContents, 'utf8');
        }
        log("Processed " + files.length + " Java source files in " + parseInt(now() - startTime) + "ms");
        deferral.resolve();
    }));
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

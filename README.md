cordova-plugin-androidx-adapter
===============================

Cordova/Phonegap plugin to migrate any code which references the legacy [Android Support Library](https://developer.android.com/topic/libraries/support-library/index) to the new [AndroidX](https://developer.android.com/jetpack/androidx/migrate) mappings in a Cordova Android platform project.

This enables a Cordova project for which AndroidX has been enabled (e.g. using [cordova-plugin-androidx](https://github.com/dpa99c/cordova-plugin-androidx) to successfully build even if it contains plugins which reference the legacy Support Library.

The plugin uses a hook script to replace any legacy Support Library Gradle artifact references in the `build.gradle` with the new [artifact mappings](https://developer.android.com/jetpack/androidx/migrate#artifact_mappings) and any legacy Support Library package name references in the Java source code with the new [class mappings](https://developer.android.com/jetpack/androidx/migrate#class_mappings).

# Requirements

This plugin requires a minimum of [`cordova@9`](https://github.com/apache/cordova-cli) and [`cordova-android@8`](https://github.com/apache/cordova-android).
 
# Installation

    $ cordova plugin add cordova-plugin-androidx-adapter
    
**IMPORTANT:** This plugin relies on a [Cordova hook script](https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/) so will not work in Cloud Build environments such as Phonegap Build which do not support Cordova hook scripts. 

**WARNING**: Do not install this plugin in a Cordova project in which AndroidX has not already been installed or the build will fail.
    
# Usage

Once the plugin is installed it will run on each `after_prepare` hook in the Cordova build lifecycle, scanning and migrating any references to legacy Support Library entries in the `build.gradle` or Java source code.
 
Note: this plugin operates only during the build process and contains no code which is bundled with or executed inside of the resulting Android app produced by the Cordova build process.

# Enabling AndroidX

If AndroidX is not already enabled in your Cordova project you can persistently enable it in your Cordova Android platform project by installing my [cordova-plugin-androidx](https://github.com/dpa99c/cordova-plugin-androidx) plugin.

License
================

The MIT License

Copyright (c) 2019 Dave Alden / Working Edge Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

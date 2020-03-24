#!/usr/bin/env node
'use strict';

const path = require('path'),
    { mkdir, tempdir, rm, cp, cat, touch, test } = require('shelljs');

const mktemp = () => {
    const file = path.join(tempdir(), 'ghc-' + Math.random().toString(16).slice(2).padStart(16, '0'));

    touch(file);

    return file;
}

let PLUGINGEN = mktemp(),
    ESCAPEDPLUGIN = mktemp(),
    WRAPPEDPLUGIN = mktemp(),
    DEFAULTINIT = mktemp(),
    MAINJSFILE = backupAndGetMainJs();

function generateFiles(shape, color, out) {
    out = path.join(__dirname, out);
    mkdir('-p', out);

    cat(path.join(__dirname, 'js', 'plugin.js'))
        .sed(/CSSSHAPEURL/g, shape)
        .sed(/CSSCOLORURL/g, color)
        .to(path.join(PLUGINGEN));

    cat(PLUGINGEN)
        .sed(/\\/g, '\\\\')
        .to(ESCAPEDPLUGIN);

    cat(path.join(__dirname, 'js', 'electron_code_wrapper.js'))
        .sed(/(CODEHERE)/, '$1\n' + cat(ESCAPEDPLUGIN).toString())
        .to(WRAPPEDPLUGIN);

    cat(MAINJSFILE, WRAPPEDPLUGIN)
        .to(path.join(out, 'main.js'));

    cat(path.join(__dirname, 'js', 'gmonkeyscript_template.js'), PLUGINGEN)
        .to(path.join(out, 'gmonkeyscript.js'));
};

function backupAndGetMainJs() {
    let mainFile = getMainJs(),
        appDir = path.dirname(mainFile),
        pkg = require(path.join(appDir, 'package.json')),
        backupFile = path.join(appDir, `main-v${pkg.version}.js`);

    if (!test('-e', backupFile)) {
        cp(mainFile, backupFile);
    }

    return backupFile;
}





function getAppPath() {
    var targetDir;

    switch (process.platform) {
        case 'darwin':
            targetDir = '/' + path.join('Applications', 'Chat.app', 'Contents');
            break;
        case 'win32':
            targetDir = path.join(process.env.LOCALAPPDATA, 'Google', 'Hangouts Chat');
            break;
        default:
            targetDir = path.join(os.homedir(), '.' + this.pkg.name);
            break;
    }

    return targetDir;
}


function getMainJs() {
    const appDir = getAppPath();

    switch (process.platform) {
        case 'darwin':
            return path.join(appDir, 'Resources', 'app', 'main.js');
        case 'win32':
            return path.join(appDir, 'resources', 'app', 'main.js');
        default:
            return '';
    }
}

generateFiles(
    "https:\/\/raw.githubusercontent.com\/paveyry\/better-hangoutschat\/master\/css\/shape.css",
    "https:\/\/raw.githubusercontent.com\/paveyry\/better-hangoutschat\/master\/css\/color_slack.css",
    "out/slacktheme"
);

generateFiles(
    "https:\/\/raw.githubusercontent.com\/paveyry\/better-hangoutschat\/master\/css\/shape.css",
    "",
    "out/ghctheme"
);

generateFiles(
    "https:\/\/raw.githubusercontent.com\/paveyry\/better-hangoutschat\/master\/css\/shape.css",
    "https:\/\/raw.githubusercontent.com\/paveyry\/better-hangoutschat\/master\/css\/color_dark.css",
    "out/darktheme"
);

rm('-rf', [DEFAULTINIT, PLUGINGEN, ESCAPEDPLUGIN, WRAPPEDPLUGIN]);

cp(
    path.join(__dirname, 'out', 'ghctheme', 'main.js'),
    path.join('C:', 'Users', 'roger', 'AppData', 'Local', 'Google', 'Hangouts Chat', 'resources', 'app', 'main.js')
);
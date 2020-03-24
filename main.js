#!/usr/bin/env node
'use strict';

const path = require('path'),
    { mkdir, tempdir, rm, sed, cat, touch } = require('shelljs');

const mktemp = () => {
    const file = path.join(tempdir(), 'ghc-' + new Date().getTime());

    touch(file);

    return file;
}

let PLUGINGEN = mktemp(),
    ESCAPEDPLUGIN = mktemp(),
    WRAPPEDPLUGIN = mktemp(),
    DEFAULTINIT = mktemp(),
    MAINJSFILE = getMainJs();

function generateFiles(shape, color, out) {
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

function getMainJs() {
    return path.join('C:', 'Users', 'roger', 'AppData', 'Local', 'Google', 'Hangouts Chat', 'resources', 'app', 'main.js');
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

//rm('-rf', [DEFAULTINIT, PLUGINGEN, ESCAPEDPLUGIN, WRAPPEDPLUGIN]);

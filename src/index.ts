import * as os from 'os';
import * as util from 'util';
import * as fs from 'fs';

import * as toolCache from '@actions/tool-cache';
import * as core from '@actions/core';

function getDownloadURL(version: string): string {
    switch (os.type()) {
        case 'Linux':
            return util.format('https://github.com/digarok/cadius/releases/download/%s/cadius-ubuntu-latest-%s.zip', version, version);
        case 'Darwin':
            return util.format('https://github.com/digarok/cadius/releases/download/%s/cadius-macos-latest-%s.zip', version, version);
        case 'Windows_NT':
        default:
            return util.format('https://github.com/digarok/cadius/releases/download/%s/cadius-windows-latest-%s.zip', version, version);
    }
}

async function downloadCadius(version: string) {
    let cachedToolpath = toolCache.find('cadius', version);
    if (!cachedToolpath) {
        let downloadPath;
        try {
            downloadPath = await toolCache.downloadTool(getDownloadURL(version));
        } catch (exception) {
            console.log(exception)
            throw new Error(util.format("Failed to download Cadius from location ", getDownloadURL(version)));
        }
        const extractedPath = await toolCache.extractZip(downloadPath);
        cachedToolpath = await toolCache.cacheDir(extractedPath, 'cadius', version);
    }
    core.addPath(cachedToolpath)
    return cachedToolpath
}

async function downloadProdos(cadiusPath: string) {
    // get real exe location (is this needed?)
    let cadiusExe = util.format('%s/cadius', cadiusPath)
    if (os.type() == 'Windows_NT') {
        cadiusExe = util.format('%s/Cadius.exe', cadiusPath)
    }

    // something is wrong with the mirrors cert so we'll just use http
    let downloadP8URL = 'http://mirrors.apple2.org.za/ftp.apple.asimov.net/images/masters/prodos/ProDOS_2_4_2.dsk'
    let downloadD2PURL = 'https://raw.githubusercontent.com/digarok/dsk2po/master/dsk2po.py' 
    
    let p8DownloadPath;
    let d2pDownloadPath;

    try {
        p8DownloadPath = await toolCache.downloadTool(downloadP8URL);
    } catch (exception) {
        console.log(exception);
        throw new Error(util.format("Failed to download ProDOS from location ", downloadP8URL));
    }
    console.log(util.format("Downloaded file: ", p8DownloadPath));
    // move it so it's in the user workspace in any future steps
    let p8DskPath = './ProDOS_2_4_2.dsk'
    fs.renameSync(p8DownloadPath, p8DskPath);

    try {
        d2pDownloadPath = await toolCache.downloadTool(downloadD2PURL);
    } catch (exception) {
        console.log(exception);
        throw new Error(util.format("Failed to download dsk2po.py from location ", downloadD2PURL));
    }
    console.log(util.format("Downloaded file: ", d2pDownloadPath));

    // Now we need to a) convert the image and b) extract the volume file locally
    try {
        const spawn = require("child_process").spawn;
        const spawnSync = require("child_process").spawnSync;

        spawnSync('python3',[d2pDownloadPath, p8DskPath]);
        const cadiusProcess = spawnSync(cadiusExe, ['extractvolume', 'ProDOS_2_4_2.po', '.'],{ encoding : 'utf8' })
        console.log(cadiusProcess.stdout);
    } catch (exception) {
        console.log(exception);
        console.log("Unagle to complete ProDOS download and extraction.");
    }
}

async function run() {
    let version = core.getInput('version');
    if (!version) {
        version = '0.0.0';  // default
    }
    let includeProdos = false;
    let inputIncludeProdos = core.getInput('include_prodos');
    if (inputIncludeProdos.toLowerCase() == "true" || inputIncludeProdos == "") {
        includeProdos = true;  // default
    }
    console.log(`INPUTS - version '${version}'`);
    console.log(`INPUTS - includeProdos '${includeProdos}'`);

    let cadiusPath = await downloadCadius(version);

    console.log(`Cadius version: '${version}' has been downloaded and added to path`);
    if (includeProdos) {
        await downloadProdos(cadiusPath);
        console.log(`ProDOS download and extraction completed`);
    }
}

run().catch(core.setFailed);
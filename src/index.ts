import * as os from 'os';
import * as util from 'util';
import * as path from 'path';

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
        cachedToolpath = await toolCache.cacheDir(path.join(extractedPath, 'cadius'), 'cadius', version);
    }

    core.addPath(cachedToolpath)
}

async function run() {
    let version = core.getInput('version', { 'required': true });
    await downloadCadius(version);
    console.log(`Cadius version: '${version}' has been downloaded and added to path`);
}

run().catch(core.setFailed);
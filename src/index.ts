import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';

import * as toolCache from '@actions/tool-cache';
import * as core from '@actions/core';

type Source = 'digarok' | 'mach-kernel';

function binaryName(): string {
    return os.type() === 'Windows_NT' ? 'cadius.exe' : 'cadius';
}

function getDownloadURL(version: string, source: Source): string {
    if (source === 'mach-kernel') {
        switch (os.type()) {
            case 'Linux':
                return util.format('https://github.com/mach-kernel/cadius/releases/download/%s/cadius-linux', version);
            case 'Darwin':
                return util.format('https://github.com/mach-kernel/cadius/releases/download/%s/cadius-darwin', version);
            case 'Windows_NT':
            default:
                return util.format('https://github.com/mach-kernel/cadius/releases/download/%s/cadius.exe', version);
        }
    }
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

// Node's spawnSync on Windows does not auto-append .exe, and some zip
// releases ship the binary as 'Cadius.exe' (capital C). Materialize a
// lowercase 'cadius.exe' so path.join(dir, 'cadius.exe') works uniformly.
function normalizeWindowsBinary(dir: string): void {
    if (os.type() !== 'Windows_NT') return;
    const lower = path.join(dir, 'cadius.exe');
    if (fs.existsSync(lower)) return;
    const capital = path.join(dir, 'Cadius.exe');
    if (fs.existsSync(capital)) {
        fs.copyFileSync(capital, lower);
    }
}

async function stageDownload(downloadUrl: string, version: string): Promise<string> {
    let downloadPath: string;
    try {
        downloadPath = await toolCache.downloadTool(downloadUrl);
    } catch (exception) {
        console.log(exception);
        throw new Error(util.format('Failed to download Cadius from location %s', downloadUrl));
    }

    if (downloadUrl.toLowerCase().endsWith('.zip')) {
        const extracted = await toolCache.extractZip(downloadPath);
        normalizeWindowsBinary(extracted);
        return extracted;
    }

    const stagedDir = path.join(path.dirname(downloadPath), util.format('cadius-stage-%s', version));
    fs.mkdirSync(stagedDir, { recursive: true });
    const target = path.join(stagedDir, binaryName());
    fs.renameSync(downloadPath, target);
    if (os.type() !== 'Windows_NT') {
        fs.chmodSync(target, 0o755);
    }
    return stagedDir;
}

async function downloadCadius(version: string, source: Source, customUrl: string) {
    const cacheVersion = customUrl ? util.format('custom-%s', version) : util.format('%s-%s', source, version);
    let cachedToolpath = toolCache.find('cadius', cacheVersion);
    if (!cachedToolpath) {
        const downloadUrl = customUrl || getDownloadURL(version, source);
        const staged = await stageDownload(downloadUrl, version);
        cachedToolpath = await toolCache.cacheDir(staged, 'cadius', cacheVersion);
    }
    core.addPath(cachedToolpath);
    return cachedToolpath;
}

async function downloadProdos(cadiusPath: string) {
    const cadiusExe = path.join(cadiusPath, binaryName());

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
        const spawnSync = require("child_process").spawnSync;

        spawnSync('python3',[d2pDownloadPath, p8DskPath]);
        const cadiusProcess = spawnSync(cadiusExe, ['extractvolume', 'ProDOS_2_4_2.po', '.'],{ encoding : 'utf8' })
        console.log(cadiusProcess.stdout);
    } catch (exception) {
        console.log(exception);
        console.log("Unable to complete ProDOS download and extraction.");
    }
}

function parseSource(value: string): Source {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized === '' || normalized === 'digarok') return 'digarok';
    if (normalized === 'mach-kernel') return 'mach-kernel';
    throw new Error(util.format("Unsupported source '%s'. Expected 'digarok' or 'mach-kernel'.", value));
}

async function run() {
    let version = core.getInput('version');
    if (!version) {
        version = 'v0.0.2';  // default
    }
    const source = parseSource(core.getInput('source'));
    const customUrl = (core.getInput('url') || '').trim();

    let includeProdos = false;
    let inputIncludeProdos = core.getInput('include_prodos');
    if (inputIncludeProdos.toLowerCase() == "true" || inputIncludeProdos == "") {
        includeProdos = true;  // default
    }
    console.log(`INPUTS - version '${version}'`);
    console.log(`INPUTS - source '${source}'`);
    console.log(`INPUTS - url '${customUrl}'`);
    console.log(`INPUTS - includeProdos '${includeProdos}'`);

    let cadiusPath = await downloadCadius(version, source, customUrl);

    console.log(`Cadius has been downloaded and added to path (${cadiusPath})`);
    if (includeProdos) {
        await downloadProdos(cadiusPath);
        console.log(`ProDOS download and extraction completed`);
    }
}

run().catch(core.setFailed);

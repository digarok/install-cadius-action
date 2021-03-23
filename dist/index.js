"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const util = __importStar(require("util"));
const fs = __importStar(require("fs"));
const toolCache = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
function getDownloadURL(version) {
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
function downloadCadius(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let cachedToolpath = toolCache.find('cadius', version);
        if (!cachedToolpath) {
            let downloadPath;
            try {
                downloadPath = yield toolCache.downloadTool(getDownloadURL(version));
            }
            catch (exception) {
                console.log(exception);
                throw new Error(util.format("Failed to download Cadius from location ", getDownloadURL(version)));
            }
            const extractedPath = yield toolCache.extractZip(downloadPath);
            cachedToolpath = yield toolCache.cacheDir(extractedPath, 'cadius', version);
        }
        core.addPath(cachedToolpath);
        return cachedToolpath;
    });
}
function downloadProdos(cadiusPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let cadiusExe = util.format('%s/cadius', cadiusPath);
        if (os.type() == 'Windows_NT') {
            cadiusExe = util.format('%s/Cadius.exe', cadiusPath);
        }
        let downloadP8URL = 'http://mirrors.apple2.org.za/ftp.apple.asimov.net/images/masters/prodos/ProDOS_2_4_2.dsk';
        let downloadD2PURL = 'https://raw.githubusercontent.com/digarok/dsk2po/master/dsk2po.py';
        let p8DownloadPath;
        let d2pDownloadPath;
        try {
            p8DownloadPath = yield toolCache.downloadTool(downloadP8URL);
        }
        catch (exception) {
            console.log(exception);
            throw new Error(util.format("Failed to download ProDOS from location ", downloadP8URL));
        }
        console.log(util.format("Downloaded file: ", p8DownloadPath));
        let p8DskPath = './ProDOS_2_4_2.dsk';
        fs.renameSync(p8DownloadPath, p8DskPath);
        try {
            d2pDownloadPath = yield toolCache.downloadTool(downloadD2PURL);
        }
        catch (exception) {
            console.log(exception);
            throw new Error(util.format("Failed to download dsk2po.py from location ", downloadD2PURL));
        }
        console.log(util.format("Downloaded file: ", d2pDownloadPath));
        try {
            const spawnSync = require("child_process").spawnSync;
            spawnSync('python3', [d2pDownloadPath, p8DskPath]);
            const cadiusProcess = spawnSync(cadiusExe, ['extractvolume', 'ProDOS_2_4_2.po', '.'], { encoding: 'utf8' });
            console.log(cadiusProcess.stdout);
        }
        catch (exception) {
            console.log(exception);
            console.log("Unable to complete ProDOS download and extraction.");
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let version = core.getInput('version');
        if (!version) {
            version = '0.0.0';
        }
        let includeProdos = false;
        let inputIncludeProdos = core.getInput('include_prodos');
        if (inputIncludeProdos.toLowerCase() == "true" || inputIncludeProdos == "") {
            includeProdos = true;
        }
        console.log(`INPUTS - version '${version}'`);
        console.log(`INPUTS - includeProdos '${includeProdos}'`);
        let cadiusPath = yield downloadCadius(version);
        console.log(`Cadius version: '${version}' has been downloaded and added to path`);
        if (includeProdos) {
            yield downloadProdos(cadiusPath);
            console.log(`ProDOS download and extraction completed`);
        }
    });
}
run().catch(core.setFailed);

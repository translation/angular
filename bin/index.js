"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmlDom = __importStar(require("xmldom"));
const utils_1 = require("./utils");
const init_request_1 = require("./types/init/init.request");
const sync_request_1 = require("./types/sync/sync.request");
const domParser = new xmlDom.DOMParser();
const reader = require('fs');
// Get CLI arguments
const argv = require('minimist')(process.argv.slice(2));
const options = JSON.parse(reader.readFileSync(argv['options']));
// Set arguments 
// Type of extract
const i18nKey = options.i18n_key.trim();
// Source arg.
const sourceLanguage = options.source_language.language.trim();
const sourceFile = options.source_language.file.trim();
// Targets arg.
const targetLanguages = [];
const targetFiles = [];
for (let i = 0; i < options.target_languages.length; i++) {
    targetLanguages.push(options.target_languages[i].language.trim());
    targetFiles.push(options.target_languages[i].file.trim());
}
// Api arg.
const apiKey = options.api_key.trim();
// Proxy arg.
let proxyUrl = '';
if (options.proxy) {
    proxyUrl = options.proxy.trim();
}
/*********** INIT ***********/
if (argv['init']) {
    console.log('Start init');
    // Init objects
    const initRequest = new init_request_1.InitRequest();
    initRequest.source_language = sourceLanguage;
    initRequest.target_languages = targetLanguages.slice();
    // For each target languages, we do some process
    for (let x = 0; x < initRequest.target_languages.length; x++) {
        // Get and read file for the current target language
        const raw = reader.readFileSync(targetFiles[x], 'utf8');
        const xml = domParser.parseFromString(raw, 'text/xml');
        const transUnits = xml.getElementsByTagName('trans-unit');
        const segments = [];
        for (let t = 0; t < transUnits.length; t++) {
            const id = transUnits[t].getAttribute('id');
            if (id && (segments.findIndex(x => x.key === id) === -1)) {
                const initSegmentRequest = new init_request_1.InitSegmentRequest(id, i18nKey);
                const source_string = utils_1.getXMLElementToString('source', transUnits[t].getElementsByTagName('source')[0]);
                const target_string = utils_1.getXMLElementToString('target', transUnits[t].getElementsByTagName('target')[0]);
                initSegmentRequest.source = source_string;
                // If texts are equals -> we set the target "empty"
                initSegmentRequest.target = (source_string === target_string) ? '' : target_string;
                segments.push(initSegmentRequest);
            }
            else {
                console.error(id ? 'Duplicated ids' + id : 'Id not set');
            }
        }
        initRequest.segments[initRequest.target_languages[x]] = segments.slice();
    }
    const url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
    // We post the JSON into translation.io
    utils_1.httpCall('POST', url, initRequest, proxyUrl).then(() => {
        console.log('Init successful !');
    });
}
/*********** SYNC ***********/
if (argv['sync']) {
    pull().then(() => __awaiter(this, void 0, void 0, function* () {
        console.log('Start sync');
        yield utils_1.delay(3000);
        // Init objects
        const syncRequest = new sync_request_1.SyncRequest();
        if (argv['purge']) {
            console.log('! Purge enable');
            syncRequest.purge = true;
        }
        if (argv['readonly']) {
            console.log('! Readonly enable');
            syncRequest.readonly = true;
        }
        syncRequest.source_language = sourceLanguage;
        syncRequest.target_languages = targetLanguages.slice();
        // Get and read file "source" for the sync
        const raw = reader.readFileSync(sourceFile, 'utf8');
        const xml = domParser.parseFromString(raw, 'text/xml');
        const transUnits = xml.getElementsByTagName('trans-unit');
        const segments = [];
        for (let t = 0; t < transUnits.length; t++) {
            const id = transUnits[t].getAttribute('id');
            if (id && (segments.findIndex(x => x.key === id) === -1)) {
                const syncSegmentRequest = new sync_request_1.SyncSegmentRequest(id, i18nKey);
                const source_string = utils_1.getXMLElementToString('source', transUnits[t].getElementsByTagName('source')[0]);
                syncSegmentRequest.source = source_string;
                segments.push(syncSegmentRequest);
            }
            else {
                console.error(id ? 'Duplicated ids' : 'Id not set');
            }
        }
        syncRequest.segments = segments.slice();
        const url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
        // We post the JSON into translation.io
        utils_1.httpCall('POST', url, syncRequest, proxyUrl).then((response) => {
            console.log('Sync successful !');
            merge(response);
        });
    }));
}
/*********** PULL ***********/
function pull() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start pull');
        const url = 'https://translation.io/api/v1/source_edits/pull.json?api_key=' + apiKey;
        const params = '&timestamp=0';
        // We post the JSON into translation.io
        utils_1.httpCall('GET', url, params, proxyUrl).then((response) => {
            if (response.source_edits.length > 0) {
                const files = targetFiles.slice();
                files.push(sourceFile);
                const languages = targetLanguages.slice();
                languages.push(sourceLanguage);
                // Remove old edits from response
                const segments = utils_1.getUniqueSegmentFromPull(response.source_edits);
                // For each languages, we do some process
                for (let x = 0; x < languages.length; x++) {
                    // Get and read file for the current language
                    const raw = reader.readFileSync(files[x], 'utf8');
                    const xml = domParser.parseFromString(raw, 'text/xml');
                    const transUnits = xml.getElementsByTagName('trans-unit');
                    for (let t = 0; t < transUnits.length; t++) {
                        const id = transUnits[t].getAttribute('id');
                        const source = transUnits[t].getElementsByTagName('source')[0];
                        const target = transUnits[t].getElementsByTagName('target')[0];
                        if (id && id.startsWith(i18nKey)) {
                            const index = segments.findIndex(x => x.key === id);
                            if (index !== -1) {
                                const newNode = domParser.parseFromString('<source>' + segments[index].new_source + '</source>', 'text/xml');
                                xml.replaceChild(newNode, source);
                                if (languages[x] === sourceLanguage) {
                                    const newNode = domParser.parseFromString('<target state="final">' + segments[index].new_source + '</target>', 'text/xml');
                                    xml.replaceChild(newNode, target);
                                }
                            }
                        }
                    }
                    require('fs').writeFile(files[x], xml, (err) => {
                        if (err) {
                            console.error('Write file', err);
                        }
                    });
                }
                console.log('Pull successful !');
            }
        });
    });
}
exports.pull = pull;
/*********** MERGE ***********/
function merge(sync) {
    console.log('Start merge');
    // For each target files, we do some process
    for (let x = 0; x < targetFiles.length; x++) {
        // Get and read file for the current target language
        const raw = reader.readFileSync(targetFiles[x], 'utf8');
        const xml = domParser.parseFromString(raw, 'text/xml');
        const transUnits = xml.getElementsByTagName('trans-unit');
        const key_segments = sync.segments[targetLanguages[x]].filter(x => !!x.key);
        const source_segments = sync.segments[targetLanguages[x]].filter(x => !x.key);
        for (let t = 0; t < transUnits.length; t++) {
            const id = transUnits[t].getAttribute('id');
            const source_string = utils_1.getXMLElementToString('source', transUnits[t].getElementsByTagName('source')[0]);
            const target = transUnits[t].getElementsByTagName('target')[0];
            if (id && id.startsWith(i18nKey)) {
                const index = key_segments.findIndex(x => x.key === id);
                if (index !== -1) {
                    if (source_string === key_segments[index].source) {
                        if (key_segments[index].target === '') {
                            const newNode = domParser.parseFromString('<target state="needs-translation">' + '@@@@@' + key_segments[index].source + '@@@@@' + '</target>', 'text/xml');
                            xml.replaceChild(newNode, target);
                        }
                        else {
                            const newNode = domParser.parseFromString('<target state="final">' + key_segments[index].target + '</target>', 'text/xml');
                            xml.replaceChild(newNode, target);
                        }
                    }
                    else {
                        console.error('Source are not equivalent : ' + source_string + ' ||| ' + key_segments[index].source);
                    }
                }
                else {
                    console.error('Id is missing in the xliff file : ' + id);
                }
            }
            else {
                // Proccessing and updating the xliff file
                for (let i = 0; i < source_segments.length; i++) {
                    if (source_string === source_segments[i].source) {
                        if (source_segments[i].target === '') {
                            const newNode = domParser.parseFromString('<target state="needs-translation">' + '@@@@@' + source_segments[i].source + '@@@@@' + '</target>', 'text/xml');
                            xml.replaceChild(newNode, target);
                        }
                        else {
                            const newNode = domParser.parseFromString('<target state="final">' + source_segments[i].target + '</target>', 'text/xml');
                            xml.replaceChild(newNode, target);
                        }
                    }
                }
            }
        }
        require('fs').writeFile(targetFiles[x], xml, (err) => {
            if (err) {
                console.error('Write file', err);
            }
        });
    }
    console.log('Merge successful !');
}
exports.merge = merge;
//# sourceMappingURL=index.js.map
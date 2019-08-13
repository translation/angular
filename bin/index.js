"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmlDom = __importStar(require("xmldom"));
const TioInit_request_1 = require("./types/init/TioInit.request");
const TioInitSegment_request_1 = require("./types/init/TioInitSegment.request");
const TioSync_request_1 = require("./types/sync/TioSync.request");
const TioSyncSegment_request_1 = require("./types/sync/TioSyncSegment.request");
const domParser = new xmlDom.DOMParser();
const xmlSerializer = new xmlDom.XMLSerializer();
// Get CLI arguments
const argv = require('minimist')(process.argv.slice(2));
// Get arguments 
// Source arg.
const argSource = argv['source'].trim().split(':');
const sourceLanguage = argSource[0].trim(); // key
const sourceXliff = argSource[1].trim(); // value
// Targets arg.
const argTargets = argv['targets'];
const targetLanguages = [];
const targetXliffs = [];
for (let i = 0; i < argTargets.length; i++) {
    const argTarget = argTargets[i].trim().split(':');
    targetLanguages.push(argTarget[0].trim()); // key
    targetXliffs.push(argTarget[1].trim()); // value
}
// Api arg.
const apiKey = argv['apiKey'].trim();
/*********** INIT ***********/
if (argv['init']) {
    console.log('Start init');
    // Init objects
    const tioInitRequest = new TioInit_request_1.TioInitRequest();
    tioInitRequest.source_language = sourceLanguage;
    tioInitRequest.target_languages = targetLanguages.slice();
    // For each targets-languages, we do some process
    for (let x = 0; x < tioInitRequest.target_languages.length; x++) {
        // Get and read file for the current targets-languages
        const raw = require('fs').readFileSync(targetXliffs[x], 'utf8');
        // Get tags <source> and <target> from the file
        const xml = domParser.parseFromString(raw, 'text/xml');
        const sources = xml.getElementsByTagName('source');
        const targets = xml.getElementsByTagName('target');
        // We only keep raw values and we remove tags <source ...></source> and <target ...></target> from it
        let arraySource = getXMLElementsToArrayString('source', sources);
        const arrayTarget = getXMLElementsToArrayString('target', targets);
        // Only if the number of tags are the same, we process and we complete the json object for translatio.io
        if (arraySource.length === arrayTarget.length) {
            const segment = [];
            for (let i = 0; i < arraySource.length; i++) {
                let tioIS = new TioInitSegment_request_1.TioInitSegmentRequest();
                tioIS.source = arraySource[i];
                // If equals -> we set the target "empty"
                if (arraySource[i] === arrayTarget[i]) {
                    tioIS.target = '';
                }
                else {
                    tioIS.target = arrayTarget[i];
                }
                // We can't have duplicates in the init proccess
                const index = segment.findIndex(val => tioIS.source === val.source);
                if (index === -1) {
                    segment.push(tioIS);
                }
            }
            tioInitRequest.segments[tioInitRequest.target_languages[x]] = segment;
        }
        else {
            console.error('The number of <source> & <target> are not equivalent in the file : ' + targetXliffs[x]);
        }
    }
    const url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
    // We post the JSON into translation.io
    httpPost(url, tioInitRequest, () => {
        console.log('Init successful !');
    });
}
/*********** SYNC ***********/
if (argv['sync']) {
    console.log('Start sync');
    // Init objects
    const tioSyncRequest = new TioSync_request_1.TioSyncRequest();
    if (argv['purge']) {
        console.log('Purge enable');
    }
    if (argv['readonly']) {
        console.log('Readonly enable');
    }
    tioSyncRequest.purge = argv['purge'];
    tioSyncRequest.readonly = argv['readonly'];
    tioSyncRequest.source_language = sourceLanguage;
    tioSyncRequest.target_languages = targetLanguages.slice(); // key
    // Get and read file "source" for the sync
    const raw = require('fs').readFileSync(sourceXliff, 'utf8');
    // Get tags <source> from the "source" file
    const xml = domParser.parseFromString(raw, 'text/xml');
    const sources = xml.getElementsByTagName('source');
    // We only keep raw values and we remove tags <source ...></source> from it
    const arraySource = getXMLElementsToArrayString('source', sources);
    // We complete the json object for translatio.io
    tioSyncRequest.segments = arraySource.map(src => {
        const x = new TioSyncSegment_request_1.TioSyncSegmentRequest();
        x.source = src;
        return x;
    });
    const url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
    // We post the JSON into translation.io
    httpPost(url, tioSyncRequest, res => {
        console.log('Sync successful !');
        mergeXliff(targetXliffs, tioSyncRequest.target_languages, res);
    });
}
/*********** MERGE ***********/
function mergeXliff(filesToMerge, targetLanguages, sync) {
    console.log('Start merge');
    // For each filesToMerge, we do some process
    for (let x = 0; x < filesToMerge.length; x++) {
        // Get and read file for the merge
        const raw = require('fs').readFileSync(filesToMerge[x], 'utf8');
        // Get tags <source> and <target> from the file
        const xml = domParser.parseFromString(raw, 'text/xml');
        const sources = xml.getElementsByTagName('source');
        const targets = xml.getElementsByTagName('target');
        // Proccess the <source> like in the 'sync' to permit comparison
        const arraySource = getXMLElementsToArrayString('source', sources);
        // Get the traductions
        const segments = sync.segments[targetLanguages[x]];
        // Proccessing and updating the xliff file
        for (let i = 0; i < segments.length; i++) {
            arraySource.forEach((element, index) => {
                if (element === segments[i].source) {
                    const newNode = domParser.parseFromString('<target state="final">' + segments[i].target + '</target>', 'text/xml');
                    xml.replaceChild(newNode, targets[index]);
                }
                else {
                    const newNode = domParser.parseFromString('<target state="needs-translation">' + '@@@@@' + segments[i].source + '@@@@@' + '</target>', 'text/xml');
                    xml.replaceChild(newNode, targets[index]);
                }
            });
        }
        require('fs').writeFile(filesToMerge[x], xml, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
    console.log('Merge successful !');
}
exports.mergeXliff = mergeXliff;
/*********** UTILS ***********/
function getXMLElementsToArrayString(nodeName, xmlElements) {
    const regexNode = new RegExp('<' + nodeName + ' .*?>');
    const response = [];
    for (let i = 0; i < xmlElements.length; i++) {
        const val = xmlSerializer.serializeToString(xmlElements[i])
            .replace(regexNode, '')
            .replace('</' + nodeName + '>', '')
            .replace(/\t/g, '')
            .replace(/\s+/g, ' ').trim();
        response.push(val);
    }
    return response.slice();
}
exports.getXMLElementsToArrayString = getXMLElementsToArrayString;
function httpPost(url, value, callback) {
    require('axios').post(url, value).then((res) => {
        console.log(res.data);
        console.log('{ status: ' + res.status + ' }');
        callback(res.data);
    })
        .catch((error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(error.response.data);
            console.error('{ status: ' + error.response.status + ' }');
            console.error(error.response.headers);
        }
        else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(error.request);
        }
        else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message);
        }
    });
}
exports.httpPost = httpPost;
//# sourceMappingURL=index.js.map
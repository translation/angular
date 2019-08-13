import * as xmlDom from 'xmldom';
import { TioInitRequest } from './types/init/TioInit.request';
import { TioInitSegmentRequest } from './types/init/TioInitSegment.request';
import { TioSyncRequest } from './types/sync/TioSync.request';
import { TioSyncSegmentRequest } from './types/sync/TioSyncSegment.request';
import { TioSyncResponse } from './types/sync/TioSync.response';
const domParser = new xmlDom.DOMParser();
const xmlSerializer = new xmlDom.XMLSerializer();

// Get CLI arguments
const argv = require('minimist')(process.argv.slice(2));

// Get arguments 
// Source arg.
const argSource: string[] = argv['source'].trim().split(':');
const sourceLanguage = argSource[0].trim();     // key
const sourceXliff = argSource[1].trim();        // value

// Targets arg.
const argTargets: string[] = argv['targets'];
const targetLanguages: string[] = [];
const targetXliffs: string[] = [];
for (let i = 0; i < argTargets.length; i++) {
  const argTarget = argTargets[i].trim().split(':');
  targetLanguages.push(argTarget[0].trim());    // key
  targetXliffs.push(argTarget[1].trim());       // value
}

// Api arg.
const apiKey = argv['apiKey'].trim();





/*********** INIT ***********/
if (argv['init']) {
  console.log('Start init');
  // Init objects
  const tioInitRequest = new TioInitRequest();
  tioInitRequest.source_language = sourceLanguage;
  tioInitRequest.target_languages = targetLanguages.slice();

  // For each targets-languages, we do some process
  for (let x = 0; x < tioInitRequest.target_languages.length; x++) {
    // Get and read file for the current targets-languages
    const raw = require('fs').readFileSync(targetXliffs[x], 'utf8');

    // Get tags <source> and <target> from the file
    const xml = domParser.parseFromString(raw, 'text/xml');
    const source = xml.getElementsByTagName('source');
    const target = xml.getElementsByTagName('target');

    // We only keep raw values and we remove tags <source ...></source> and <target ...></target> from it
    const arraySource: string[] = getSourceToString(source);
    const arrayTarget: string[] = getTargetToString(target);

    // Only if the number of tags are the same, we process and we complete the json object for translatio.io
    if (arraySource.length === arrayTarget.length) {
      const segment: TioInitSegmentRequest[] = [];
      for (let i = 0; i < arraySource.length; i++) {
        let tioIS = new TioInitSegmentRequest();
        tioIS.source = arraySource[i];
        tioIS.target = arrayTarget[i];
        segment.push(tioIS);
      }
      tioInitRequest.segments[tioInitRequest.target_languages[x]] = segment;
    } else {
      console.error('The number of <source> & <target> are not equivalent in the file : ' + targetXliffs[x]);
    }
  }

  const url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  httpPost(url, tioInitRequest, () => {
    console.log('Init successful !')
  });
}





/*********** SYNC ***********/
if (argv['sync']) {
  console.log('Start sync');
  // Init objects
  const tioSyncRequest = new TioSyncRequest();
  tioSyncRequest.source_language = sourceLanguage;
  tioSyncRequest.target_languages = targetLanguages.slice(); // key

  // Get and read file "source" for the sync
  const raw = require('fs').readFileSync(sourceXliff, 'utf8');

  // Get tags <source> from the "source" file
  const xml = domParser.parseFromString(raw, 'text/xml');
  const source = xml.getElementsByTagName('source');

  // We only keep raw values and we remove tags <source ...></source> from it
  const arraySource: string[] = getSourceToString(source);

  // We complete the json object for translatio.io
  tioSyncRequest.segments = arraySource.map<TioSyncSegmentRequest>(src => {
    const x = new TioSyncSegmentRequest();
    x.source = src;
    return x;
  });

  const url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  httpPost(url, tioSyncRequest, res => {
    console.log('Sync successful !')
    mergeXliff(targetXliffs, tioSyncRequest.target_languages, res);
  });
}





/*********** MERGE ***********/
export function mergeXliff(filesToMerge: string[], targetLanguages: string[], sync: TioSyncResponse): void {
  console.log('Start merge');
  // For each filesToMerge, we do some process
  for (let x = 0; x < filesToMerge.length; x++) {
    // Get and read file for the merge
    const raw = require('fs').readFileSync(filesToMerge[x], 'utf8');

    // Get tags <source> and <target> from the file
    const xml = domParser.parseFromString(raw, 'text/xml');
    const source = xml.getElementsByTagName('source');
    const target = xml.getElementsByTagName('target');

    // Proccess the <source> like in the 'sync' to permit comparison
    const arraySource: string[] = getSourceToString(source);

    const segment = sync.segments[targetLanguages[x]];
    for (let i = 0; i < segment.length; i++) {
      //If sources are equals -> we can update the <target> tag.
      const index = arraySource.indexOf(segment[i].source);
      if (index > -1) {
        const newNode = domParser.parseFromString('<target state="final">' + segment[i].target + '</target>', 'text/xml');
        xml.replaceChild(newNode, target[index]);
      }
    }

    require('fs').writeFile(filesToMerge[x], xml, (err: any) => {
      if (err) {
        console.error(err);
      }
    });
  }
  console.log('Merge successful !');
}

export function getSourceToString(sources: HTMLCollectionOf<HTMLSourceElement>): string[] {
  const regexSource = new RegExp('<source .*?>');
  const response: string[] = [];
  for (let i = 0; i < sources.length; i++) {
    const val = xmlSerializer.serializeToString(sources[i])
      .replace(regexSource, '')
      .replace('</source>', '')
      .replace(/\t/g, '')
      .replace(/\s+/g, ' ').trim();
    response.push(val);
  }
  return response.slice();
}

export function getTargetToString(targets: HTMLCollectionOf<Element>): string[] {
  const regexTarget = new RegExp('<target .*?>');
  const response: string[] = [];
  for (let i = 0; i < targets.length; i++) {
    const val = xmlSerializer.serializeToString(targets[i])
      .replace(regexTarget, '')
      .replace('</target>', '')
      .replace(/\t/g, '')
      .replace(/\s+/g, ' ').trim();
    response.push(val);
  }
  return response.slice();
}





export function httpPost(url: string, value: any, callback: (res: any) => void) {
  require('axios').post(url, value).then((res: any) => {
    console.log(res.data);
    console.log('{ status: ' + res.status + ' }');
    callback(res.data);
  })
    .catch((error: any) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error('{ status: ' + error.response.status + ' }');
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
      }
    });
}
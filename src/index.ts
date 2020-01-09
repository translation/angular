import * as xmlDom from 'xmldom';
import { InitRequest, InitSegmentRequest } from './types/init/init.request';
import { SyncResponse } from './types/sync/sync.response';
import { Options } from './types/options';
import { PullResponse } from './types/pull/pull.response';
import { getXMLElementToString, httpPost } from './utils';
import { SyncRequest, SyncSegmentRequest } from './types/sync/sync.request';
import { PullRequest } from './types/pull/pull.request';
const domParser = new xmlDom.DOMParser();


// Get CLI arguments
const argv = require('minimist')(process.argv.slice(2));
const options: Options = JSON.parse(
  require('fs').readFileSync(argv['options'])
);

// Get arguments 
// Type of extract
const i18n_key = options.i18nKey.trim();

// Source arg.
const sourceLanguage: string = options.source_language.language.trim();
const sourceXliff: string = options.source_language.file.trim();

// Targets arg.
const targetLanguages: string[] = [];
const targetXliffs: string[] = [];
for (let i = 0; i < options.target_languages.length; i++) {
  targetLanguages.push(options.target_languages[i].language.trim());
  targetXliffs.push(options.target_languages[i].file.trim());
}

// Api arg.
const apiKey: string = options.apiKey.trim();

// Proxy arg.
let proxy_url: string = '';
if (options.proxy) {
  proxy_url = options.proxy.url.trim() + ':' + options.proxy.port.trim();
}



// /*********** INIT ***********/
if (argv['init']) {
  console.log('Start init');
  // Init objects
  const initRequest = new InitRequest();
  initRequest.source_language = sourceLanguage;
  initRequest.target_languages = targetLanguages.slice();

  // For each targets-languages, we do some process
  for (let x = 0; x < initRequest.target_languages.length; x++) {
    // Get and read file for the current target-language
    const raw = require('fs').readFileSync(targetXliffs[x], 'utf8');
    const transUnits = domParser.parseFromString(raw, 'text/xml').getElementsByTagName('trans-unit');

    const segments: InitSegmentRequest[] = [];
    for (let t = 0; t < transUnits.length; t++) {
      const id = transUnits[t].getAttribute('id');
      if (id && (segments.findIndex(x => x.key === id) === -1)) {
        const initSegmentRequest = new InitSegmentRequest(id, i18n_key);

        const source_string = getXMLElementToString(
          'source',
          transUnits[t].getElementsByTagName('source')[0]
        );
        const target_string = getXMLElementToString(
          'target',
          transUnits[t].getElementsByTagName('target')[0]
        );

        initSegmentRequest.source = source_string;
        // If texts are equals -> we set the target "empty"
        initSegmentRequest.target = (source_string === target_string) ? '' : target_string;
        segments.push(initSegmentRequest);
      } else {
        console.error(id ? 'Duplicated ids' : 'Id not set');
      }
    }
    initRequest.segments[initRequest.target_languages[x]] = segments.slice();
  }
  // const url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
  // // We post the JSON into translation.io
  // httpPost(url, initRequest, proxy_url, () => {
  //   console.log('Init successful !')
  // });
}



/*********** SYNC ***********/
if (argv['sync']) {
  console.log('Start sync');

  pull(() => {

  });

  // Init objects
  const syncRequest = new SyncRequest();
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
  const raw = require('fs').readFileSync(sourceXliff, 'utf8');
  const transUnits = domParser.parseFromString(raw, 'text/xml').getElementsByTagName('trans-unit');

  const segments: SyncSegmentRequest[] = [];
  for (let t = 0; t < transUnits.length; t++) {
    const id = transUnits[t].getAttribute('id');
    if (id && (segments.findIndex(x => x.key === id) === -1)) {
      const syncSegmentRequest = new SyncSegmentRequest(id, i18n_key);

      const source_string = getXMLElementToString(
        'source',
        transUnits[t].getElementsByTagName('source')[0]
      );
      syncSegmentRequest.source = source_string;

      segments.push(syncSegmentRequest);
    } else {
      console.error(id ? 'Duplicated ids' : 'Id not set');
    }
  }
  syncRequest.segments = segments.slice();

  // const url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
  // // We post the JSON into translation.io
  // httpPost(url, syncRequest, proxy_url, (response: SyncResponse) => {
  //   console.log('Sync successful !')
  //   merge(response);
  // });
}




/*********** PULL ***********/
export function pull(callback: () => void): void {
  console.log('Start pull');
  // const url = 'https://translation.io/api/v1/source_edits/pull.json?api_key=' + apiKey;
  // // We post the JSON into translation.io
  // httpPost(url, new PullRequest(), proxy_url, (response: PullResponse) => {

  //   console.log('Pull successful !')
  //   callback();
  // });
}



/*********** MERGE ***********/
export function merge(sync: SyncResponse): void {
  console.log('Start merge');
  // For each filesToMerge, we do some process
  for (let x = 0; x < targetXliffs.length; x++) {
    // Get and read file for the merge
    const raw = require('fs').readFileSync(targetXliffs[x], 'utf8');
    const xml = domParser.parseFromString(raw, 'text/xml')
    const transUnits = xml.getElementsByTagName('trans-unit');

    const key_segments = sync.segments[targetLanguages[x]].filter(x => x.key.startsWith(i18n_key));
    const source_segments = sync.segments[targetLanguages[x]].filter(x => !x.key.startsWith(i18n_key));

    for (let t = 0; t < transUnits.length; t++) {
      const id = transUnits[t].getAttribute('id');
      const source_string = getXMLElementToString(
        'source',
        transUnits[t].getElementsByTagName('source')[0]
      );
      const target = transUnits[t].getElementsByTagName('target')[0];


      if (id && id.startsWith(i18n_key)) {
        const index = key_segments.findIndex(x => x.key === id);
        if (index !== -1) {
          if (source_string === key_segments[index].source) {
            if (key_segments[index].target === '') {
              const newNode = domParser.parseFromString('<target state="needs-translation">' + '@@@@@' + key_segments[index].source + '@@@@@' + '</target>', 'text/xml');
              xml.replaceChild(newNode, target);
            } else {
              const newNode = domParser.parseFromString('<target state="final">' + key_segments[index].target + '</target>', 'text/xml');
              xml.replaceChild(newNode, target);
            }
          } else {
            console.error('key error : source are not equivalent');
          }
        } else {
          console.error('Id is missing in the xliff file : ' + id);
        }
      } else {
        // Proccessing and updating the xliff file
        for (let i = 0; i < source_segments.length; i++) {
          if (source_string === source_segments[i].source) {
            if (source_segments[i].target === '') {
              const newNode = domParser.parseFromString('<target state="needs-translation">' + '@@@@@' + source_segments[i].source + '@@@@@' + '</target>', 'text/xml');
              xml.replaceChild(newNode, target);
            } else {
              const newNode = domParser.parseFromString('<target state="final">' + source_segments[i].target + '</target>', 'text/xml');
              xml.replaceChild(newNode, target);
            }
          }
        }
      }
    }

    require('fs').writeFile(targetXliffs[x], xml, (err: any) => {
      if (err) {
        console.error(err);
      }
    });
  }
  console.log('Merge successful !');
}

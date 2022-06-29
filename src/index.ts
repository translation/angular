import xmlDom from '@xmldom/xmldom';
import reader from 'fs';
import minimist from 'minimist';
import { InitRequest, InitSegmentRequest } from './types/init/init.request';
import { Options } from './types/options';
import { PullResponse, PullSegmentResponse } from './types/pull/pull.response';
import { SyncRequest, SyncSegmentRequest } from './types/sync/sync.request';
import { SyncResponse } from './types/sync/sync.response';
import { delay, getUniqueSegmentFromPull, getXMLElementToString, httpCall } from './utils';
const domParser = new xmlDom.DOMParser();



// Get CLI arguments
const argv = minimist(process.argv.slice(2));
const options: Options = JSON.parse(
  reader.readFileSync(argv['options'], 'utf8')
);

// Set arguments 
// Type of extract
const i18nKey = options.i18n_key.trim();

// Source arg.
const sourceLanguage: string = options.source_language.language.trim();
const sourceFile: string = options.source_language.file.trim();

// Targets arg.
const targetLanguages: string[] = [];
const targetFiles: string[] = [];
for (let i = 0; i < options.target_languages.length; i++) {
  targetLanguages.push(options.target_languages[i].language.trim());
  targetFiles.push(options.target_languages[i].file.trim());
}

// Api arg.
const apiKey: string = options.api_key.trim();

// Proxy arg.
let proxyUrl: string = '';
if (options.proxy) {
  proxyUrl = options.proxy.trim();
}



/*********** INIT ***********/
if (argv['init']) {
  console.log('Start init');
  // Init objects
  const initRequest = new InitRequest();
  initRequest.source_language = sourceLanguage;
  initRequest.target_languages = targetLanguages.slice();

  // For each target languages, we do some process
  for (let x = 0; x < initRequest.target_languages.length; x++) {
    // Get and read file for the current target language
    const raw = reader.readFileSync(targetFiles[x], 'utf8');
    const xml = domParser.parseFromString(raw, 'text/xml');
    const transUnits = xml.getElementsByTagName('trans-unit');

    const segments: InitSegmentRequest[] = [];
    for (let t = 0; t < transUnits.length; t++) {
      const id = transUnits[t].getAttribute('id');
      if (id && (segments.findIndex(x => x.key === id) === -1)) {
        const initSegmentRequest = new InitSegmentRequest(id, i18nKey);

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
        console.error(id ? 'Duplicated ids' + id : 'Id not set');
      }
    }
    initRequest.segments[initRequest.target_languages[x]] = segments.slice();
  }
  const url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  httpCall('POST', url, initRequest, proxyUrl).then(
    () => { console.log('Init successful !'); },
    err => { console.log('Init error !', err); }
  );
}



/*********** SYNC ***********/
if (argv['sync']) {
  pull().then(async () => {
    console.log('Start sync');

    await delay(3000);

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
    const raw = reader.readFileSync(sourceFile, 'utf8');
    const xml = domParser.parseFromString(raw, 'text/xml');
    const transUnits = xml.getElementsByTagName('trans-unit');

    const segments: SyncSegmentRequest[] = [];
    for (let t = 0; t < transUnits.length; t++) {
      const id = transUnits[t].getAttribute('id');
      if (id && (segments.findIndex(x => x.key === id) === -1)) {
        const syncSegmentRequest = new SyncSegmentRequest(id, i18nKey);

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

    const url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
    // We post the JSON into translation.io
    try {
      const response: SyncResponse = await httpCall('POST', url, syncRequest, proxyUrl);
      console.log('Sync successful !');
      merge(response);
    } catch {
      console.log('Sync error !');
    }
  }, () => { });
}



/*********** PULL ***********/
export async function pull(): Promise<any> {
  console.log('Start pull');
  const url = 'https://translation.io/api/v1/source_edits/pull.json?api_key=' + apiKey;
  const params = '&timestamp=0';
  // We post the JSON into translation.io
  try {
    const response: PullResponse = await httpCall('GET', url, params, proxyUrl);
    if (response.source_edits.length > 0) {
      const files = targetFiles.slice();
      files.push(sourceFile);

      const languages = targetLanguages.slice();
      languages.push(sourceLanguage);

      // Remove old edits from response
      const segments: PullSegmentResponse[] = getUniqueSegmentFromPull(response.source_edits);

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

        reader.writeFile(files[x], xml + "", (err: any) => {
          if (err) {
            console.error('Write file', err);
          }
        });
      }
    }
    console.log('Pull successful !');
    return Promise.resolve();
  } catch {
    console.log('Pull error !');
    return Promise.reject();
  }
}



/*********** MERGE ***********/
export function merge(sync: SyncResponse): void {
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
      const source_string = getXMLElementToString(
        'source',
        transUnits[t].getElementsByTagName('source')[0]
      );
      const target = transUnits[t].getElementsByTagName('target')[0];

      if (id && id.startsWith(i18nKey)) {
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
            console.error('Source are not equivalent : ' + source_string + ' ||| ' + key_segments[index].source);
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
    reader.writeFile(targetFiles[x], xml + "", (err: any) => {
      if (err) {
        console.error('Write file', err);
      }
    });
  }
  console.log('Merge successful !');
}
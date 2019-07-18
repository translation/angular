import * as xmlDom from 'xmldom';
import { TioInitRequest } from './types/init/TioInit.request';
import { TioInitSegmentRequest } from './types/init/TioInitSegment.request';
import { TioSyncRequest } from './types/sync/TioSync.request';
import { TioSyncSegmentRequest } from './types/sync/TioSyncSegment.request';
import { TioSyncResponse } from './types/sync/TioSync.response';
const dom = new xmlDom.DOMParser();

// Get CLI arguments
var argv = require('minimist')(process.argv.slice(2));

// Manage arguments 
// source arg.
var argSource: string[] = argv['source'].trim().split(':');
var sourceLanguage = argSource[0].trim();
var sourceXliff = argSource[1].trim();

// targets arg.
var argTargets = argv['targets'].trim().split(',');
var targetLanguages: string[] = [];
var targetXliffs: string[] = [];
for (var i = 0; i < argTargets.length; i++) {
  var argTarget = argTargets[i].trim().split(':');
  targetLanguages.push(argTarget[0].trim());    // key
  targetXliffs.push(argTarget[1].trim());       // value
}

// api key
var apiKey = argv['apiKey'];


/***********INIT***********/
if (argv['init']) {
  console.log('Start init');
  // Init objects
  var tioInitRequest = new TioInitRequest();
  tioInitRequest.source_language = sourceLanguage;
  tioInitRequest.target_languages = targetLanguages.slice();

  // For each targets-languages, we do some process
  for (var x = 0; x < tioInitRequest.target_languages.length; x++) {
    // Get and read file for the current targets-languages
    var raw = require('fs').readFileSync(targetXliffs[x], 'utf8');

    // Get tags <source> and <target> from the file
    var xml = dom.parseFromString(raw, 'text/xml');
    var source = xml.getElementsByTagName('source');
    var target = xml.getElementsByTagName('target');

    // We only keep raw values and we remove tags <source ...></source> and <target ...></target> from it
    var arraySource: string[] = [];
    var arrayTarget: string[] = [];

    var regexSource = new RegExp('<source .*?>');
    var regexTarget = new RegExp('<target .*?>');
    for (var i = 0; i < source.length; i++) {
      arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').replace(/\s+/g, ' ').trim();
    }
    for (var j = 0; j < target.length; j++) {
      arrayTarget[j] = (target[j] + '').trim().replace(regexTarget, '').replace('</target>', '').replace(/\s+/g, ' ').trim();
    }

    // Only if the number of tags are the same, we process and we complete the json object for translatio.io
    if (arraySource.length === arrayTarget.length) {
      var segment = arraySource.map<TioInitSegmentRequest>((src, index) => {
        var x = new TioInitSegmentRequest();
        x.source = src;
        x.target = arrayTarget[index];
        return x;
      });
      tioInitRequest.segments[tioInitRequest.target_languages[x]] = segment;
    } else {
      console.error('The number of <source> & <target> are not equivalent in the file : ' + targetXliffs[x]);
    }
  }

  var url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  require('axios').post(url, tioInitRequest).then((res: any) => {
    console.log('Init successful !');
    console.log('{ status: ' + res.status + ' }');
    console.log(res.data);
  }).catch((error: any) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('{ status: ' + error.response.status + ' }');
      console.error(error.response.data);
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
    console.error(error.config);
  })

  // // Test : We create a file to see the result
  // require('fs').writeFile("translation-io-init.json", JSON.stringify(tioInitRequest), (err: any) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
}





/***********SYNC***********/
if (argv['sync']) {
  console.log('Start sync');
  // Init objects
  var tioSyncRequest = new TioSyncRequest();
  tioSyncRequest.source_language = sourceLanguage;
  tioSyncRequest.target_languages = targetLanguages.slice(); // key

  // Get and read file "source" for the sync
  var raw = require('fs').readFileSync(sourceXliff, 'utf8');
  // Get tags <source> from the file
  var xml = dom.parseFromString(raw, 'text/xml');
  var source = xml.getElementsByTagName('source');

  // We only keep raw values and we remove tags <source ...></source> from it
  var arraySource: string[] = [];
  var regexSource = new RegExp('<source .*?>');
  for (var i = 0; i < source.length; i++) {
    arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').replace(/\s+/g, ' ').trim();
  }

  // We complete the json object for translatio.io
  tioSyncRequest.segments = arraySource.map<TioSyncSegmentRequest>(src => {
    var x = new TioSyncSegmentRequest();
    x.source = src;
    return x;
  });

  var url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  require('axios').post(url, tioSyncRequest).then((res: any) => {
    console.log('Sync successfull !');
    console.log('{ status: ' + res.status + ' }');
    mergeXliff(targetXliffs, tioSyncRequest.target_languages, res.data);
  }).catch((error: any) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('{ status: ' + error.response.status + ' }');
      console.error(error.response.data);
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
    console.error(error.config);
  });

  // // Test : We create a file to see the result
  // require('fs').writeFile("translation-io-sync.json", JSON.stringify(tioSyncRequest), (err: any) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
}


export function mergeXliff(filesToMerge: string[], target_languages: string[], sync: TioSyncResponse): void {
  console.log('Start merge');
  // For each filesToMerge, we do some process
  for (var x = 0; x < filesToMerge.length; x++) {
    // Get and read file for the merge
    var raw = require('fs').readFileSync(filesToMerge[0], 'utf8');

    // Get tags <source> and <target> from the file
    var xml = dom.parseFromString(raw, 'text/xml');
    var source = xml.getElementsByTagName('source');
    var target = xml.getElementsByTagName('target');

    // Proccess the <source> like in the sync to permit comparison
    var arraySource: any[] = [source.length];
    var regexSource = new RegExp('<source .*?>');
    for (var i = 0; i < source.length; i++) {
      arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').replace(/\s+/g, ' ').trim();
    }

    var segment = sync.segments[target_languages[x]];
    for (var i = 0; i < segment.length; i++) {
      // If sources are equals -> we can update the <target> tag.
      console.log(segment[i].target);
      // var index = arraySource.indexOf(segment[i].source);
      // console.log(index);
      // if(index > -1) {
      //   var h = xml.createElement('target', );
      //   h.setAttribute("state", "final");
      //   var t = xml.createTextNode('fdfd');
      //   h.append(t);
      //   target[index].replaceChild(h, target[index]);
      //   console.log(target[index] + '');
      // }
    }
  }
  console.log('Merge successful');
}
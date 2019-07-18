import * as xmlDom from 'xmldom';
const dom = new xmlDom.DOMParser();
import { TioInitRequest } from './types/init/TioInitRequest';
import { TioInitSegment } from './types/init/TioInitSegment';
import { TioSyncRequest } from './types/sync/TioSyncRequest';
import { TioSyncSegment } from './types/sync/TioSyncSegment';



// Get CLI arguments
var argv = require('minimist')(process.argv.slice(2));
var apiKey = argv['apiKey'];



/***********INIT***********/
if (argv['init']) {
  // Init objects
  var tioInitRequest = new TioInitRequest();
  var files = [];

  // Process CLI args
  tioInitRequest.source_language = argv['source'].trim();

  var targets = argv['targets'].trim().split(',');
  for (var i = 0; i < targets.length; i++) {
    var tmp = targets[i].trim().split(':');
    tioInitRequest.target_languages.push(tmp[0].trim()); // key
    files.push(tmp[1].trim()); // value
  }

  // Foreach targets languages, we do some process
  for (var x = 0; x < tioInitRequest.target_languages.length; x++) {
    // Get and read file for the current target
    var raw = require('fs').readFileSync(files[x], 'utf8');

    // Get tags <source> and <target> from the file
    var doc = dom.parseFromString(raw, 'text/xml');
    var source = doc.getElementsByTagName('source');
    var target = doc.getElementsByTagName('target');

    // We only keep raw values and we remove tags <source ...></source> and <target ...></target> from it
    var arraySource: any[] = [source.length];
    var arrayTarget: any[] = [target.length];

    var regexSource = new RegExp('<source .*?>');
    var regexTarget = new RegExp('<target .*?>');
    for (var i = 0; i < source.length; i++) {
      arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').trim();
    }
    for (var j = 0; j < target.length; j++) {
      arrayTarget[j] = (target[j] + '').trim().replace(regexTarget, '').replace('</target>', '').trim();
    }

    // Only if the number of tags are the same, we process and we complete the json object for translatio.io
    if (arraySource.length === arrayTarget.length) {
      var segment = arraySource.map<TioInitSegment>((source, index) => {
        var x = new TioInitSegment();
        x.source = source;
        x.target = arrayTarget[index];
        return x;
      });
      tioInitRequest.segments[tioInitRequest.target_languages[x]] = segment;
    } else {
      console.error('The number of <source> & <target> are not equivalent in the file : ' + files[x]);
    }
  }

  var url = 'https://translation.io/api/v1/segments/init.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  require('axios').post(url, tioInitRequest).then((res: any) => {
    console.error('Init successful !');
    console.log(res)
  }).catch((error: any) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      console.error(error.response.status);
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
}





/***********SYNC***********/
if (argv['sync']) {
  // Init objects
  var tioSyncRequest = new TioSyncRequest();

  // Process CLI args
  var tmp = argv['source'].trim().split(':');
  tioSyncRequest.source_language = tmp[0].trim();
  var file = tmp[1].trim();

  var targets = argv['targets'].trim().split(',');
  for (var i = 0; i < targets.length; i++) {
    var tmp = targets[i].trim();
    tioSyncRequest.target_languages.push(targets[i].trim());
  }

  // Get and read file for the sync
  var raw = require('fs').readFileSync(file, 'utf8');

  // Get tags <source> from the file
  var doc = dom.parseFromString(raw, 'text/xml');
  var source = doc.getElementsByTagName('source');

  // We only keep raw values and we remove tags <source ...></source> from it
  var arraySource: any[] = [source.length];
  var regexSource = new RegExp('<source .*?>');
  for (var i = 0; i < source.length; i++) {
    arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').trim();
  }

  // We complete the json object for translatio.io
  tioSyncRequest.segments = arraySource.map<TioSyncSegment>(source => {
    var x = new TioSyncSegment();
    x.source = source;
    return x;
  });

  var url = 'https://translation.io/api/v1/segments/sync.json?api_key=' + apiKey;
  // We post the JSON into translation.io
  require('axios').post(url, tioSyncRequest).then((res: any) => {
    console.log('Sync successfull !');
    console.log(res);
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
}
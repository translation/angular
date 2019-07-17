import * as xmlDom from 'xmldom';
const dom = new xmlDom.DOMParser();
import { TioInitRequest } from './types/init/TioInitRequest';
import { TioInitSegment } from './types/init/TioInitSegment';
import { TioSyncRequest } from './types/sync/TioSyncRequest';
import { TioSyncSegment } from './types/sync/TioSyncSegment';

// Get CLI arguments
var argv = require('minimist')(process.argv.slice(2));

/***********INIT***********/
// node dist/ng2-translation-io/index.js --init --source='fr-BE' --targets='en:./src/assets/locale/messages.en.xlf, nl-BE:./src/assets/locale/messages.nl.xlf'

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

    // We only keep raw values and we remove tags <source ...></source> and <target ...></target> from them
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

    // Only if the number of tags are the same, we process and we create the json object for translatio.io
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

  // Finally, we create a json file
  require('fs').writeFile("translation-io-init.json", JSON.stringify(tioInitRequest), (err: any) => {
    if (err) {
      console.log(err);
    }
  });
}


/***********SYNC***********/
// node dist/ng2-translation-io/index.js --sync --source='fr-BE:./src/assets/locale/messages.fr.xlf' --targets='en, nl-BE'

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

  // We only keep raw values and we remove tags <source ...></source> and <target ...></target> from them
  var arraySource: any[] = [source.length];
  var regexSource = new RegExp('<source .*?>');
  for (var i = 0; i < source.length; i++) {
    arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').trim();
  }

  // We create the json object for translatio.io
  tioSyncRequest.segments = arraySource.map<TioSyncSegment>(source => {
    var x = new TioSyncSegment();
    x.source = source;
    return x;
  });

  // Finally, we create a json file
  require('fs').writeFile("translation-io-sync.json", JSON.stringify(tioSyncRequest), (err: any) => {
    if (err) {
      console.log(err);
    }
  });
}
import * as xmlDom from 'xmldom';
const dom = new xmlDom.DOMParser();
import { TioInitRequest } from './types/TioInitRequest';
import { TioSegment } from './types/TioSegment';

// Get CLI arguments
var argv = require('minimist')(process.argv.slice(2));

/***********INIT***********/
if (argv['init']) {
  // Init objects
  var tioInitRequest = new TioInitRequest();
  tioInitRequest.source_language = argv['source'];
  var files = [];

  // Process CLI args
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
      var segment = arraySource.map<TioSegment>((source, index) => {
        var x = new TioSegment();
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

if (argv['sync']) {

}
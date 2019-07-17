import * as xmlDom from 'xmldom';
import { TioInitRequest } from './types/TioInitRequest';
import { TioSegment } from './types/TioSegment';
const dom = new xmlDom.DOMParser();

// on récupère les arguments du CLI
var argv = require('minimist')(process.argv.slice(2));

// init des objets 
var tioInitRequest = new TioInitRequest();
tioInitRequest.source_language = argv['source'];
var files = [];

// on traite les arguments reçus
var targets = argv['targets'].trim().split(',');
for (var i = 0; i < targets.length; i++) {
  var tmp = targets[i].trim().split(':');
  tioInitRequest.target_languages.push(tmp[0].trim()); // key
  files.push(tmp[1].trim()); // value
}

for (var x = 0; x < tioInitRequest.target_languages.length; x++) {
  // récupération et lecture du fichier
  var raw = require('fs').readFileSync(files[x], 'utf8');

  // récupération des tags source et target
  var doc = dom.parseFromString(raw, 'text/xml');
  var source = doc.getElementsByTagName('source');
  var target = doc.getElementsByTagName('target');

  // on récupère uniquement leur contenu
  var arraySource: any[] = [source.length];
  var arrayTarget: any[] = [target.length];
  // et on retire les balises sources + targets
  var regexSource = new RegExp('<source .*?>');
  var regexTarget = new RegExp('<target .*?>');
  for (var i = 0; i < source.length; i++) {
    arraySource[i] = (source[i] + '').trim().replace(regexSource, '').replace('</source>', '').trim();
  }
  for (var j = 0; j < target.length; j++) {
    arrayTarget[j] = (target[j] + '').trim().replace(regexTarget, '').replace('</target>', '').trim();
  }

  // on crée le segment seulement s'il y a le même nombre d'élements 
  if (arraySource.length === arrayTarget.length) {
    var segment = arraySource.map<TioSegment>((source, index) => {
      var x = new TioSegment();
      x.source = source;
      x.target = arrayTarget[index];
      return x;
    });

    if (tioInitRequest.target_languages[x] === 'nl') {
      tioInitRequest.segments.nl = segment;
    }
    if (tioInitRequest.target_languages[x] === 'en') {
      tioInitRequest.segments.en = segment;
    }
  } else {
    console.error('The number of <source> & <target> are not equivalent in the file : ' + files[x]);
  }
}

require('fs').writeFile("translation-io-init.json", JSON.stringify(tioInitRequest), (err: any) => {
  if (err) {
    console.log(err);
  }
});
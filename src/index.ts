import * as xmlDom from 'xmldom';
import { TioInitRequest } from './types/TioInitRequest';
import { TioSegment } from './types/TioSegment';
const dom = new xmlDom.DOMParser();

console.log('Translation-io');

var tioInitRequest = new TioInitRequest();
tioInitRequest.source_language = 'fr';
tioInitRequest.target_languages = ['en', 'nl'];

for (var x = 0; x < tioInitRequest.target_languages.length; x++) {
  // récupération et lecture du fichier
  const file = './src/assets/locale/messages.' + tioInitRequest.target_languages[x] + '.xlf';
  var raw = require('fs').readFileSync(file, 'utf8');

  // récupération des tags source et target
  var doc = dom.parseFromString(raw, 'text/xml');
  var source = doc.getElementsByTagName('source');
  var target = doc.getElementsByTagName('target');

  // on récupère uniquement leur contenu
  var arraySource: any[] = [source.length];
  var arrayTarget: any[] = [target.length];
  for (var i = 0; i < source.length; i++) {
    arraySource[i] = source[i].childNodes;
  }
  for (var j = 0; j < target.length; j++) {
    arrayTarget[j] = target[j].childNodes;
  }

  // on crée le segment seulement s'il y a le même nombre d'élements 
  if(arraySource.length === arrayTarget.length) {
    const segment = arraySource.map<TioSegment>((source, index) => {
      const x = new TioSegment();
      x.source = source;
      x.target = arrayTarget[index];
      return x;
    });

    if(tioInitRequest.target_languages[x] === 'nl') {
      tioInitRequest.segments.nl = segment;
    }
    if(tioInitRequest.target_languages[x] === 'en') {
      tioInitRequest.segments.en = segment;
    }
  } else {
    console.error('PROBLEME DANS LES FICHIERS'); 
  } 
}

console.log(tioInitRequest);


// {
//   "source_language": "en",
//   "target_languages": ["fr", "es"],
//   "segments": {
//     "fr": [segment_1_fr, segment_2_fr, ...],
//     "es": [segment_1_es, segment_2_es, ...]
//   }
// }


// {
//   "type": "source",
//   "source": "Hello world",
//   "target": "Bonjour le monde"
// }
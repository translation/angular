import * as xmlDom from 'xmldom';
import { TioInitRequest } from './types/TioInitRequest';
import { TioSegment } from './types/TioSegment';
const dom = new xmlDom.DOMParser();

console.log('Translation-io');

      /* SOLUTION 1 avec les QUERY */

// const source = './src/assets/locale/messages.fr.xlf';
// readXml.readXML(fs.readFileSync(source), function (err, data) {
//   const val = XmlReader.parseSync(data.content, { emitTopLevelOnly: true });

//   const request = xmlQuery(val).find('trans-unit');
//   // console.log(request);

//   xmlQuery(request).each(transunit => {
//     // console.log(transunit);
//     transunit.children().each(child => {
//       var source = xmlQuery(child).find('source').text();
//       console.log(source);

//       var target = xmlQuery(child).find('target').text();
//       console.log(target);
//     })
//   });

// });


      /* SOLUTION 2 plus "traditionnelle" */

// const source = './src/assets/locale/messages.fr.xlf';
// readXml.readXML(fs.readFileSync(source), function (err, data) {
//   var doc = dom.parseFromString(data.content, 'text/xml');
//   var source = doc.getElementsByTagName('source');
//   var tmp = '';
//   for (var i = 0; i < source.length; i++) {
//     tmp += source[i].firstChild;
//   }
//   console.log(tmp)
// });




      /* Test qui marche */

// var file = require('fs').readFileSync(source, 'utf8');
// var doc = dom.parseFromString(file, 'text/xml');
// var src = doc.getElementsByTagName('source');
// var tmp = '';
// for (var i = 0; i < src.length; i++) {
//   tmp += src[i];
// }
// var array = tmp.split('<source xmlns="urn:oasis:names:tc:xliff:document:1.2">');
// for (var i = 0; i < array.length; i++) {
//   array[i] = array[i].replace('</source>', '');
//   console.log(array[i]);
// }


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
    console.error('PROBLEME FICHIER'); 
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
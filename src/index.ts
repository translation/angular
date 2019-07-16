const XmlReader = require('xml-reader');
const xmlQuery = require('xml-query');
const fs = require('fs');
const readXml = require('read-xml');

import * as xmlDom from 'xmldom';
const dom = new xmlDom.DOMParser();

console.log('Translation-io');

const source = './src/assets/locale/messages.fr.xlf';

        /* SOLUTION 1 avec les QUERY */

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

readXml.readXML(fs.readFileSync(source), function (err, data) {
  var doc = dom.parseFromString(data.content, 'text/xml');
  var source = doc.getElementsByTagName('source');
  for (var i = 0; i < source.length; i++) {
    if(source[i].firstChild !== null) {
      console.log(source[i].nodeName + ' = ' + source[i].textContent);
    }
  }
});

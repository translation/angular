const fs = require('fs')
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')


class Base {
  constructor(configFile) {
    this.configFile = configFile || 'tio.config.json' // default config file
  }

  options() {
    return JSON.parse(
      fs.readFileSync(this.configFile)
    )
  }

  sourceLocale() {
    return this.options()['source_locale'].trim()
  }

  targetLocales() {
    return this.options()['target_locales'].map(locale => locale.trim())
  }

  convertXmlUnitsToSegments(xmlUnits) {
    //console.log(xmlUnits)
    return Array.from(xmlUnits).map(xmlUnit =>
      this.convertXmlUnitToSegment(xmlUnit)
    )
  }

  convertXmlUnitToSegment(xmlUnit) {
    //console.log(xmlUnit)

    return {
      type: 'source',
      source: new XMLSerializer().serializeToString(
        xmlUnit.getElementsByTagName("source")[0].childNodes[1]
      )
    }


    // y = x.childNodes[0];
    // z = y.nodeValue;

    // return {
    //   type: 'source',
    //   source:
    //   target:
    //   context:
    //   comment:
    //   references:
    // }

    // const sourceElement = transUnits.getElementsByTagName('source')[0];
    // if (sourceElement) {
    //     this.source = (0, utils_1.getXMLElementToString)('source', sourceElement);
    // }
    // // We need to process first the source and then the target
    // this.addTarget(transUnits);

    // <trans-unit id="introductionHeader" datatype="html">
    //   <source> Hello i18n! </source>
    //   <target state="new"> Hello i18n! </target>
    //   <context-group purpose="location">
    //     <context context-type="sourcefile">src/app/app.component.html</context>
    //     <context context-type="linenumber">1,3</context>
    //   </context-group>
    //   <note priority="1" from="description">An introduction header for this sample</note>
    //   <note priority="1" from="meaning">User welcome</note>
    // </trans-unit>
  }
}

module.exports = Base


const Base = require('./base')

const fs = require('fs')
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

class Init extends Base {
  constructor(configFile) {
    super(configFile)
  }

  run() {
    console.log('Init.run()')
    console.log(this.configFile)
    console.log(this.sourceLocale())
    console.log(this.targetLocales())

    const sourceXml = new DOMParser().parseFromString(
      fs.readFileSync('./src/locale/messages.xlf', 'utf8'),
      'text/xml'
     )

    const sourceXmlUnits = sourceXml.getElementsByTagName('trans-unit')
    const sourceSegments = this.convertXmlUnitsToSegments(sourceXmlUnits)

    console.log(sourceSegments)
  }
}

module.exports = Init



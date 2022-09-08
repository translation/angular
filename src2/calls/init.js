const Base = require('./base')

const fs = require('fs')
const axios = require('axios').default
const { XMLParser, XMLBuilder } = require('fast-xml-parser')

class Init extends Base {
  constructor(configFile) {
    super(configFile)
  }

  run() {
    console.log('Init.run()')
    console.log(this.configFile)

    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      stopNodes:        ['*.source', '*.target'] // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md#stopnodes
    })

    const sourceRaw      = fs.readFileSync(this.sourceFile())
    const sourceXml      = xmlParser.parse(sourceRaw)
    const sourceXmlUnits = sourceXml.xliff.file.body['trans-unit']
    const sourceSegments = this.convertXmlUnitsToSegments(sourceXmlUnits)

    let request = {
      source_language:  this.sourceLanguage(),
      target_languages: this.targetLanguages(),
      segments:         {}
    }

    this.targetLanguages().forEach(language => {
      const targetFile     = this.targetFile(language)
      let   targetSegments = []

      if (fs.existsSync(targetFile)) {
        const targetRaw      = fs.readFileSync(this.targetFile(language))
        const targetXml      = xmlParser.parse(targetRaw)
        const targetXmlUnits = targetXml.xliff.file.body['trans-unit']
        targetSegments       = this.convertXmlUnitsToSegments(targetXmlUnits)
      }

      let translatedSourceSegment = sourceSegments.map(sourceSegment => {
        return Object.assign({}, sourceSegment, { target: this.findExistingTarget(sourceSegment, targetSegments) })
      })

      request['segments'][language] = translatedSourceSegment
    })

    const url = `${this.endpoint()}/v1/segments/init.json?api_key=${this.apiKey()}`

    axios.post(url, request, { headers: { 'Content-Type': 'application/json' }})
         .then(
           response => console.log(response.status, response.data),
           error    => console.log(error.message)
         )

    // console.log(request)
    //console.log(JSON.stringify(request, null, 4));
  }
}

module.exports = Init


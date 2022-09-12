const Base = require('./base')

const fs    = require('fs')
const axios = require('axios').default

class Init extends Base {
  constructor(configFile) {
    super(configFile)
  }

  run() {
    console.log('Init.run()')

    const sourceRaw      = fs.readFileSync(this.sourceFile())
    const sourceXml      = this.xmlParser().parse(sourceRaw)
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
        const targetRaw      = fs.readFileSync(targetFile)
        const targetXml      = this.xmlParser().parse(targetRaw)
        const targetXmlUnits = targetXml.xliff.file.body['trans-unit']
        targetSegments       = this.convertXmlUnitsToSegments(targetXmlUnits)
      }

      // Create hash to get target segments in O(1)


      const targetSegmentsHash = {}
      targetSegments.forEach(targetSegment =>
        targetSegmentsHash[this.uniqueIdentifier(targetSegment)] = targetSegment
      )




      // For "init", we want to send source text from ".xlf" files, associated with existing translations from ".{locale}.xlf" files
      let translatedSourceSegment = sourceSegments.map(sourceSegment => {
        const targetSegment = targetSegmentsHash[this.uniqueIdentifier(sourceSegment)]
        const target        = targetSegment ? targetSegment.target : ''

        return Object.assign({}, sourceSegment, { target: target })
      })

      request['segments'][language] = translatedSourceSegment
    })

    const url = `${this.endpoint()}/v1/segments/init.json?api_key=${this.apiKey()}`

    axios.post(url, request, { headers: { 'Content-Type': 'application/json' }})
         .then(
           response => this.writeTargetFiles(response.data),
           error    => {
             console.error('HTTP REQUEST ERROR')
             console.error(error.message)
             if (error.response)
               console.error(error.response.data)
           }
         )
  }
}

module.exports = Init


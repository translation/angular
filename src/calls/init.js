const Base = require('./base')

const fs    = require('fs')
const axios = require('axios').default

class Init extends Base {
  constructor(configFile, flags) {
    super(configFile)
  }

  run() {
    console.log('Init.run()')

    // 1. Prepare Translation.io request
    let request = {
      source_language:  this.sourceLanguage(),
      target_languages: this.targetLanguages(),
      segments:         {}
    }

    // 2. Load source .xlf as list of segments for Translation.io API
    const sourceRaw      = fs.readFileSync(this.sourceFile())
    const sourceXml      = this.xmlParser().parse(sourceRaw)
    const sourceXmlUnits = [sourceXml.xliff.file.body['trans-unit']].flat()
    const sourceSegments = this.convertXmlUnitsToSegments(sourceXmlUnits)

    // 3. For each exising source segment, detect if any translation already exists in target .xlf files
    this.targetLanguages().forEach(language => {
      const targetFile     = this.targetFile(language)
      let   targetSegments = []

      if (fs.existsSync(targetFile)) {
        const targetRaw      = fs.readFileSync(targetFile)
        const targetXml      = this.xmlParser().parse(targetRaw)
        const targetXmlUnits = [targetXml.xliff.file.body['trans-unit']].flat()
        targetSegments       = this.convertXmlUnitsToSegments(targetXmlUnits)
      }

      const targetSegmentsHash = this.buildSegmentsHash(targetSegments)

      // Generate list of (maybe translated) target language segments to send to the API
      // in order to populate the project for the first time.
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
             if (error.response) {
               console.error(error.response.data)
             }

             process.exitCode = 1
           }
         )
  }

  // For O(1) search optimization
  buildSegmentsHash(segments) {
    const segmentsHash = {}

    segments.forEach(segment =>
      segmentsHash[this.uniqueIdentifier(segment)] = segment
    )

    return segmentsHash
  }
}

module.exports = Init


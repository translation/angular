const Base = require('./base')

const fs = require('fs')

class Init extends Base {
  constructor(configFile, flags) {
    super(configFile)
  }

  run() {
    console.log("\n🏁 Starting Translation.io Init process, please wait 🏁")

    // Validate the options before proceeding
    if (! this.validateOptions()) {
      console.error("\n❌ The Init process could not be executed, because some of the parameters in your tio.config.json file are invalid ❌")
      return false
    }

    // 1. Prepare Translation.io request
    let request = {
      client:           'angular',
      version:          require('../../package.json').version,
      source_language:  this.sourceLanguage(),
      target_languages: this.targetLanguages(),
      segments:         {}
    }

    // 2. Load source .xlf as list of segments for Translation.io API
    const sourceRaw      = fs.readFileSync(this.sourceFile())
    const sourceXml      = this.xmlParser().parse(sourceRaw)
    const sourceXmlUnits = this.forceArray(sourceXml.xliff.file.body['trans-unit']) // Ensure consistent array
    const sourceSegments = this.convertXmlUnitsToSegments(sourceXmlUnits)

    this.checkEmptySource(sourceSegments)

    // 3. For each exising source segment, detect if any translation already exists in target .xlf files
    this.targetLanguages().forEach(language => {
      const targetFile     = this.targetFile(language)
      let   targetSegments = []

      if (fs.existsSync(targetFile)) {
        const targetRaw      = fs.readFileSync(targetFile)
        const targetXml      = this.xmlParser().parse(targetRaw)
        const targetXmlUnits = this.forceArray(targetXml.xliff.file.body['trans-unit']) // Ensure consistent array
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

    // 4. Send source/target segments and save response
    const axios = this.axiosClient()
    const url   = `${this.endpoint()}/v1/segments/init.json?api_key=${this.apiKey()}`

    axios.post(url, request, { headers: { 'Content-Type': 'application/json' }})
         .then(
           response => {
             this.writeTargetFiles(response.data)
             console.log()
             console.log("🎉 Initialization successfully completed 🎉\n")
             console.log(`Use this URL to translate: ${response.data.project.url}`)
             console.log("Then use 'npm run translation:sync' or 'yarn translation:sync' ")
             console.log("to send new keys to Translation.io and get new translations into your project.")
           },
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


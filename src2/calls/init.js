const Base = require('./base')

const fs = require('fs')
const axios = require('axios').default

class Init extends Base {
  constructor(configFile) {
    super(configFile)
  }

  run() {
    console.log('Init.run()')
    console.log(this.configFile)

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

      // For "init", we want to send source text from ".xlf" files, associated with existing translations from ".{locale}.xlf" files
      let translatedSourceSegment = sourceSegments.map(sourceSegment => {
        return Object.assign({}, sourceSegment, { target: this.findExistingTarget(sourceSegment, targetSegments) })
      })

      request['segments'][language] = translatedSourceSegment
    })

    const url = `${this.endpoint()}/v1/segments/init.json?api_key=${this.apiKey()}`

    axios.post(url, request, { headers: { 'Content-Type': 'application/json' }})
         .then(
           response => this.writeTargetFiles(response.data),
           error    => console.log(error.response.data)
         )

    // console.log(request)
    //console.log(JSON.stringify(request, null, 4));
  }

  writeTargetFiles(response) {
    this.targetLanguages().forEach(language => {
      const targetFile = this.targetFile(language)

      // 1. Remove target .xlf file
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile)
      }

      // 2. Recreate it from generated .xlf template
      fs.copyFileSync(this.sourceFile(), targetFile)

      // 3. Populate it with targets from Translation.io
      const targetRaw      = fs.readFileSync(targetFile)
      const targetXml      = this.xmlParser().parse(targetRaw)
      const targetXmlUnits = targetXml.xliff.file.body['trans-unit']

      const translatedTargetSegments = response.segments[language]

      translatedTargetSegments.forEach(translatedTargetSegment => {
        const targetXmlUnit = targetXmlUnits.find(targetXmlUnit =>
          this.xmlUnitSource(targetXmlUnit) === translatedTargetSegment.source && this.xmlUnitContext(targetXmlUnit) === translatedTargetSegment.context
        )

        // Overwrite Xml target value of this segment
        if (targetXmlUnit) {
          targetXmlUnit.target = translatedTargetSegment.target
        }
      })

      const translatedTargetRaw = this.xmlBuilder().build(targetXml)

      fs.writeFileSync(targetFile, translatedTargetRaw);
    })
  }
}

module.exports = Init


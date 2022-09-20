const Base = require('./base')

const fs    = require('fs')
const axios = require('axios').default

class Sync extends Base {
  constructor(configFile, flags) {
    super(configFile)

    this.readonly = flags['readonly'] || false
    this.purge    = flags['purge']    || false
  }

  run() {
    console.log('Sync.run()')

    // 1. Extract source segments
    const sourceRaw      = fs.readFileSync(this.sourceFile())
    const sourceXml      = this.xmlParser().parse(sourceRaw)
    const sourceXmlUnits = sourceXml.xliff.file.body['trans-unit']
    const sourceSegments = this.convertXmlUnitsToSegments(sourceXmlUnits)

    // No need for target in sync request
    sourceSegments.forEach(sourceSegment => delete sourceSegment['target'])

    let request = {
      source_language:  this.sourceLanguage(),
      target_languages: this.targetLanguages(),
      segments:         sourceSegments,
      readonly:         this.readonly,
      purge:            this.purge
    }

    // 2. Send source segments and save translated target segments
    const url = `${this.endpoint()}/v1/segments/sync.json?api_key=${this.apiKey()}`

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
}

module.exports = Sync

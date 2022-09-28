const fs = require('fs')
const { segmentsIndex, segmentDelete, purgeProject } = require('../tio-utils')
const { it, assertEqual } = require('../spec-utils')

it('After init, segments on Translation.io should exist and be translated', () => {
  const apiKey = JSON.parse(fs.readFileSync('./tio.config.json'))['api_key']
  console.log(`Current project API key (for Node Matrix): ${apiKey}`)

  segmentsIndex(apiKey, "fr", (jsonResponse) => {
    // Remove ids from response
    let response = JSON.parse(jsonResponse)
    response['segments'].forEach(segment => delete segment['id'])

    const expected = JSON.parse(fs.readFileSync('../expected-response.json'))

    assertEqual(JSON.stringify(response), JSON.stringify(expected))
  })
})

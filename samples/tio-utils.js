const segmentsIndex = function(apiKey, targetLanguage, callback) {
  const exec = require('child_process').exec;

  const curlCmd = `curl -X GET https://translation.io/api/v1/segments.json \
                        -H 'Content-Type: application/json' \
                        -d '{ "api_key": "${apiKey}", "target_language": "${targetLanguage}" }'`

  exec(curlCmd, (error, jsonResponse, stderr) => {
    if (callback)
      callback(jsonResponse)
  })
}

const segmentDelete = function(apiKey, segmentId, callback) {
  const exec = require('child_process').exec;

  const curlCmd = `curl -X DELETE https://translation.io/api/v1/segments/${segmentId}.json \
                        -H 'Content-Type: application/json' \
                        -d '{ "api_key": "${apiKey}" }'`

  exec(curlCmd, (error, jsonResponse, stderr) => {
    if (callback)
      callback(jsonResponse)
  })
}

const purgeProject = function(apiKey, callback) {
  apiKey = apiKey.replace('.x', 'X') // to convert node version in GitHub Actions to correct API key
  const languages = ['fr', 'it']

  languages.forEach(language => {
    segmentsIndex(apiKey, language, (jsonResponse) => {
      const response = JSON.parse(jsonResponse)
      const segments = response["segments"] || []

      segments.map(segment => segment['id']).forEach(segmentId => {
        segmentDelete(apiKey, segmentId)
      })
    })
  })
}

module.exports = {
  segmentsIndex,
  segmentDelete,
  purgeProject
}

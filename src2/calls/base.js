const fs = require('fs')

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
    return this.options()['target_locales'].map((locale) => locale.trim())
  }
}

module.exports = Base

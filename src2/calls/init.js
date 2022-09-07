const Base = require('./base')

class Init extends Base {
  constructor(configFile) {
    super(configFile)
  }

  run() {
    console.log('Init.run()')
    console.log(this.configFile)
    console.log(this.sourceLocale())
    console.log(this.targetLocales())
  }
}

module.exports = Init

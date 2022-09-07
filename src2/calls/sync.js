const Base = require('./base')

class Init extends Base {
  constructor(configFile) {
    super(configFile)
  }

  run() {
    console.log('Sync.run()')
    console.log(this.configFile)
  }
}

module.exports = Init

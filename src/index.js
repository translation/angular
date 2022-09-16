const minimist = require('minimist')
const Init     = require('./calls/init')
const Sync     = require('./calls/sync')

const args = minimist(process.argv.slice(2))
let flags  = Object.assign({}, args)
delete flags._

if (args._.includes('init')) {
  let initService = new Init(args.config, flags)
  initService.run()
}
else if (args._.includes('sync')) {
  let syncService = new Sync(args.config, flags)
  syncService.run()
}
else {
  console.log('nothing')
}

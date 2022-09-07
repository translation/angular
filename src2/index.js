const minimist = require('minimist')
const Init     = require('./calls/init')
const Sync     = require('./calls/sync')

const args = minimist(process.argv.slice(2));

if (args._.includes('init')) {
  let initService = new Init(args.config)
  initService.run()
}
else if (args._.includes('sync')) {
  let syncService = new Sync(args.config)
  syncService.run()
}
else {
  console.log('nothing')
}

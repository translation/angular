const Init = require('./calls/init')
const Sync = require('./calls/sync')

const args   = process.argv.slice(2)
const action = args[0]
const config = args.find(arg => arg.includes('--config'))?.split('=')[1]
const flags  = {
  readonly: args.includes('--readonly'),
  purge:    args.includes('--purge')
}

if (action == 'init') {
  let initService = new Init(config, flags)
  initService.run()
}
else if (action == 'sync') {
  let syncService = new Sync(config, flags)
  syncService.run()
}
else {
  console.log('No action selected')
}

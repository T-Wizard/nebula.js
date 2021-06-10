const buildLegacy = require('./lib/build-legacy');
const build = require('./lib/build');
const watch = require('./lib/build-watch');
const init = require('./lib/init-config');

module.exports = {
  command: 'sense',
  desc: 'Build a nebula visualization as a Qlik Sense extension',
  builder(yargs) {
    init(yargs).argv;
  },
  handler(argv) {
    if (argv.watch) {
      watch(argv);
    } else if (argv.partial) {
      build(argv);
    } else {
      buildLegacy(argv);
    }
  },
};

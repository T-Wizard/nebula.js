/* eslint global-require: 0 */
const fs = require('fs');

const defaultFilename = 'nebula.config.js';
const RX = new RegExp(`${defaultFilename.replace(/\./g, '\\.')}$`);

const options = {
  config: {
    type: 'string',
    description: 'Path to config file',
    default: defaultFilename,
    alias: 'c',
  },
  ext: {
    type: 'string',
    required: false,
    desc: 'Extension definition',
  },
  meta: {
    type: 'string',
    required: false,
    desc: 'Extension meta information',
  },
  output: {
    type: 'string',
    required: false,
    default: '<name>-ext',
    desc: 'Destination directory',
  },
  minify: {
    type: 'boolean',
    required: false,
    default: true,
    desc: 'Minify and uglify code',
  },
  sourcemap: {
    description: 'Generate source map',
    type: 'boolean',
    alias: 'm',
    default: true,
  },
  partial: {
    type: 'boolean',
    required: false,
    default: false,
    desc: 'Generate partial extension',
    hidden: true,
  },
  watch: {
    description: 'Watch source files',
    type: 'boolean',
    alias: 'w',
    required: false,
    default: false,
    hidden: true,
  },
};

module.exports = (yargs) =>
  yargs.options(options).config('config', (configPath) => {
    if (configPath === null) {
      return {};
    }
    if (!fs.existsSync(configPath)) {
      if (RX.test(configPath)) {
        // do nothing if default filename doesn't exist
        return {};
      }
      throw new Error(`Config ${configPath} not found`);
    }
    return require(configPath).sense;
  });

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const build = require('@nebula.js/cli-build');

async function watch(argv) {
  const cwd = process.cwd();

  const supernovaPkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line
  const extName = supernovaPkg.name.split('/').reverse()[0]; // replace(/\//, '-').replace('@', '');

  let destination;
  if (argv.extensionDir) {
    destination = argv.extensionDir;
  } else {
    let qdirpath;
    if (process.env.EXT_DIR) {
      qdirpath = [cwd, process.env.EXT_DIR, extName];
    } else {
      qdirpath = [os.homedir(), 'Qlik', 'Sense', 'Extensions', extName];
      if (os.platform() === 'win32') {
        qdirpath.splice(1, 0, 'Documents');
      }
    }
    destination = path.resolve(...qdirpath);
  }

  const qextFileName = path.resolve(destination, `${extName}.qext`);
  const qextFileNameJs = qextFileName.replace(/\.qext$/, '.js');

  const createQextFiles = async () => {
    const qext = supernovaPkg.qext || {};
    if (argv.meta) {
      const meta = require(path.resolve(cwd, argv.meta)); // eslint-disable-line
      Object.assign(qext, meta);
    }
    const contents = {
      name: qext.name || extName,
      version: supernovaPkg.version,
      description: supernovaPkg.description,
      author: supernovaPkg.author,
      icon: qext.icon || 'extension',
      preview: qext.preview,
      type: 'visualization',
      supernova: true,
    };

    await fs.writeFile(qextFileName, JSON.stringify(contents, null, 2));
  };

  const destExists = await fs.pathExists(destination);
  if (!destExists) {
    await fs.mkdir(destination);
  }

  // TODO: watch for changes in package.json and rebuild qext files on changes
  await createQextFiles();

  await build({
    watch: true,
    config: argv.config,
    core: false,
    fileTarget: qextFileNameJs,
  });
}

module.exports = watch;

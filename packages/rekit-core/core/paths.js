const fs = require('fs');
const path = require('path');
const _ = require('lodash');

function join() {
  // A consistent and normalized version of path.join cross platforms
  return path.normalize(path.join.apply(path, arguments)).replace(/\\/g, '/');
}

let projectRoot;
function setProjectRoot(prjRoot) {
  projectRoot = /\/$/.test(prjRoot) ? prjRoot : prjRoot + '/';
}

function getProjectRoot() {
  if (!projectRoot) {
    let cwd = process.cwd();
    let lastDir = null;
    let prjRoot;
    while (cwd && lastDir !== cwd) {
      const pkgPath = join(cwd, 'package.json');
      if (fs.existsSync(pkgPath) && require(pkgPath).rekit) {
        prjRoot = cwd;
        break;
      }
      lastDir = cwd;
      cwd = join(cwd, '..');
    }
    if (!prjRoot) throw new Error('Can not find the Rekit project.');
    projectRoot = join(/\/$/.test(prjRoot) ? prjRoot : prjRoot + '/');
  }
  return projectRoot;
}

function map() {
  const args = [getProjectRoot()];
  args.push.apply(args, arguments);
  return join.apply(null, args);
}

function relative(from, to) {
  return path.relative(from, to).replace(/\\/g, '/');
}

// get the module source of 'to' from 'from' file.
// e.g: import to from '../to';
function relativeModuleSource(from, to) {
  const p = join(relative(path.dirname(from), path.dirname(to)), path.basename(to).replace(/\.\w+$/, ''));

  if (!_.startsWith(p, '.')) return './' + p;
  return p;
}

function getFileId(filePath) {
  return filePath.replace(getProjectRoot()).replace(/^\/?/, '');
}

module.exports = {
  join,
  map,
  getFileId,
  setProjectRoot,
  getProjectRoot,
  relative,
  relativeModuleSource,
  getLocalPluginRoot: () => map('tools/plugins'),
};

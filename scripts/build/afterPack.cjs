/* @layer tooling-scripts @kind logic */
const fs = require('fs');
const path = require('path');

const UNUSED_ELECTRON_FILES = [
  'dxcompiler.dll',
  'dxil.dll',
];

const trimUnusedFiles = (appOutDir) => {
  let saved = 0;
  for (const name of UNUSED_ELECTRON_FILES) {
    const target = path.join(appOutDir, name);
    if (!fs.existsSync(target)) continue;
    saved += fs.statSync(target).size;
    fs.rmSync(target);
  }
  if (saved) console.log(`  - trimmed ${(saved / 1048576).toFixed(1)} MB of unused Electron files`);
};

const VELOPACK_BINDING = {
  win32: 'velopack_nodeffi_win_x64_msvc.node',
  linux: 'velopack_nodeffi_linux_x64_gnu.node',
  darwin: 'velopack_nodeffi_osx.node',
};

const trimForeignBindings = (appOutDir, platform, resourcesPath) => {
  const dir = path.join(appOutDir, resourcesPath, 'app.asar.unpacked', 'node_modules',
                        'velopack', 'lib', 'native');
  if (!fs.existsSync(dir)) return;

  const keep = VELOPACK_BINDING[platform];
  if (!keep) throw new Error(`No Velopack binding known for ${platform}`);
  if (!fs.existsSync(path.join(dir, keep))) {
    throw new Error(`Velopack binding ${keep} is missing; the app could not start`);
  }

  let saved = 0;
  for (const name of fs.readdirSync(dir)) {
    if (name === keep) continue;
    const target = path.join(dir, name);
    saved += fs.statSync(target).size;
    fs.rmSync(target);
  }
  if (saved) console.log(`  - dropped ${(saved / 1048576).toFixed(1)} MB of bindings for other platforms`);
};

/**
 * @param {import('electron-builder').AfterPackContext} context
 */
exports.default = async function afterPack(context) {
  const platform = context.electronPlatformName;
  const resourcesPath = platform === 'darwin'
    ? path.join(`${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources')
    : 'resources';
  trimForeignBindings(context.appOutDir, platform, resourcesPath);

  if (platform !== 'win32') return;

  trimUnusedFiles(context.appOutDir);

  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const icoPath = path.resolve(__dirname, '../../apps/desktop/public/logos/logo/logo.ico');

  const { productName } = context.packager.appInfo;
  const version = context.packager.appInfo.version;
  const { rcedit } = require('rcedit');
  await rcedit(exePath, {
    icon: icoPath,
    'file-version': version,
    'product-version': version,
    'version-string': {
      FileDescription: productName,
      ProductName: productName,
      InternalName: productName,
      OriginalFilename: `${context.packager.appInfo.productFilename}.exe`,
      CompanyName: productName,
    },
  });
  console.log(`  - icon and name stamped: ${exePath}`);
};

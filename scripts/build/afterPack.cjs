/* @layer tooling-scripts @kind logic */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Electron files this app never loads. They are part of the Electron distribution
 * rather than our own bundle, so `files` cannot filter them out and they have to be
 * removed after packing.
 *
 * Deliberately NOT in this list, despite being large:
 *   vk_swiftshader.dll / vulkan-1.dll  the software renderer, which is what makes the
 *                                      app draw on machines with no usable GPU (VMs)
 *   libGLESv2 / libEGL / d3dcompiler   ANGLE, which is how WebGL reaches the GPU
 *   LICENSES.chromium.html             required attribution, and it compresses well
 *   ffmpeg.dll                         nothing here decodes compressed audio today,
 *                                      but Chromium reaches for it in enough places
 *                                      that 2.9 MB is not worth the risk
 */
const UNUSED_ELECTRON_FILES = [
  // DirectX shader compiler, used by WebGPU/Dawn. This app has no WebGPU code: the
  // core renders through WebGL, which uses ANGLE and the D3D compiler above.
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
  if (saved) console.log(`  • trimmed ${(saved / 1048576).toFixed(1)} MB of unused Electron files`);
};

/**
 * Velopack ships prebuilt bindings for every platform it supports, about 18 MB of
 * .node files, and a build needs exactly one. This cannot be a `files` filter because
 * that is the same for every platform, and dropping the wrong one leaves the app
 * unable to start: the updater is imported at the top of main.
 */
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
  if (saved) console.log(`  • dropped ${(saved / 1048576).toFixed(1)} MB of bindings for other platforms`);
};

/** @param {import('electron-builder').AfterPackContext} context */
exports.default = async function afterPack(context) {
  const platform = context.electronPlatformName;
  // macOS keeps its resources inside the bundle; the other two sit beside the binary.
  const resourcesPath = platform === 'darwin'
    ? path.join(`${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources')
    : 'resources';
  trimForeignBindings(context.appOutDir, platform, resourcesPath);

  if (platform !== 'win32') return;

  trimUnusedFiles(context.appOutDir);

  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const icoPath = path.resolve(__dirname, '../../apps/web/public/logos/icon.ico');

  const { rcedit } = require('rcedit');
  await rcedit(exePath, { icon: icoPath });
  console.log(`  • icon stamped: ${exePath}`);
};

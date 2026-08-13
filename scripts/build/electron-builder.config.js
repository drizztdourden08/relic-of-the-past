/* @layer tooling-scripts @kind config */
/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.relicofthepast.app',
  productName: 'Relic of the Past',
  npmRebuild: false,
  afterPack: './scripts/build/afterPack.cjs',
  publish: [{
    provider: 'github',
    owner: 'drizztdourden08',
    repo: 'relic-of-the-past',
  }],
  directories: {
    buildResources: 'build',
  },
  // Chromium ships its own UI strings for 55 languages, ~48 MB of .pak files, none of
  // which this app shows: our own UI is bundled, and the in-game language packs are a
  // separate thing entirely.
  electronLanguages: ['en-US'],
  files: [
    'dist/electron/**/*',
    'dist/preload/**/*',
    'dist/renderer/**/*',
    'package.json',
  ],
  // The SDL3 addon (sdl3_input.node, SDL3's shared library, and libusb's) is
  // NOT under apps/desktop/** in `files` above (only dist/** is), so an
  // asarUnpack pattern targeting it there would match nothing — it has to
  // ship as extraResources instead, copied verbatim regardless of `files`.
  // scripts/ensure-sdl3.mjs writes to this exact source path; index.ts's
  // resolveAddonPath checks process.resourcesPath first for this exact layout.
  extraResources: [
    {
      from: 'apps/desktop/electron/input/native/sdl3/prebuilds/${platform}-${arch}',
      to: 'sdl3/${platform}-${arch}',
    },
    // The bundled controller mapping db — mapping-db-paths.ts checks this
    // exact resourcesPath location for a packaged build, and the repo root
    // (resources/gamecontrollerdb.txt) in dev.
    {
      from: 'resources/gamecontrollerdb.txt',
      to: 'gamecontrollerdb.txt',
    },
  ],
  // The Velopack bindings are a prebuilt .node and cannot be require()d from inside
  // an asar archive.
  asarUnpack: [
    'node_modules/velopack/lib/native/**',
  ],
  // Windows ships through Velopack: electron-builder only produces the app tree
  // (--win --dir) and scripts/build/pack-velopack.mjs turns it into Setup.exe plus
  // the update packages. The nsis/portable targets are gone with it.
  win: {
    target: ['dir'],
    icon: 'apps/web/public/logos/icon.ico',
    signAndEditExecutable: false,
  },
  mac: {
    target: ['dmg', 'zip'],
    icon: 'apps/web/public/logos/logo-512.png',
    artifactName: 'rotp-macos.${ext}',
    // Ad-hoc signature (no Apple Developer ID). On Apple Silicon this stops
    // Gatekeeper reporting the app as "damaged"; users still right-click → Open
    // once to clear the unidentified-developer prompt.
    identity: '-',
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'apps/web/public/logos/logo-256.png',
    artifactName: 'rotp-linux.${ext}',
    category: 'Game',
    maintainer: 'drizztdourden08@users.noreply.github.com',
  },
  // .deb auto-installs the controller udev rules (AppImage users install manually —
  // see docs/controllers/linux-setup.md).
  deb: {
    afterInstall: 'scripts/build/linux/deb-postinst.sh',
  },
};

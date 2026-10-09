/* @layer tooling-scripts @kind config */
/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: 'com.relicofthepast.app',
  productName: 'Relic of the Past',
  npmRebuild: false,
  afterPack: '../../scripts/build/afterPack.cjs',
  publish: [{
    provider: 'github',
    owner: 'drizztdourden08',
    repo: 'relic-of-the-past',
  }],
  directories: {
    buildResources: '../../build',
  },
  electronLanguages: ['en-US'],
  files: [
    'dist/electron/**/*',
    'dist/preload/**/*',
    'dist/renderer/**/*',
    'package.json',
  ],
  extraResources: [
    {
      from: 'electron/input/native/sdl3/prebuilds/${platform}-${arch}',
      to: 'sdl3/${platform}-${arch}',
    },
    {
      from: 'resources/gamecontrollerdb.txt',
      to: 'gamecontrollerdb.txt',
    },
    {
      from: 'public/logos/generated/msul.ico',
      to: 'msul.ico',
    },
  ],
  asarUnpack: [
    'node_modules/velopack/lib/native/**',
  ],
  fileAssociations: [
    {
      ext: 'msul',
      name: 'Music Pack',
      description: 'Layered music pack',
      icon: 'public/logos/generated/msul.ico',
      role: 'Editor',
      mimeType: 'application/x-msul',
    },
    {
      ext: 'rsp',
      name: 'Character Sprite',
      description: 'Character sprite pack',
      role: 'Editor',
      mimeType: 'application/x-rsp',
    },
    {
      ext: 'rlang',
      name: 'Language Set',
      description: 'Language set',
      role: 'Editor',
      mimeType: 'application/x-rlang',
    },
  ],
  protocols: [
    {
      name: 'Relic of the Past',
      schemes: ['relic-of-the-past'],
    },
  ],
  win: {
    target: ['dir'],
    icon: 'public/logos/logo/logo.ico',
    signAndEditExecutable: false,
  },
  mac: {
    target: ['dmg', 'zip'],
    icon: 'public/logos/logo/logo-512.png',
    artifactName: 'rotp-macos.${ext}',
    identity: '-',
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'public/logos/logo/logo-256.png',
    artifactName: 'rotp-linux.${ext}',
    category: 'Game',
    maintainer: 'drizztdourden08@users.noreply.github.com',
  },
  deb: {
    afterInstall: '../../scripts/build/linux/deb-postinst.sh',
  },
};

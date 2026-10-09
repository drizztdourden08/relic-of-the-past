/* @layer root-config @kind config */
import { defineBrockConfig } from '@drizztdourden08/brock-build/config';

export default defineBrockConfig({
  product: {
    id: 'relic-of-the-past',
    name: 'Relic of the Past',
    appId: 'com.relicofthepast.app',
    ports: { base: 1991 },
    description: 'A desktop port of A Link to the Past, built on a decompiled C core in WebAssembly.',
    author: { name: 'drizztdourden_', email: 'drizztdourden08@users.noreply.github.com' },
    repo: { owner: 'drizztdourden08', name: 'relic-of-the-past' },
    artifactPrefix: 'rotp-',
    protocols: [{ scheme: 'relic-of-the-past', name: 'Relic of the Past' }],
    fileAssociations: [
      { ext: 'msul', name: 'Music Pack', progId: 'RelicOfThePast.MusicPack', mimeType: 'application/x-msul', icon: 'msul' },
      { ext: 'rsp', name: 'Character Sprite', progId: 'RelicOfThePast.SpritePack', mimeType: 'application/x-rsp' },
      { ext: 'rlang', name: 'Language Set', progId: 'RelicOfThePast.LanguageSet', mimeType: 'application/x-rlang' },
    ],
    icons: { brand: 'rotp' },
    dataDirs: ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites', 'link-sprites'],
    schemes: [{ scheme: 'app-sprite', dir: 'sprites' }, { scheme: 'app-debug-capture', stream: true }],
  },
  targets: ['desktop', 'android', 'web'],
  modules: ['updater', 'secrets', 'display', 'tools', 'catalog', 'port-kit', 'input'],
  build: {
    nodePolyfills: { globals: { Buffer: true, process: true } },
  },
  gate: { scripts: ['generate:check', 'state-format', 'generate:gba-asset-index:check'], clangFormat: ['core/game-hooks'] },
});

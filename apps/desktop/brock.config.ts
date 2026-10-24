/* @layer root-config @kind config */
import { defineBrockConfig } from '@drizztdourden08/brock-build/config';
import type { WorkflowStep } from '@drizztdourden08/brock-build/config';

const wasmCoreSteps: WorkflowStep[] = [
  {
    name: 'Read the pinned Emscripten version',
    shell: 'bash',
    run: `echo "EMSDK_VERSION=$(node -p "require('./package.json').config.emsdk")" >> "$GITHUB_ENV"`,
  },
  { name: 'Set up Emscripten', uses: 'emscripten-core/setup-emsdk@v16', with: { version: '${{ env.EMSDK_VERSION }}' } },
  {
    name: "Give Emscripten's Python its port downloader",
    shell: 'bash',
    run: `"$EMSDK_PYTHON" -m ensurepip --default-pip || true
if ! "$EMSDK_PYTHON" -m pip install --disable-pip-version-check requests; then
  echo "::warning::no pip in emsdk python; a cold ports cache will fail"
fi`,
  },
  { name: 'Build the wasm core', shell: 'bash', run: 'pnpm run ensure-wasm' },
  { name: 'Build the Archipelago world packages', shell: 'bash', run: 'pnpm run ensure-apworld' },
];

const releaseInputSteps: WorkflowStep[] = [
  { name: 'Check the save state format is registered', jobs: 'build-windows', shell: 'bash', run: 'node tooling/state-format/check-state-format.mjs' },
  {
    name: 'Fetch the private dataset',
    shell: 'bash',
    secrets: ['VAULT_TOKEN'],
    run: `git clone --depth 1 "https://x-access-token:$VAULT_TOKEN@github.com/drizztdourden08/rotp-vault.git" ../rotp-vault
node tooling/vault/sync.mjs --force-pull`,
  },
  { name: 'Verify the dataset landed', shell: 'bash', run: 'node tooling/vault/check-dataset.mjs' },
];

const publishStateFormat: WorkflowStep = {
  name: 'Publish the save state format',
  platforms: ['windows'],
  shell: 'bash',
  run: 'node tooling/state-format/check-state-format.mjs --emit upload',
};

const linuxSdl3Soname: WorkflowStep = {
  name: 'Make the Linux SDL3 runtime loadable',
  platforms: ['linux'],
  run: 'node tooling/ensure-linux-sdl3-soname.mjs',
};

export default defineBrockConfig({
  product: {
    id: 'relic-of-the-past',
    name: 'Relic of the Past',
    appId: 'com.relicofthepast.app',
    ports: { base: 1991 },
    description: 'A desktop port of A Link to the Past, built on a decompiled C core in WebAssembly.',
    author: { name: 'drizztdourden_', email: 'drizztdourden08@users.noreply.github.com' },
    copyright: 'Copyright (c) 2026 drizztdourden_',
    linuxCategory: 'Game',
    window: { titleBar: { mobile: false } },
    profilesRoute: 'data/profiles',
    repo: { owner: 'drizztdourden08', name: 'relic-of-the-past' },
    artifactPrefix: 'rotp-',
    protocols: [{ scheme: 'relic-of-the-past', name: 'Relic of the Past' }],
    fileAssociations: [
      { ext: 'msul', name: 'Music Pack', description: 'Relic of the Past music pack', progId: 'RelicOfThePast.MusicPack', mimeType: 'application/x-msul', icon: 'msul' },
      { ext: 'rsp', name: 'Character Sprite', description: 'Relic of the Past character sprite', progId: 'RelicOfThePast.SpritePack', mimeType: 'application/x-rsp' },
      { ext: 'rlang', name: 'Language Set', description: 'Relic of the Past language set', progId: 'RelicOfThePast.LanguageSet', mimeType: 'application/x-rlang' },
    ],
    icons: { brand: 'rotp', wordmark: { src: './logos/wordmark.svg', rendering: 'pixelated' } },
    dataDirs: ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites', 'link-sprites'],
    schemes: [{ scheme: 'app-sprite', dir: 'sprites' }, { scheme: 'app-debug-capture', stream: true }],
  },
  targets: ['desktop', 'android', 'web'],
  modules: ['updater', 'secrets', 'display', 'tools', 'catalog', 'port-kit', 'input'],
  build: {
    nodePolyfills: { globals: { Buffer: true, process: true } },
    optimizeDeps: { worker: ['fs', 'crypto', 'path', 'js-yaml'] },
  },
  packaging: {
    fileAssociations: {
      msul: { role: 'Editor' },
      rsp: { role: 'Editor' },
      rlang: { role: 'Editor' },
    },
    velopackIcons: { windows: 'build/icons/icon.ico', linux: 'build/icons/png/icon-256.png' },
  },
  gate: { scripts: ['generate:check', 'state-format', 'generate:gba-asset-index:check'], clangFormat: ['core/game-hooks'] },
  workflows: {
    steps: {
      ci: {
        beforeBuild: wasmCoreSteps,
        afterBuild: [{ name: linuxSdl3Soname.name, jobs: 'review', run: linuxSdl3Soname.run }],
        beforeTest: [{ name: 'Analyze every file type', jobs: 'quality', run: 'node tooling/analyze/analyze.mjs --ci' }],
      },
      release: {
        prepare: [
          { name: 'Check the save state format', run: 'node tooling/state-format/check-state-format.mjs' },
          { name: 'Analyze every file type', run: 'node tooling/analyze/analyze.mjs --ci' },
        ],
        beforePackage: [...wasmCoreSteps, linuxSdl3Soname, ...releaseInputSteps],
        afterPackage: [publishStateFormat],
      },
    },
  },
});

// @layer installer @kind config
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const out = join(here, 'out');
const exe = join(out, 'relic-setup.exe');

const VSWHERE = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';

const SCREENS = ['checking', 'handoff', 'welcome', 'location', 'progress'];

const SOURCES = [
  'src/main.cpp',
  'src/state.cpp',
  'src/cli.cpp',
  'src/flow.cpp',
  'src/paint.cpp',
  'src/draw.cpp',
  'src/screens.cpp',
  'src/net.cpp',
  'src/manifest.cpp',
  'src/install.cpp',
];

const LIBS = [
  'user32.lib',
  'gdi32.lib',
  'gdiplus.lib',
  'shlwapi.lib',
  'ole32.lib',
  'dwmapi.lib',
  'shell32.lib',
  'winhttp.lib',
  'bcrypt.lib',
];

// The brand art lives with the app, not beside the installer, so it is pulled in
// at build time instead of being duplicated in the tree.
const ASSETS = [
  ['apps/web/public/logos/logo-256.png', 'logo-256.png'],
  ['apps/web/public/logos/icon.ico', 'app.ico'],
];

const findVcvars = () => {
  const root = execFileSync(
    VSWHERE,
    ['-latest', '-products', '*', '-requires',
     'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-property', 'installationPath'],
    { encoding: 'utf8' },
  ).trim();
  if (!root) throw new Error('No Visual Studio build tools with the C++ toolset were found.');
  const vcvars = join(root, 'VC', 'Auxiliary', 'Build', 'vcvars64.bat');
  if (!existsSync(vcvars)) throw new Error(`Missing ${vcvars}`);
  return vcvars;
};

const stageAssets = () => {
  for (const [from, to] of ASSETS) {
    const source = join(repo, from);
    if (!existsSync(source)) throw new Error(`Missing build asset: ${source}`);
    copyFileSync(source, join(here, 'res', to));
  }
};

/**
 * `--manifest-url <url>` builds a stub that reads its recipe from somewhere other
 * than the release page, so the download-and-install path can be run against a local
 * server. It is written as a header, not a /D define, because escaping a wide string
 * literal through cmd is its own small nightmare.
 */
const manifestOverride = () => {
  const i = process.argv.indexOf('--manifest-url');
  const url = i > -1 ? process.argv[i + 1] : null;
  if (!url) return '';
  writeFileSync(join(here, 'out', 'manifest-url.h'), `#define ROTP_MANIFEST_URL L"${url}"
`, 'utf-8');
  console.log(`  manifest override: ${url}`);
  return ' /DROTP_HAS_URL_OVERRIDE /I out';
};

// One shell keeps the compiler environment alive across both tools; the
// variables vcvars sets do not survive a separate invocation.
const runToolchain = (vcvars) => {
  const rc = 'rc.exe /nologo /I res /fo out\\resources.res res\\resources.rc';
  const cl = [
    `cl.exe /nologo /MT /O1 /GS- /EHsc /std:c++17 /DUNICODE /D_UNICODE${manifestOverride()}`,
    '/Fo"out/" /Fd"out/" /Fe"out/relic-setup.exe"',
    ...SOURCES,
    'out\\resources.res',
    '/link /SUBSYSTEM:WINDOWS /OPT:REF /OPT:ICF /INCREMENTAL:NO',
    ...LIBS,
  ].join(' ');
  const script = `call "${vcvars}" >nul && ${rc} && ${cl}`;
  execFileSync('cmd.exe', ['/d', '/s', '/c', `"${script}"`], {
    cwd: here,
    stdio: 'inherit',
    windowsVerbatimArguments: true,
  });
};

const renderScreens = () => {
  for (const screen of SCREENS) {
    const file = join(out, `${screen}.png`);
    execFileSync(exe, [`--render-png=${file}`, `--screen=${screen}`, '--scale=2']);
    console.log(`  ${screen}.png  ${statSync(file).size} bytes`);
  }
};

const main = () => {
  mkdirSync(out, { recursive: true });
  stageAssets();
  runToolchain(findVcvars());
  console.log(`\nBuilt ${exe} (${statSync(exe).size} bytes)`);
  if (process.argv.includes('--render')) {
    console.log('\nRendering screens:');
    renderScreens();
  }
};

main();

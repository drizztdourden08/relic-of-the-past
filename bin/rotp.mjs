/* @layer tooling-scripts @kind logic */
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, relative } from 'node:path';
import { createInterface } from 'node:readline/promises';

const NAME = 'rotp';
const PACKAGE = '@drizztdourden08/brock';
const REGISTRY = 'https://npm.pkg.github.com';
const TOKEN_KEY = '//npm.pkg.github.com/:_authToken';
const IS_WINDOWS = process.platform === 'win32';
const CHECKOUT = dirname(import.meta.dirname).replace(/\\/g, '/');
const OVERRIDE = process.env.BROCK_GLOBAL_PREFIX ?? '';

const say = (line) => process.stderr.write(`${line}\n`);
const quote = (arg) => (/^[\w@:/.=+-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`);
const exec = (command, args, stdio = 'pipe') => (IS_WINDOWS
  ? spawnSync([command, ...args].map(quote).join(' '), { encoding: 'utf8', stdio, shell: true })
  : spawnSync(command, args, { encoding: 'utf8', stdio }));

const npmOut = (args) => {
  const result = exec('npm', args);
  return result.status === 0 ? result.stdout.trim() : '';
};

const globalPrefix = () => OVERRIDE || npmOut(['prefix', '-g']);
const binDir = (prefix) => (IS_WINDOWS ? prefix : join(prefix, 'bin'));
const rootDir = (prefix) => (IS_WINDOWS ? join(prefix, 'node_modules') : join(prefix, 'lib', 'node_modules'));
const brockIn = (root) => join(root, PACKAGE, 'bin', 'brock.mjs');
const existing = (file) => (file && existsSync(file) ? file : null);
const fromPath = () => {
  if (OVERRIDE || NAME === 'brock') return null;
  const shimName = IS_WINDOWS ? 'brock.cmd' : 'brock';
  const dir = (process.env.PATH ?? '').split(delimiter).find((entry) => entry && existsSync(join(entry, shimName)));
  if (!dir) return null;
  return existing(brockIn(rootDir(IS_WINDOWS ? dir : dirname(dir)))) ?? join(dir, shimName);
};

const fromNpmRoot = () => {
  const root = npmOut(['root', '-g']);
  return root ? existing(brockIn(root)) : null;
};

const findBrock = () => (OVERRIDE ? existing(brockIn(rootDir(OVERRIDE))) : (fromPath() ?? fromNpmRoot()));

const insideCheckout = (dir) => {
  const rel = relative(CHECKOUT, dir);
  return !rel.startsWith('..') && !isAbsolute(rel);
};
const isWorktree = () => statSync(join(CHECKOUT, '.git'), { throwIfNoEntry: false })?.isFile() ?? false;

const runBrock = (file, args) => {
  if (!insideCheckout(process.cwd())) process.chdir(CHECKOUT);
  const result = file.endsWith('.mjs')
    ? spawnSync(process.execPath, [file, ...args], { stdio: 'inherit' })
    : exec(file, args, 'inherit');
  return result.status ?? 1;
};

const ask = async (question) => {
  const prompt = createInterface({ input: process.stdin, output: process.stderr });
  const answer = await prompt.question(`${question} [y/N] `);
  prompt.close();
  return /^y(es)?$/i.test(answer.trim());
};

const bashShim = () => `#!/bin/sh
dir="$PWD"
while :; do
  if [ -f "$dir/bin/${NAME}.mjs" ]; then exec node "$dir/bin/${NAME}.mjs" "$@"; fi
  parent="$(dirname "$dir")"
  [ "$parent" = "$dir" ] && break
  dir="$parent"
done
exec node "${CHECKOUT}/bin/${NAME}.mjs" "$@"
`;

const cmdShim = () => `@echo off
setlocal
set "DIR=%CD%"
:walk
if exist "%DIR%\\bin\\${NAME}.mjs" goto run
for %%P in ("%DIR%\\..") do set "PARENT=%%~fP"
if /i "%PARENT%"=="%DIR%" goto recorded
set "DIR=%PARENT%"
goto walk
:recorded
set "DIR=${CHECKOUT.replace(/\//g, '\\')}"
:run
node "%DIR%\\bin\\${NAME}.mjs" %*
exit /b %ERRORLEVEL%
`;

const writeShim = (file, content) => {
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return false;
  writeFileSync(file, content, 'utf8');
  if (!file.endsWith('.cmd')) chmodSync(file, 0o755);
  return true;
};

const link = () => {
  if (process.env.CI || isWorktree()) return 0;
  try {
    const dir = binDir(globalPrefix());
    if (!dir) throw new Error('npm prefix -g printed nothing');
    mkdirSync(dir, { recursive: true });
    const changed = [writeShim(join(dir, NAME), bashShim()), writeShim(join(dir, `${NAME}.cmd`), cmdShim())];
    if (changed.some(Boolean)) say(`${NAME}: linked the ${NAME} command in ${dir}`);
  } catch (error) {
    say(`${NAME}: could not link the ${NAME} command (${error.message}); run node bin/${NAME}.mjs --link to retry`);
  }
  return 0;
};

const setToken = async () => {
  const where = npmOut(['config', 'get', 'userconfig']) || 'your npm user config';
  if (!(await ask(`Run those two steps now? This writes your GitHub token (from gh auth token) to ${where} as ${TOKEN_KEY}.`))) return false;
  if (exec('gh', ['auth', 'refresh', '-h', 'github.com', '-s', 'read:packages'], 'inherit').status !== 0) return false;
  const token = exec('gh', ['auth', 'token']).stdout?.trim();
  return Boolean(token) && exec('npm', ['config', 'set', `${TOKEN_KEY}=${token}`]).status === 0;
};

const signedIn = () => exec('npm', ['whoami', `--registry=${REGISTRY}`]).status === 0;
const prepareRegistry = async () => {
  if (!/^https?:/.test(npmOut(['config', 'get', '@drizztdourden08:registry']))) exec('npm', ['config', 'set', `@drizztdourden08:registry=${REGISTRY}`]);
  if (signedIn()) return true;
  say(`npm is not signed in to GitHub Packages (${REGISTRY}). Fix it once:
  gh auth refresh -h github.com -s read:packages
  npm config set ${TOKEN_KEY} <the token that gh auth token prints>`);
  return (await setToken()) && signedIn();
};

const install = async (args) => {
  if (!process.stdin.isTTY) {
    say(`${NAME}: Brock is not installed on this machine. Install it once: npm install -g ${PACKAGE} --@drizztdourden08:registry=${REGISTRY}`);
    return 1;
  }
  if (!(await ask(`Brock is not installed on this machine. Install ${PACKAGE} globally from GitHub Packages now?`))) return 1;
  if (!(await prepareRegistry())) return 1;
  const prefix = OVERRIDE ? ['--prefix', OVERRIDE] : [];
  const installed = exec('npm', ['install', '-g', PACKAGE, ...prefix], 'inherit');
  if (installed.status !== 0) return installed.status ?? 1;
  const found = findBrock();
  if (found) return runBrock(found, args);
  say(`${NAME}: the install finished but ${PACKAGE} was not found in the npm global folder`);
  return 1;
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args[0] === '--link') return link();
  const found = findBrock();
  return found ? runBrock(found, args) : install(args);
};

process.exitCode = await main();

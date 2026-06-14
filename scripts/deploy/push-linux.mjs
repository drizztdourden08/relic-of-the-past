/* @layer tooling-scripts @kind script */
/**
 * Build the Linux AppImage inside the WSL build distro from the current Windows
 * working tree, then (optionally) push it to the full test VM over SSH and launch
 * it on the VM desktop. WSL is the build engine only; the VM is where it runs so
 * a real USB controller can be passed through.
 *
 *   npm run push:linux                  build in WSL, then push + launch on the VM
 *   npm run push:linux -- --build-only  stop after the AppImage is built in WSL
 *
 * VM target comes from scripts/deploy/vm.json (see vm.example.json). Without it,
 * the build still runs and the script stops before the VM hop.
 */
import { loadConfig, VM_CONFIG_PATH } from './config.mjs';
import { log, warn, fail, run, wsl, wslCapture } from './run.mjs';

// "E:\GameProjects\x" -> "/mnt/e/GameProjects/x"
const toWslPath = (winPath) =>
  `/mnt/${winPath[0].toLowerCase()}${winPath.slice(2).replace(/\\/g, '/')}`;

const ensureDistro = (distro) => {
  try {
    run('wsl', ['-d', distro, 'true'], { stdio: 'ignore' });
  } catch {
    fail(`WSL distro "${distro}" not found. Do Stage 1 first (scripts/deploy/README.md): wsl --install -d Ubuntu-24.04`);
  }
};

const syncTree = (distro, workdir) => {
  const src = `${toWslPath(process.cwd())}/`;
  log(`Syncing working tree -> ${distro}:${workdir} (rsync)`);
  wsl(
    distro,
    `mkdir -p ${workdir} && rsync -a --delete ` +
      `--exclude node_modules --exclude .git --exclude dist --exclude release ` +
      `'${src}' '${workdir}/'`,
  );
};

const buildInWsl = (distro, workdir) => {
  log('Installing deps + building the Linux AppImage in WSL (first run is slow)…');
  wsl(distro, `cd ${workdir} && npm install && npm run build:linux`);
  const appimage = wslCapture(distro, `ls ${workdir}/release/*.AppImage 2>/dev/null | head -n1`);
  if (!appimage) fail('Build finished but no .AppImage was produced in release/.');
  log(`Built: ${appimage}`);
  return appimage;
};

const pushToVm = (distro, vm, appimage) => {
  const { host, user, identityFile, display = ':0' } = vm;
  const target = `${user}@${host}`;
  const idFlag = identityFile ? `-i ${identityFile} ` : '';
  const remote = 'rotp-linux.AppImage';
  log(`Copying AppImage -> ${target}`);
  wsl(distro, `scp ${idFlag}-o StrictHostKeyChecking=accept-new ${appimage} ${target}:~/${remote}`);
  log('Launching on the VM desktop (passing --no-focus --muted)…');
  wsl(
    distro,
    `ssh ${idFlag}${target} 'chmod +x ~/${remote}; pkill -f ${remote} 2>/dev/null; ` +
      `DISPLAY=${display} setsid ~/${remote} --no-sandbox --no-focus --muted >/tmp/rotp.log 2>&1 &'`,
  );
  log('Pushed + launched. Plug in your controller and verify the app enumerates it on the VM.');
};

const main = () => {
  const config = loadConfig();
  const buildOnly = process.argv.slice(2).includes('--build-only');

  ensureDistro(config.wslDistro);
  syncTree(config.wslDistro, config.wslWorkdir);
  const appimage = buildInWsl(config.wslDistro, config.wslWorkdir);

  if (buildOnly) {
    log('Build-only: AppImage is ready inside WSL; stopping before the VM hop.');
    return;
  }
  if (!config.vm) {
    warn(`No VM target in ${VM_CONFIG_PATH}. Copy vm.example.json -> vm.json and fill the "vm" block (Stage 3).`);
    warn('AppImage is built inside WSL; skipping the VM push for now.');
    return;
  }
  pushToVm(config.wslDistro, config.vm, appimage);
};

main();

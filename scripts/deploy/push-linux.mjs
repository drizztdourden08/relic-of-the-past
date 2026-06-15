/* @layer tooling-scripts @kind script */
/**
 * Build the Linux AppImage in WSL and launch it on the test VM.
 *
 *   npm run push:linux                  build, then push + launch on the VM
 *   npm run push:linux -- --build-only  build only
 */
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadConfig, VM_CONFIG_PATH } from './config.mjs';
import { log, warn, fail, run, wsl, wslCapture } from './run.mjs';

// "E:\GameProjects\x" -> "/mnt/e/GameProjects/x"
const toWslPath = (winPath) =>
  `/mnt/${winPath[0].toLowerCase()}${winPath.slice(2).replace(/\\/g, '/')}`;

// WSL path -> Windows \\wsl.localhost UNC path.
const toUnc = (distro, wslPath) => `\\\\wsl.localhost\\${distro}${wslPath.replace(/\//g, '\\')}`;

// Copy the WSL SSH key to a temp file with owner-only access for the Windows ssh client.
const prepareWinKey = (distro, wslKeyPath) => {
  const dst = join(process.env.TEMP || 'C:\\Windows\\Temp', 'rotp_vm_key');
  try {
    run('icacls', [dst, '/grant', `${process.env.USERNAME}:F`], { stdio: 'ignore' });
  } catch {
    // no existing key to unlock
  }
  rmSync(dst, { force: true });
  copyFileSync(toUnc(distro, wslKeyPath), dst);
  run('icacls', [dst, '/inheritance:r'], { stdio: 'ignore' });
  run('icacls', [dst, '/grant:r', `${process.env.USERNAME}:F`], { stdio: 'ignore' });
  return dst;
};

const ensureDistro = (distro) => {
  try {
    run('wsl', ['-d', distro, 'true'], { stdio: 'ignore' });
  } catch {
    fail(`WSL distro "${distro}" not found — see docs/contributing/testing-linux-and-android.md.`);
  }
};

const syncTree = (distro, workdir) => {
  const src = `${toWslPath(process.cwd())}/`;
  log(`Syncing working tree -> ${distro}:${workdir}`);
  wsl(
    distro,
    `mkdir -p ${workdir} && rsync -a --delete ` +
      `--exclude node_modules --exclude .git --exclude dist --exclude release ` +
      `${src} ${workdir}/`,
  );
};

const buildInWsl = (distro, workdir) => {
  log('Building the Linux AppImage in WSL…');
  wsl(distro, `cd ${workdir} && bash scripts/deploy/build-in-wsl.sh`);
  const appimage = wslCapture(distro, `ls ${workdir}/release/*.AppImage 2>/dev/null | head -n1`);
  if (!appimage) fail('Build finished but no .AppImage was produced in release/.');
  log(`Built: ${appimage}`);
  return appimage;
};

const VBOXMANAGE = process.env.VBOXMANAGE || 'C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe';
const ROMS_DIR = 'test-roms';

// Mount the local ./test-roms folder into the VM at ~/test-roms via a VirtualBox shared folder.
const mountRoms = (vmName, sshArgs, target) => {
  const local = join(process.cwd(), ROMS_DIR);
  mkdirSync(local, { recursive: true });
  try {
    run(VBOXMANAGE, ['sharedfolder', 'add', vmName, '--name', ROMS_DIR, '--hostpath', local, '--transient'], {
      stdio: 'ignore',
    });
  } catch {
    // share already mapped
  }
  run('ssh', [
    ...sshArgs,
    target,
    'bash',
    '-lc',
    `mkdir -p ~/${ROMS_DIR} && (mountpoint -q ~/${ROMS_DIR} || sudo mount -t vboxsf -o uid=$(id -u),gid=$(id -g) ${ROMS_DIR} ~/${ROMS_DIR})`,
  ]);
};

// scp the AppImage + launcher to the VM from Windows, then run the launcher over ssh.
const pushToVm = (distro, vm, vmName, appimage) => {
  const { host, user, identityFile, port } = vm;
  const target = `${user}@${host}`;
  const key = identityFile ? prepareWinKey(distro, identityFile) : null;
  const idFlag = key ? ['-i', key] : [];
  const sslOpt = ['-o', 'StrictHostKeyChecking=accept-new'];
  const scpArgs = [...(port ? ['-P', String(port)] : []), ...idFlag, ...sslOpt];
  const sshArgs = ['-n', ...(port ? ['-p', String(port)] : []), ...idFlag, ...sslOpt];
  const appUnc = toUnc(distro, appimage);
  const launcher = resolve(import.meta.dirname, 'vm-launch.sh');
  const installer = resolve(import.meta.dirname, 'vm-install-desktop.sh');
  const icon = resolve(import.meta.dirname, '../../apps/web/public/logos/logo-256.png');
  log(`Mounting ${ROMS_DIR} -> ${target}:~/${ROMS_DIR}`);
  mountRoms(vmName, sshArgs, target);
  log(`Copying AppImage + launcher + desktop entry -> ${target}`);
  run('ssh', [...sshArgs, target, 'mkdir', '-p', '.local/share/icons', '.local/share/applications']);
  run('scp', [...scpArgs, appUnc, `${target}:rotp-linux.AppImage.incoming`]);
  run('scp', [...scpArgs, launcher, `${target}:vm-launch.sh`]);
  run('scp', [...scpArgs, installer, `${target}:vm-install-desktop.sh`]);
  run('scp', [...scpArgs, icon, `${target}:.local/share/icons/relic-of-the-past.png`]);
  log('Installing dock entry…');
  run('ssh', [...sshArgs, target, 'bash', 'vm-install-desktop.sh']);
  log('Launching on the VM…');
  run('ssh', [...sshArgs, target, 'bash', 'vm-launch.sh']);
  log('Pushed and launched on the VM.');
};

const main = () => {
  const config = loadConfig();
  const buildOnly = process.argv.slice(2).includes('--build-only');

  ensureDistro(config.wslDistro);
  syncTree(config.wslDistro, config.wslWorkdir);
  const appimage = buildInWsl(config.wslDistro, config.wslWorkdir);

  if (buildOnly) return;
  if (!config.vm) {
    warn(`No VM target in ${VM_CONFIG_PATH}. Copy vm.example.json -> vm.json and fill the "vm" block.`);
    return;
  }
  pushToVm(config.wslDistro, config.vm, config.vmName, appimage);
};

main();

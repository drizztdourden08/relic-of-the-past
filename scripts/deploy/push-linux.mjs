/* @layer tooling-scripts @kind script */
/**
 * Build the Linux app directly inside the VirtualBox test VM and launch it.
 * No WSL build step, because the VM is both the build machine and the test target.
 *
 *   npm run push:linux                  build, push test-roms, launch on VM
 *   npm run push:linux -- --build-only  build only (no launch)
 *
 * One-time VM setup required before the first run:
 *   ssh rotp@192.168.56.50 'bash -s' < scripts/deploy/setup-vm-builder.sh
 *
 * Flow:
 *   1. Mount Windows source tree into the VM via a transient VirtualBox shared folder.
 *   2. SSH → rsync shared folder to ~/relic (a local VM copy, which avoids building over slow vboxsf).
 *   3. SSH → build: npm install + electron-builder → AppImage staged to ~/rotp-linux.AppImage.incoming.
 *   4. Mount test-roms shared folder in VM.
 *   5. SSH → vm-launch.sh: atomic swap + launch.
 */
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadConfig, VM_CONFIG_PATH } from './config.mjs';
import { log, warn, fail, run } from './run.mjs';

const VBOXMANAGE = process.env.VBOXMANAGE || 'C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe';
const ROMS_DIR = 'test-roms';
const SRC_SHARE = 'relic-src';

// Unix path (/home/x/y) → Windows UNC path via WSL (\\wsl.localhost\distro\home\x\y).
// Used only when identityFile is a WSL path (starts with /).
const toUnc = (distro, wslPath) =>
  `\\\\wsl.localhost\\${distro}${wslPath.replace(/\//g, '\\')}`;

// Copy the SSH identity file to %TEMP%\rotp_vm_key with owner-only ACL so
// Windows OpenSSH accepts it. Supports both Windows paths and WSL paths.
const prepareWinKey = (config, identityFile) => {
  const dst = join(process.env.TEMP || 'C:\\Windows\\Temp', 'rotp_vm_key');
  try {
    run('icacls', [dst, '/grant', `${process.env.USERNAME}:F`], { stdio: 'ignore' });
  } catch { /* no existing key to unlock */ }
  rmSync(dst, { force: true });
  const isWinPath = /^[A-Za-z]:[\\\/]/.test(identityFile);
  const src = isWinPath ? identityFile : toUnc(config.wslDistro, identityFile);
  copyFileSync(src, dst);
  run('icacls', [dst, '/inheritance:r'], { stdio: 'ignore' });
  run('icacls', [dst, '/grant:r', `${process.env.USERNAME}:F`], { stdio: 'ignore' });
  return dst;
};

// Add a transient VirtualBox shared folder and mount it in the VM.
const mountShare = (vmName, shareName, hostPath, sshArgs, target, mountPoint) => {
  mkdirSync(hostPath, { recursive: true });
  try {
    run(VBOXMANAGE, ['sharedfolder', 'add', vmName, '--name', shareName, '--hostpath', hostPath, '--transient'], {
      stdio: 'ignore',
    });
  } catch { /* share already mapped */ }
  run('ssh', [
    ...sshArgs,
    target,
    `bash -lc 'mkdir -p ${mountPoint} && (mountpoint -q ${mountPoint} || sudo mount -t vboxsf -o uid=$(id -u),gid=$(id -g) ${shareName} ${mountPoint})'`,
  ]);
};

const syncFromShare = (sshArgs, target) => {
  log('Syncing source tree from shared folder → ~/relic...');
  run('ssh', [
    ...sshArgs,
    target,
    `bash -lc 'rsync -a --delete --exclude node_modules --exclude .git --exclude dist --exclude release ~/relic-src/ ~/relic/'`,
  ]);
};

const buildInVm = (sshArgs, target) => {
  log('Building Linux app in VM...');
  run('ssh', [
    ...sshArgs,
    target,
    `bash -lc 'cd ~/relic && bash scripts/deploy/build-in-vm.sh'`,
  ]);
};

const main = () => {
  const config = loadConfig();
  const buildOnly = process.argv.slice(2).includes('--build-only');

  if (!config.vm) {
    fail(`No VM target in ${VM_CONFIG_PATH}. Copy vm.example.json → vm.json and fill the "vm" block.`);
  }

  const { host, user, identityFile, port } = config.vm;
  const target = `${user}@${host}`;
  const key = identityFile ? prepareWinKey(config, identityFile) : null;
  const idFlag = key ? ['-i', key] : [];
  const sslOpt = ['-o', 'StrictHostKeyChecking=accept-new'];
  const scpArgs = [...(port ? ['-P', String(port)] : []), ...idFlag, ...sslOpt];
  const sshArgs = ['-n', ...(port ? ['-p', String(port)] : []), ...idFlag, ...sslOpt];

  // 1. Mount Windows source tree into VM
  log(`Mounting source tree → ${target}:~/relic-src`);
  mountShare(config.vmName, SRC_SHARE, process.cwd(), sshArgs, target, '~/relic-src');

  // 2. Rsync to local VM copy
  syncFromShare(sshArgs, target);

  // 3. Build in VM
  buildInVm(sshArgs, target);

  if (buildOnly) return;

  // 4. Mount test-roms
  log(`Mounting ${ROMS_DIR} → ${target}:~/${ROMS_DIR}`);
  mountShare(config.vmName, ROMS_DIR, join(process.cwd(), ROMS_DIR), sshArgs, target, `~/${ROMS_DIR}`);

  // 5. Install desktop entry + launch
  const installer = resolve(import.meta.dirname, 'vm-install-desktop.sh');
  const icon = resolve(import.meta.dirname, '../../apps/web/public/logos/logo-256.png');
  run('ssh', [...sshArgs, target, 'mkdir', '-p', '.local/share/icons', '.local/share/applications']);
  run('scp', [...scpArgs, installer, `${target}:vm-install-desktop.sh`]);
  run('scp', [...scpArgs, icon, `${target}:.local/share/icons/relic-of-the-past.png`]);
  log('Installing dock entry...');
  run('ssh', [...sshArgs, target, 'bash', 'vm-install-desktop.sh']);
  log('Launching on the VM...');
  run('ssh', [...sshArgs, target, 'bash', 'vm-launch.sh']);
  log('Pushed and launched on the VM.');
};

main();

/* @layer tooling-scripts @kind script */
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadConfig, VM_CONFIG_PATH } from './config.mjs';
import { log, warn, fail, run } from './run.mjs';

const VBOXMANAGE = process.env.VBOXMANAGE || 'C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe';
const ROMS_DIR = 'test-roms';
const SRC_SHARE = 'relic-src';

const toUnc = (distro, wslPath) =>
  `\\\\wsl.localhost\\${distro}${wslPath.replace(/\//g, '\\')}`;

const prepareWinKey = (config, identityFile) => {
  const dst = join(process.env.TEMP || 'C:\\Windows\\Temp', 'rotp_vm_key');
  try {
    run('icacls', [dst, '/grant', `${process.env.USERNAME}:F`], { stdio: 'ignore' });
  } catch { }
  rmSync(dst, { force: true });
  const isWinPath = /^[A-Za-z]:[\\\/]/.test(identityFile);
  const src = isWinPath ? identityFile : toUnc(config.wslDistro, identityFile);
  copyFileSync(src, dst);
  run('icacls', [dst, '/inheritance:r'], { stdio: 'ignore' });
  run('icacls', [dst, '/grant:r', `${process.env.USERNAME}:F`], { stdio: 'ignore' });
  return dst;
};

const mountShare = (vmName, shareName, hostPath, sshArgs, target, mountPoint) => {
  mkdirSync(hostPath, { recursive: true });
  try {
    run(VBOXMANAGE, ['sharedfolder', 'add', vmName, '--name', shareName, '--hostpath', hostPath, '--transient'], {
      stdio: 'ignore',
    });
  } catch { }
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

  log(`Mounting source tree → ${target}:~/relic-src`);
  mountShare(config.vmName, SRC_SHARE, process.cwd(), sshArgs, target, '~/relic-src');

  syncFromShare(sshArgs, target);

  buildInVm(sshArgs, target);

  if (buildOnly) return;

  log(`Mounting ${ROMS_DIR} → ${target}:~/${ROMS_DIR}`);
  mountShare(config.vmName, ROMS_DIR, join(process.cwd(), ROMS_DIR), sshArgs, target, `~/${ROMS_DIR}`);

  const installer = resolve(import.meta.dirname, 'vm-install-desktop.sh');
  const icon = resolve(import.meta.dirname, '../../apps/desktop/public/logos/logo/logo-256.png');
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

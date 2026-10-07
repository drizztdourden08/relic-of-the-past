/* @layer tooling-scripts @kind script */
/**
 * Resolve deploy configuration from scripts/deploy/vm.json (gitignored, optional)
 * with env-var overrides and sane defaults, so both push scripts agree on the WSL
 * distro, the WSL working dir, the AVD name, and the VM SSH target. Copy
 * vm.example.json -> vm.json and fill in the `vm` block once the VM exists.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DEPLOY_DIR = import.meta.dirname;
const VM_CONFIG_PATH = join(DEPLOY_DIR, 'vm.json');

const DEFAULTS = {
  wslDistro: 'Ubuntu-24.04',
  wslWorkdir: '~/relic',
  avdName: 'rotp_test',
  vmName: 'Linux-rotp-test', // VirtualBox VM name (for sharedfolder commands)
  vm: null, // { host, user, identityFile? }, required for the VM hop
};

const loadConfig = () => {
  const fromFile = existsSync(VM_CONFIG_PATH)
    ? JSON.parse(readFileSync(VM_CONFIG_PATH, 'utf8'))
    : {};
  return {
    wslDistro: process.env.ROTP_WSL_DISTRO || fromFile.wslDistro || DEFAULTS.wslDistro,
    wslWorkdir: fromFile.wslWorkdir || DEFAULTS.wslWorkdir,
    avdName: process.env.ROTP_AVD || fromFile.avdName || DEFAULTS.avdName,
    vmName: fromFile.vmName || DEFAULTS.vmName,
    vm: fromFile.vm || DEFAULTS.vm,
  };
};

export { loadConfig, VM_CONFIG_PATH };

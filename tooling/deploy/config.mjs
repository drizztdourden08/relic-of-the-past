/* @layer tooling-scripts @kind script */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DEPLOY_DIR = import.meta.dirname;
const VM_CONFIG_PATH = join(DEPLOY_DIR, 'vm.json');

const DEFAULTS = {
  wslDistro: 'Ubuntu-24.04',
  wslWorkdir: '~/relic',
  avdName: 'rotp_test',
  vmName: 'Linux-rotp-test',
  vm: null,
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

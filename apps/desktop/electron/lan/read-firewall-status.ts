/* @layer electron-main @kind logic */
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { FirewallStatus } from '@app/ipc';
import { NETSH, NETSH_MAX_BUFFER, SHOW_RULES_ARGS } from './firewall.constants';
import { parseFirewallRules } from './parse-firewall-rules';

const run = promisify(execFile);

const readFirewallStatus = async (): Promise<FirewallStatus> => {
  if (process.platform !== 'win32') return 'unknown';
  try {
    const { stdout } = await run(NETSH, SHOW_RULES_ARGS, { windowsHide: true, maxBuffer: NETSH_MAX_BUFFER });
    return parseFirewallRules(stdout, process.execPath);
  } catch {
    return 'unknown';
  }
};

export { readFirewallStatus };

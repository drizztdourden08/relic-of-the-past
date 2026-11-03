/* @layer electron-main @kind logic */
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { FirewallStatus } from '@app/ipc';
import { POWERSHELL, RULE_NAME, RULE_PROTOCOLS } from './firewall.constants';
import { readFirewallStatus } from './read-firewall-status';

const run = promisify(execFile);

const quoted = (text: string): string => text.replace(/'/g, "''");

const addRuleArgs = (protocol: string): string =>
  `advfirewall firewall add rule name="${RULE_NAME}" dir=in action=allow program="${process.execPath}" protocol=${protocol} enable=yes profile=any`;

const elevatedCommand = (): string => {
  const calls = RULE_PROTOCOLS.map(
    (protocol) => `Start-Process netsh -Verb RunAs -WindowStyle Hidden -Wait -ArgumentList '${quoted(addRuleArgs(protocol))}'`,
  );
  return calls.join('; ');
};

const allowFirewall = async (): Promise<FirewallStatus> => {
  if (process.platform !== 'win32') return 'unknown';
  try {
    await run(POWERSHELL, ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', elevatedCommand()], { windowsHide: true });
  } catch {
    // The UAC prompt was declined; the status below stays as it was.
  }
  return readFirewallStatus();
};

export { allowFirewall };

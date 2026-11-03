/* @layer electron-main @kind logic */
import type { FirewallStatus } from '@app/ipc';
import { FIELD } from './parse-firewall-rules.constants';

const fieldsOf = (block: string): Map<string, string> => {
  const fields = new Map<string, string>();
  for (const line of block.split(/\r?\n/)) {
    const [, key, value] = FIELD.exec(line) ?? [];
    if (key !== undefined && value !== undefined) fields.set(key.toLowerCase(), value);
  }
  return fields;
};

const parseFirewallRules = (output: string, program: string): FirewallStatus => {
  const target = program.toLowerCase();
  const blocks = output.split(/^\s*Rule Name:/m);
  const ours = blocks
    .map(fieldsOf)
    .filter((fields) => (fields.get('program') ?? '').toLowerCase() === target && fields.get('enabled') === 'Yes');
  const inbound = ours.filter((fields) => fields.get('direction') === 'In');
  if (inbound.some((fields) => fields.get('action') === 'Block')) return 'blocked';
  return 'allowed';
};

export { parseFirewallRules };

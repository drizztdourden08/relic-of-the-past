/* @layer renderer-app @kind constants */
import type { LogRule } from '@drizztdourden08/brock-randomizer';

const ROTP_LOG_RULES: readonly LogRule[] = [
  { pattern: /Overrode "/, kind: 'override', tag: 'OVRD' },
  { pattern: /Receipt text|receipt gates|message lines/i, kind: 'receipt', tag: 'RCPT' },
];

export { ROTP_LOG_RULES };

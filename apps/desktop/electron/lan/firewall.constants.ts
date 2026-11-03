/* @layer electron-main @kind constants */
const NETSH = 'netsh';

const POWERSHELL = 'powershell.exe';

const RULE_NAME = 'Relic of the Past';

const SHOW_RULES_ARGS = ['advfirewall', 'firewall', 'show', 'rule', 'name=all', 'verbose'];

const RULE_PROTOCOLS = ['TCP', 'UDP'] as const;

const NETSH_MAX_BUFFER = 64 * 1024 * 1024;

export { NETSH, NETSH_MAX_BUFFER, POWERSHELL, RULE_NAME, RULE_PROTOCOLS, SHOW_RULES_ARGS };

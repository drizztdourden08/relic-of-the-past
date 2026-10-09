/* @layer shared-storage @kind constants */
const TEXT_KEYS = ['serverUrl', 'slotName'] as const;
const FLAG_KEYS = ['deathLink', 'trackOtherPlayers'] as const;
const CONNECTION_KEYS: readonly string[] = [...TEXT_KEYS, ...FLAG_KEYS, 'password'];

export { CONNECTION_KEYS, FLAG_KEYS, TEXT_KEYS };

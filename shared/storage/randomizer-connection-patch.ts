/* @layer shared-storage @kind logic */
/**
 * The one rule for editing a randomizer profile after creation: only the connection of an
 * online profile changes. A patch naming any other key (the seed, the options, a pinned
 * setting) is refused whole, so nothing that shaped the seed can drift.
 */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

const TEXT_KEYS = ['serverUrl', 'slotName'] as const;
const FLAG_KEYS = ['deathLink', 'trackOtherPlayers'] as const;
const CONNECTION_KEYS: readonly string[] = [...TEXT_KEYS, ...FLAG_KEYS, 'password'];

const refuse = (reason: string): never => {
  throw new Error(`Connection edit refused: ${reason}`);
};

const checkKeys = (patch: RandomizerConnectionPatch): void => {
  const foreign = Object.keys(patch).filter((key) => !CONNECTION_KEYS.includes(key));
  if (foreign.length > 0) refuse(`${foreign.join(', ')} cannot change after creation`);
};

const checkValues = (patch: RandomizerConnectionPatch): void => {
  for (const key of TEXT_KEYS) {
    const value = patch[key];
    if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) refuse(`${key} is empty`);
  }
  for (const key of FLAG_KEYS) {
    const value = patch[key];
    if (value !== undefined && typeof value !== 'boolean') refuse(`${key} is not on or off`);
  }
  const { password } = patch;
  if (password !== undefined && password !== null && typeof password !== 'string') refuse('password is not text');
};

/** A copy of `config` with the patch applied. Throws on a local profile or a foreign key. */
const applyConnectionPatch = (
  config: ProfileRandomizerConfig | undefined, patch: RandomizerConnectionPatch,
): ProfileRandomizerConfig => {
  if (config?.mode !== 'online') return refuse('not an online profile');
  checkKeys(patch);
  checkValues(patch);
  const next: ProfileRandomizerConfig = { ...config };
  for (const key of TEXT_KEYS) if (patch[key] !== undefined) next[key] = patch[key].trim();
  for (const key of FLAG_KEYS) if (patch[key] !== undefined) next[key] = patch[key];
  if (patch.password === null || patch.password === '') delete next.password;
  else if (patch.password !== undefined) next.password = patch.password;
  return next;
};

export { applyConnectionPatch, CONNECTION_KEYS };

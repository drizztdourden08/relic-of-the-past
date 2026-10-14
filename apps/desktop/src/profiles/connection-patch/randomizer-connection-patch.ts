/* @layer shared-storage @kind logic */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@app/profiles/types';
import { CONNECTION_KEYS, FLAG_KEYS, TEXT_KEYS } from './randomizer-connection-patch.constants';

const refuse = (reason: string): never => {
  throw new Error(`Connection edit refused: ${reason}`);
};

const checkKeys = (patch: RandomizerConnectionPatch): void => {
  const foreign = Object.keys(patch).filter((key) => !CONNECTION_KEYS.includes(key));
  if (foreign.length > 0) refuse(`${foreign.join(', ')} cannot change after creation`);
};

const checkTextValues = (patch: RandomizerConnectionPatch): void => {
  for (const key of TEXT_KEYS) {
    const value = patch[key];
    if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) refuse(`${key} is empty`);
  }
};

const checkFlagValues = (patch: RandomizerConnectionPatch): void => {
  for (const key of FLAG_KEYS) {
    const value = patch[key];
    if (value !== undefined && typeof value !== 'boolean') refuse(`${key} is not on or off`);
  }
};

const checkValues = (patch: RandomizerConnectionPatch): void => {
  checkTextValues(patch);
  checkFlagValues(patch);
  const { password } = patch;
  if (password !== undefined && password !== null && typeof password !== 'string') refuse('password is not text');
};

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

export { applyConnectionPatch };

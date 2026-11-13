/* @layer renderer-app @kind logic */
import type { ListenTarget } from '@drizztdourden08/brock-input/renderer';
import type { InputBinding } from '@rotp/game-data';
import type { InputProfile } from '@rotp/input-mapping';

const verbBinding = (profile: InputProfile, id: string): InputBinding | null => {
  const core = profile.core ?? profile.modern?.core;
  if (!core) return null;
  return Object.entries(core).find(([verb]) => verb === id)?.[1] ?? null;
};

const currentBinding = (profile: InputProfile | null, target: ListenTarget): InputBinding | null => {
  if (!profile) return null;
  if (target.type === 'slot') return target.slot.binding;
  if (target.type === 'verb') return verbBinding(profile, target.id);
  if (target.scope === 'global') return null;
  return profile.mappings.find((mapping) => mapping.snesButton === target.id)?.binding ?? null;
};

export { currentBinding };

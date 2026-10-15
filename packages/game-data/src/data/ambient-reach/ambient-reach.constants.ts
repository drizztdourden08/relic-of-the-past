/* @layer shared-game-data @kind constants */
import type { AmbientReachEntry, AmbientRole } from './ambient-reach.type';

const AMBIENT_REACH: readonly AmbientReachEntry[] = [
  { id: 0x01, role: 'bed' },
  { id: 0x03, role: 'bed' },
  { id: 0x05, role: 'control' },
  { id: 0x07, role: 'bed' },
  { id: 0x09, role: 'cue' },
  { id: 0x0B, role: 'cue' },
  { id: 0x0D, role: 'cue' },
  { id: 0x0F, role: 'cue' },
  { id: 0x11, role: 'cue' },
  { id: 0x13, role: 'bed' },
  { id: 0x15, role: 'cue' },
  { id: 0x17, role: 'cue' },
];

const AMBIENT_ROLES: ReadonlyMap<number, AmbientRole> = new Map<number, AmbientRole>(
  AMBIENT_REACH.map((entry) => [entry.id, entry.role]),
);

export { AMBIENT_ROLES };

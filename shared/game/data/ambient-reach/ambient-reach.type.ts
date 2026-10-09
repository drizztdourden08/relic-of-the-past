/* @layer shared-game-data @kind types */
type AmbientRole = 'bed' | 'control' | 'cue';

interface AmbientReachEntry {
  id: number;
  role: AmbientRole;
}

export type { AmbientRole, AmbientReachEntry };

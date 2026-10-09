/* @layer renderer-app @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { rendersExtended } from '@app/lib/game/ratio-capability';

const legacyMaster = (origin: string | undefined, s: GameSettings): boolean => {
  if (origin === 'GameChangingBugFixes') return s.gameChangingBugFixes;
  if (origin === 'WidescreenVisualFixes') return rendersExtended(s) && s.widescreenVisualFixes;
  return s.miscBugFixes;
};

export { legacyMaster };

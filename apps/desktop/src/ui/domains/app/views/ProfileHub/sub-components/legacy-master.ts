/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { rendersExtended } from '@app/lib/game/ratio-capability';

const legacyMaster = (origin: string | undefined, s: GameSettings): boolean =>
  origin === 'GameChangingBugFixes'
    ? s.gameChangingBugFixes
    : origin === 'WidescreenVisualFixes'
      ? rendersExtended(s) && s.widescreenVisualFixes
      : s.miscBugFixes;

export { legacyMaster };

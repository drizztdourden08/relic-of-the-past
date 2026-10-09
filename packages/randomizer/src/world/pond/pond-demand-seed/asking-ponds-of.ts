/* @layer shared-game @kind logic */
import { POND_INSTANCES } from '../pond-instances';
import type { PondProfiles } from '../pond-profiles.type';
import type { AskingPond } from '../pond.type';

const askingPondsOf = (ponds: PondProfiles): readonly AskingPond[] =>
  POND_INSTANCES.flatMap((pond) => {
    const setting = ponds[pond.id];
    return setting.mode === 'custom' ? [{ pond, setting }] : [];
  });

export { askingPondsOf };

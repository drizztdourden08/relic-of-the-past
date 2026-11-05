/* @layer renderer-app @kind logic */
import { parseCapacityProfile } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
import type { GameSettings } from '@rotp/features';

const frozenSettingsOf = (values: Readonly<Record<string, OptionValue | undefined>>): Partial<GameSettings> =>
  (parseCapacityProfile(values).profile.wallet.mode === 'custom' ? { carryMoreRupees: true } : {});

export { frozenSettingsOf };

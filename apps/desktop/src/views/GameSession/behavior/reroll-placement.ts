/* @layer renderer-appshell @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { log } from '@app/lib/log-bus';
import { saveRandomizerPlacement } from '@app/lib/randomizer-placement-io';
import { rollPlacement } from './roll-placement';

const rerollPlacement = async (profileId: string, config: ProfileRandomizerConfig): Promise<Placement | null> => {
  try {
    const placement = rollPlacement(config);
    await saveRandomizerPlacement(profileId, placement);
    log.randomizer(`[Boot] Placement file unreadable by this build; rolled seed ${config.seed} again`, 'warn');
    return placement;
  } catch (error) {
    log.error(`Randomizer generation failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

export { rerollPlacement };

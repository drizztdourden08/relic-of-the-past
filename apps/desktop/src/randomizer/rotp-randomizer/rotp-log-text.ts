/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { RandomizerLogText } from '@drizztdourden08/brock-randomizer';
import { textOf } from '@app/shell/text-bridge';
import { onlineSlotName } from './online-slot-name-slot';

const autoStartText = (mode: string, seed: string): string => textOf(mode === 'online'
  ? msg('views-randomizer:log.auto-start-online', { mode, slot: onlineSlotName.current })
  : msg('views-randomizer:log.auto-start-seed', { mode, seed }));

const rotpLogText: Partial<RandomizerLogText> = {
  autoStart: autoStartText,
  armed: () => null,
  rerollFailed: (message) => textOf(msg('views-randomizer:log.reroll-failed', { message })),
};

export { rotpLogText };

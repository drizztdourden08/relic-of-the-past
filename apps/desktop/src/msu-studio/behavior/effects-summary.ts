/* @layer renderer-components @kind logic */
import type { SoundPanelController } from '../msu.type';
import type { EffectsSummary } from './effects-panel.type';

const effectsSummary = (first: SoundPanelController, second: SoundPanelController): EffectsSummary => ({
  replaced: first.replacedCount + second.replacedCount,
  total: first.total + second.total,
  sounding: [first.playing, second.playing, first.playingOriginal, second.playingOriginal].some((id) => id !== null),
  status: first.statusMessage ?? second.statusMessage,
  statusOk: first.statusOk && second.statusOk,
});

export { effectsSummary };

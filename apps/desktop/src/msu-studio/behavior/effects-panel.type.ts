/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';
import type { SoundPanelController } from '../msu.type';

type EffectRow = { channel: SoundChannel; row: SoundPanelController['rows'][number] };

type OpenEffect = { channel: SoundChannel; soundId: number };

type EffectsSummary = {
  replaced: number;
  total: number;
  sounding: boolean;
  status: string | null;
  statusOk: boolean;
};

export type { EffectRow, EffectsSummary, OpenEffect };

/* @layer renderer-components @kind constants */
import type { LayerPlayMode } from '@rotp/game-data';
import type { PlayModeKind } from './layer-ops.type';

const DEFAULT_CROSSFADE_SECONDS = 0;
const DEFAULT_WAIT_FOR_COMPLETION = false;

const DEFAULT_MODES: Record<PlayModeKind, LayerPlayMode> = {
  once: { kind: 'once' },
  loop: { kind: 'loop', order: 'sequential', crossfadeSeconds: DEFAULT_CROSSFADE_SECONDS },
  random: {
    kind: 'random',
    minDelaySeconds: 10,
    maxDelaySeconds: 30,
    waitForCompletion: DEFAULT_WAIT_FOR_COMPLETION,
  },
  interval: { kind: 'interval', atSeconds: [] },
};

const MODE_LABELS: Record<PlayModeKind, string> = {
  once: 'Once', loop: 'Loop', random: 'Random', interval: 'Interval',
};

export { DEFAULT_CROSSFADE_SECONDS, DEFAULT_WAIT_FOR_COMPLETION, DEFAULT_MODES, MODE_LABELS };

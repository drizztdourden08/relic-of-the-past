/* @layer renderer-components @kind data */
/**
 * The wording for the play-mode controls, kept beside the component so the copy can be read and
 * corrected without stepping through JSX.
 *
 * The wait-for-completion hint is written per state rather than as one sentence about the option,
 * because what matters is the audible consequence of where the switch is standing right now.
 */
import type { SegmentOption } from '@ds/primitives/SegmentedControl';
import { MODE_LABELS } from '../../behavior/layer-ops';
import type { PlayModeKind } from '../../behavior/layer-ops';

const MODE_OPTIONS: SegmentOption<PlayModeKind>[] = (Object.keys(MODE_LABELS) as PlayModeKind[])
  .map((kind) => ({ value: kind, label: MODE_LABELS[kind] }));

const MODE_HINTS: Record<PlayModeKind, string> = {
  once: 'Plays through a single time and stops.',
  loop: 'Repeats forever. With one file it loops on itself at its own repeat point; with several '
    + 'it plays them one after another.',
  random: 'Fires one file at a random gap, forever.',
  interval: 'Fires at fixed times measured from the start of the slot.',
};

type LoopOrder = 'sequential' | 'random' | 'single';

const ORDER_OPTIONS: SegmentOption<LoopOrder>[] = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'random', label: 'Shuffle' },
  { value: 'single', label: 'Single' },
];

/** Read under the control, because which one is selected changes what the layer even is. */
const ORDER_HINTS: Record<LoopOrder, string> = {
  sequential: 'Plays the files in the order listed, then starts over.',
  random: 'Draws a different file each pass.',
  single: 'One track, repeating at its own loop point — the intro plays once and the body repeats. '
    + 'No crossfade: the seam is wherever the file says it is. This is how MSU-1 itself works.',
};

const CROSSFADE_LABEL = 'Crossfade — overlap into the next pass';

const CROSSFADE_HINT
  = 'How long one pass overlaps the next: the outgoing file fades out while the incoming one '
  + 'fades in. Off cuts straight from one to the other.';

const WAIT_LABEL = 'Wait for the sound to finish';

const WAIT_HINTS = {
  off: 'Off: the gap is timed from the moment a sound STARTS, so a file longer than the gap is '
    + 'still playing when the next one fires and they layer up.',
  on: 'On: the gap starts only once the sound has FINISHED, so exactly one plays at a time.',
};

export {
  MODE_OPTIONS, MODE_HINTS, ORDER_OPTIONS, ORDER_HINTS,
  CROSSFADE_LABEL, CROSSFADE_HINT, WAIT_LABEL, WAIT_HINTS,
};
export type { LoopOrder };

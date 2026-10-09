/* @layer renderer-components @kind constants */
import type { HudAnimatableProperty, HudAnimation } from '@rotp/hud';
import type { LoopOption } from './AnimationSection.type';

const PROPERTIES: readonly HudAnimatableProperty[] = ['scale', 'opacity', 'x', 'y', 'rotate', 'tint', 'width', 'height'];
const LOOPS: readonly LoopOption[] = [
  { value: 'none', label: 'none' }, { value: 'loop', label: 'loop' }, { value: 'ping-pong', label: 'ping' },
];
const REFLOW = new Set<HudAnimatableProperty>(['width', 'height']);

const BLANK: HudAnimation = { property: 'scale', keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.1 }], duration: 300, loop: 'none' };

export { BLANK, LOOPS, PROPERTIES, REFLOW };

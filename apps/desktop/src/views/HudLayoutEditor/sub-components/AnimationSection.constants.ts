/* @layer renderer-components @kind constants */
import type { HudAnimatableProperty, HudAnimation } from '@rotp/hud';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { LoopOption } from './AnimationSection.type';

const PROPERTIES: readonly HudAnimatableProperty[] = ['scale', 'opacity', 'x', 'y', 'rotate', 'tint', 'width', 'height'];
const LOOPS: readonly LoopOption[] = [
  { value: 'none', label: msg('hud-editor:animation.loop.none') },
  { value: 'loop', label: msg('hud-editor:animation.loop.loop') },
  { value: 'ping-pong', label: msg('hud-editor:animation.loop.ping') },
];
const REFLOW = new Set<HudAnimatableProperty>(['width', 'height']);

const BLANK: HudAnimation = { property: 'scale', keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.1 }], duration: 300, loop: 'none' };

export { BLANK, LOOPS, PROPERTIES, REFLOW };

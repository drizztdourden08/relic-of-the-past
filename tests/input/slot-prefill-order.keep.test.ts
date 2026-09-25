/* @layer test @kind test */
/**
 * The prefill order is a JOIN, not a cosmetic choice.
 *
 * A HUD layout and a control scheme are tied together by the slot NUMBER and by
 * nothing else, and the built-in HUD documents put slot 1 on the north face
 * button through to slot 8 on d-pad right. SDL reports its buttons starting at
 * SOUTH, so taking the device's own order would make slot 1 the bottom face
 * button and every shipped layout would draw the right shape with the wrong
 * controls in it. That failure looks like a HUD bug and lives in the input
 * layer. This file is what stops that.
 */
import { describe, expect, it } from 'vitest';
import { defaultSlotList } from '@shared/input/scheme';
import type { ResolvedControl } from '@shared/input/family/family.type';
import type { CoreBindings } from '@shared/types/controls';

const button = (position: string): ResolvedControl =>
  ({ position, kind: 'button', category: 'face', label: position, icon: null } as ResolvedControl);

/** SDL's own order: SOUTH first, d-pad before the face cross is finished. */
const SDL_REPORT_ORDER = ['SOUTH', 'EAST', 'WEST', 'NORTH', 'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT'];

const NO_CORE = { up: { type: 'none' }, down: { type: 'none' }, left: { type: 'none' },
  right: { type: 'none' }, pause: { type: 'none' }, map: { type: 'none' } } as unknown as CoreBindings;

describe('the prefilled slot order', () => {
  it('puts the face cross on 1-4 and the d-pad on 5-8, whatever order the device reported', () => {
    const slots = defaultSlotList(SDL_REPORT_ORDER.map(button), NO_CORE);
    expect(slots.map((s) => s.position)).toEqual([
      'NORTH', 'WEST', 'EAST', 'SOUTH', 'DPAD_UP', 'DPAD_LEFT', 'DPAD_RIGHT', 'DPAD_DOWN',
    ]);
    expect(slots.map((s) => s.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('keeps every other control, in the order the device reported it, after the ranked eight', () => {
    const controls = [button('LEFT_SHOULDER'), ...SDL_REPORT_ORDER.map(button), button('RIGHT_SHOULDER')];
    const positions = defaultSlotList(controls, NO_CORE).map((s) => s.position);
    expect(positions.slice(0, 8)).toEqual([
      'NORTH', 'WEST', 'EAST', 'SOUTH', 'DPAD_UP', 'DPAD_LEFT', 'DPAD_RIGHT', 'DPAD_DOWN',
    ]);
    expect(positions.slice(8)).toEqual(['LEFT_SHOULDER', 'RIGHT_SHOULDER']);
  });
});

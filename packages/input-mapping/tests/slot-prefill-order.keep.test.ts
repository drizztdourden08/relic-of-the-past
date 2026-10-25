/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { defaultSlotList } from '@rotp/input-mapping';
import type { ResolvedControl, SdlButtonName } from '@drizztdourden08/brock-input';
import type { CoreBindings } from '@rotp/game-data';

const button = (position: SdlButtonName): ResolvedControl =>
  ({ position, kind: 'button', category: 'face', label: position, icon: '' });

const SDL_REPORT_ORDER: SdlButtonName[] = ['SOUTH', 'EAST', 'WEST', 'NORTH', 'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT'];

const NO_CORE: CoreBindings = { up: { type: 'none' }, down: { type: 'none' }, left: { type: 'none' },
  right: { type: 'none' }, pause: { type: 'none' }, map: { type: 'none' },
  confirm: { type: 'none' }, cancel: { type: 'none' }, prevScreen: { type: 'none' }, nextScreen: { type: 'none' } };

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

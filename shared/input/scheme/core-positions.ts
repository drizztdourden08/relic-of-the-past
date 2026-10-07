/* @layer shared-input @kind logic */
/**
 * Which physical positions the core's GAMEPLAY verbs have already claimed.
 *
 * Only the six gameplay verbs claim anything: movement, pause and map are live
 * while the player is playing, so a slot cannot share a button with them. The
 * four menu verbs claim nothing, because they answer only while the pause menu is
 * open, and the menu owns input outright while it is, so the same physical
 * button is a menu verb there and a gameplay slot everywhere else. That is the
 * arrangement a player expects: confirm sits on the same button as the action.
 * Claiming them here instead would cost a default pad its two most natural
 * face buttons before the player had touched anything.
 *
 * That sharing matters MORE now that only the face buttons and the d-pad are
 * assignable, not less. Prev/next screen default to the shoulders, which are no
 * longer slot candidates at all, so those two verbs cost nothing whatever this
 * file does. Confirm and cancel still default to EAST and SOUTH, which are two
 * of the four slots a pad with movement on the d-pad has, so the shadowing
 * rule in `menu-shadowed-slots.ts` is what keeps a menu press from also firing
 * the item on the button underneath it. Moving those two verbs off the face to
 * buy the slots back outright would put "confirm" on a shoulder, which is a
 * worse trade than sharing.
 *
 * A verb bound to a shoulder, trigger, paddle or stick click still claims that
 * position here. The claim is invisible now: nothing assignable lives
 * there for it to take.
 *
 * This is the whole mechanism behind "move on the stick to free the d-pad".
 * A gamepad-BUTTON binding claims the position it sits on, so that position
 * can never also be a slot. A gamepad-AXIS binding claims a position only
 * when the axis is a trigger, because a trigger is one physical control whether the
 * host reads it as an axis or a button, so binding a verb to it does take it
 * out of circulation. A stick axis claims NOTHING: the stick is not one of
 * the positions a slot can live on, so movement bound to it leaves all four
 * d-pad buttons free to become slots. Keyboard and unbound verbs claim
 * nothing either, for the same reason: no SDL position is involved.
 */
import { SDL_AXIS, SDL_BUTTON } from '../sdl-buttons';
import type { SdlAxisName, SdlButtonName } from '../sdl-buttons';
import type { CoreBindings, InputBinding } from '../../types/controls';

type SdlPosition = SdlButtonName | SdlAxisName;

const BUTTON_BY_INDEX = new Map<number, SdlButtonName>(
  (Object.keys(SDL_BUTTON) as SdlButtonName[]).map(name => [SDL_BUTTON[name], name]),
);

const AXIS_BY_INDEX = new Map<number, SdlAxisName>(
  (Object.keys(SDL_AXIS) as SdlAxisName[]).map(name => [SDL_AXIS[name], name]),
);

const TRIGGER_AXIS_NAMES: readonly SdlAxisName[] = ['LEFT_TRIGGER', 'RIGHT_TRIGGER'];

/** The position one binding takes out of circulation, or null for none. */
const positionOfBinding = (binding: InputBinding): SdlPosition | null => {
  if (binding.type === 'gamepad-button') return BUTTON_BY_INDEX.get(binding.index) ?? null;
  if (binding.type === 'gamepad-axis') {
    const axis = AXIS_BY_INDEX.get(binding.axisIndex);
    return axis && TRIGGER_AXIS_NAMES.includes(axis) ? axis : null;
  }
  return null;
};

/** The verbs that are live during gameplay, and so exclude a slot. */
const GAMEPLAY_VERBS = ['up', 'down', 'left', 'right', 'pause', 'map'] as const;

const corePositions = (core: CoreBindings): Set<SdlPosition> => {
  const claimed = new Set<SdlPosition>();
  for (const verb of GAMEPLAY_VERBS) {
    const position = positionOfBinding(core[verb]);
    if (position) claimed.add(position);
  }
  return claimed;
};

export { corePositions, positionOfBinding, GAMEPLAY_VERBS };
export type { SdlPosition };

/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SnesButton } from '@rotp/game-data';

const SNES_ACTION_MESSAGES: Readonly<Record<SnesButton, Message>> = {
  A: msg('profiles:controls.snes.action.a'),
  B: msg('profiles:controls.snes.action.b'),
  X: msg('profiles:controls.snes.action.x'),
  Y: msg('profiles:controls.snes.action.y'),
  L: msg('profiles:controls.snes.action.l'),
  R: msg('profiles:controls.snes.action.r'),
  Start: msg('profiles:controls.snes.action.start'),
  Select: msg('profiles:controls.snes.action.select'),
  Up: msg('profiles:controls.snes.action.up'),
  Down: msg('profiles:controls.snes.action.down'),
  Left: msg('profiles:controls.snes.action.left'),
  Right: msg('profiles:controls.snes.action.right'),
};

const SNES_BUTTON_MESSAGES: Readonly<Record<SnesButton, Message>> = {
  A: msg('profiles:controls.snes.button.a'),
  B: msg('profiles:controls.snes.button.b'),
  X: msg('profiles:controls.snes.button.x'),
  Y: msg('profiles:controls.snes.button.y'),
  L: msg('profiles:controls.snes.button.l'),
  R: msg('profiles:controls.snes.button.r'),
  Start: msg('profiles:controls.snes.button.start'),
  Select: msg('profiles:controls.snes.button.select'),
  Up: msg('profiles:controls.snes.button.up'),
  Down: msg('profiles:controls.snes.button.down'),
  Left: msg('profiles:controls.snes.button.left'),
  Right: msg('profiles:controls.snes.button.right'),
};

export { SNES_ACTION_MESSAGES, SNES_BUTTON_MESSAGES };

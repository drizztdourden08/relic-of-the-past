/* @layer shared-hud @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import arrowIndicatorJson from '../../data/presets/arrow-indicator.json';
import bombIndicatorJson from '../../data/presets/bomb-indicator.json';
import dpadGroupJson from '../../data/presets/dpad-group.json';
import faceGroupJson from '../../data/presets/face-group.json';
import heartsJson from '../../data/presets/hearts.json';
import keyIndicatorJson from '../../data/presets/key-indicator.json';
import magicBarJson from '../../data/presets/magic-bar.json';
import walletJson from '../../data/presets/wallet.json';

const PRESET_SOURCES = [
  { id: 'hearts', name: msg('hud:preset.hearts.name'), icon: '♥', json: heartsJson },
  { id: 'magic-bar', name: msg('hud:preset.magic-bar.name'), icon: '◆', json: magicBarJson },
  { id: 'arrow-indicator', name: msg('hud:preset.arrow-indicator.name'), icon: '➢', json: arrowIndicatorJson },
  { id: 'bomb-indicator', name: msg('hud:preset.bomb-indicator.name'), icon: '●', json: bombIndicatorJson },
  { id: 'key-indicator', name: msg('hud:preset.key-indicator.name'), icon: '⚷', json: keyIndicatorJson },
  { id: 'wallet', name: msg('hud:preset.wallet.name'), icon: '🪙', json: walletJson },
  { id: 'face-group', name: msg('hud:preset.face-group.name'), icon: '◉', json: faceGroupJson },
  { id: 'dpad-group', name: msg('hud:preset.dpad-group.name'), icon: '✚', json: dpadGroupJson },
] as const;

export { PRESET_SOURCES };

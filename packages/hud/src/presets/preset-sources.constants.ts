/* @layer shared-hud @kind data */
import arrowIndicatorJson from '../../data/presets/arrow-indicator.json';
import bombIndicatorJson from '../../data/presets/bomb-indicator.json';
import dpadGroupJson from '../../data/presets/dpad-group.json';
import faceGroupJson from '../../data/presets/face-group.json';
import heartsJson from '../../data/presets/hearts.json';
import keyIndicatorJson from '../../data/presets/key-indicator.json';
import magicBarJson from '../../data/presets/magic-bar.json';
import walletJson from '../../data/presets/wallet.json';

const PRESET_SOURCES = [
  { id: 'hearts', name: 'Hearts', icon: '♥', json: heartsJson },
  { id: 'magic-bar', name: 'Magic bar', icon: '◆', json: magicBarJson },
  { id: 'arrow-indicator', name: 'Arrow indicator', icon: '➢', json: arrowIndicatorJson },
  { id: 'bomb-indicator', name: 'Bomb indicator', icon: '●', json: bombIndicatorJson },
  { id: 'key-indicator', name: 'Key indicator', icon: '⚷', json: keyIndicatorJson },
  { id: 'wallet', name: 'Wallet', icon: '🪙', json: walletJson },
  { id: 'face-group', name: 'Face group', icon: '◉', json: faceGroupJson },
  { id: 'dpad-group', name: 'D-pad group', icon: '✚', json: dpadGroupJson },
] as const;

export { PRESET_SOURCES };

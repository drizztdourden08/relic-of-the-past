/* @layer bridge-wasm @kind constants */
import type { NoticePart } from './online-notices';

const TONE_OF_PART: Readonly<Record<string, NoticePart['tone']>> = {
  player_id: 'player', player_name: 'player', item_id: 'item', item_name: 'item',
};

export { TONE_OF_PART };

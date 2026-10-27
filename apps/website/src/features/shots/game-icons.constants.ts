/* @layer website-site @kind data */
import type { GameIcon } from '../feature-visual.type';

const GAME_ICONS: readonly [GameIcon, ...GameIcon[]] = [
  { id: 'archipelago', name: 'Archipelago', src: 'media/games/archipelago.svg' },
  { id: 'zelda-1', name: 'The Legend of Zelda', src: 'media/games/zelda-1.svg' },
  { id: 'zelda-2', name: 'Zelda II: The Adventure of Link', src: 'media/games/zelda-2.svg' },
  { id: 'links-awakening', name: "Link's Awakening", src: 'media/games/links-awakening.svg' },
  { id: 'ocarina-of-time', name: 'Ocarina of Time', src: 'media/games/ocarina-of-time.svg' },
  { id: 'majoras-mask', name: "Majora's Mask", src: 'media/games/majoras-mask.svg' },
  { id: 'oracle-of-ages', name: 'Oracle of Ages', src: 'media/games/oracle-of-ages.svg' },
  { id: 'oracle-of-seasons', name: 'Oracle of Seasons', src: 'media/games/oracle-of-seasons.svg' },
  { id: 'minish-cap', name: 'The Minish Cap', src: 'media/games/minish-cap.svg' },
  { id: 'wind-waker', name: 'The Wind Waker', src: 'media/games/wind-waker.svg' },
  { id: 'twilight-princess', name: 'Twilight Princess', src: 'media/games/twilight-princess.svg' },
  { id: 'skyward-sword', name: 'Skyward Sword', src: 'media/games/skyward-sword.svg' },
  { id: 'a-link-between-worlds', name: 'A Link Between Worlds', src: 'media/games/a-link-between-worlds.svg' },
];

export { GAME_ICONS };

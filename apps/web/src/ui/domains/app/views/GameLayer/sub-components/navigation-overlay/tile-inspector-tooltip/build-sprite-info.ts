/* @layer renderer-components @kind logic */
import { SPRITE_TILE_LIMIT, TILE_PX } from './tile-inspector-tooltip.constants';
import type { Sprites } from './tile-inspector-tooltip.type';

const hexByte = (v: number) => v.toString(16).padStart(2, '0');

const buildSpriteInfo = (sprites: Sprites, tileRow: number, tileCol: number, screenWorldX: number, screenWorldY: number): string[] =>
  sprites
    .map(s => {
      const c0 = Math.floor((s.x - screenWorldX) / TILE_PX);
      const r0 = Math.floor((s.y - screenWorldY) / TILE_PX);
      const dr = Math.max(0, Math.abs(tileRow - r0) - 1);
      const dc2 = Math.max(0, Math.abs(tileCol - c0) - 1);
      const dist = dr + dc2;
      return { s, r0, c0, dist };
    })
    .filter(x => x.r0 >= -1 && x.r0 < SPRITE_TILE_LIMIT && x.c0 >= -1 && x.c0 < SPRITE_TILE_LIMIT && x.dist === 0)
    .sort((a, b) => a.s.slot - b.s.slot)
    .map(({ s, r0, c0, dist }) => {
      const near = dist === 0 ? 'on' : `d${dist}`;
      return `#${s.slot} type 0x${hexByte(s.type)} st 0x${hexByte(s.state)} sub ${s.subtype}/${s.subtype2} e${s.e} @${c0},${r0} ${near}`;
    });

export { buildSpriteInfo };

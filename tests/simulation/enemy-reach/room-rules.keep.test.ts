/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { evaluateRoomThreat } from '../../../shared/game/simulation/engine/enemy-reach';
import { describeDataset } from '../../dataset-guard';
import { BOW, DAMAGE_CLASS_COUNT, ROOM_CLEAR_EXEMPT_FLAG, SWORD_1, SWORD_4 } from './enemy-reach.constants';
import { grids } from './grids';
import { makeSprite } from './make-sprite';
import { makeTables } from './make-tables';

describeDataset('evaluateRoomThreat on room-clear-exempt sprites', () => {
  it('excludes a sprite whose flags4 carries the room-clear-exempt bit from gating', () => {
    const sprite = makeSprite({ row: 5, col: 5 });
    const threat = evaluateRoomThreat({
      sprites: [sprite],
      reached: grids.fullyReached(),
      grids: grids.bundle(grids.openAttr()),
      inventory: new Set(),
      combat: {
        tables: makeTables(),
        bySpriteType: { 1: { health: 4, flags4: ROOM_CLEAR_EXEMPT_FLAG, damageByClass: new Array(DAMAGE_CLASS_COUNT).fill(0) } },
      },
    });

    expect(threat.gating).toHaveLength(0);
    expect(threat.clearable).toBe(true);
  });
});

describeDataset('evaluateRoomThreat in a multi-section room', () => {
  const SECTION_GRID_SIZE = 64;
  const wideOpenAttrGrid = (): number[][] => Array.from({ length: SECTION_GRID_SIZE }, () => new Array<number>(SECTION_GRID_SIZE).fill(0));
  const wideReached = (): boolean[][] => Array.from({ length: SECTION_GRID_SIZE }, () => new Array<boolean>(SECTION_GRID_SIZE).fill(true));

  it('gates only the sprite sharing the player\'s scroll section, and the room reads clearable', () => {
    const westGuard = makeSprite({ row: 48, col: 12 }, 0x42);
    const eastGuard = makeSprite({ row: 48, col: 52 }, 0x41);
    const damageByClass = new Array(DAMAGE_CLASS_COUNT).fill(0);
    damageByClass[1] = 3;

    const threat = evaluateRoomThreat({
      sprites: [westGuard, eastGuard],
      reached: wideReached(),
      grids: grids.bundle(wideOpenAttrGrid()),
      inventory: new Set([SWORD_1]),
      combat: {
        tables: makeTables(),
        bySpriteType: {
          0x42: { health: 4, flags4: 0, damageByClass },
          0x41: { health: 4, flags4: 0, damageByClass },
        },
      },
      split: { splitX: true, splitY: false, playerSectionX: 0, playerSectionY: 0 },
    });

    expect(threat.gating).toHaveLength(1);
    expect(threat.gating[0].sprite.spriteType).toBe(0x42);
    expect(threat.gating[0].killable).toBe(true);
    expect(threat.clearable).toBe(true);
  });
});

describeDataset('evaluateRoomThreat when combat reasoning is unavailable', () => {
  it('reads every sprite as not killable when the developer-tools combat gate is off', () => {
    const sprite = makeSprite({ row: 5, col: 5 });
    const threat = evaluateRoomThreat({
      sprites: [sprite],
      reached: grids.fullyReached(),
      grids: grids.bundle(grids.openAttr()),
      inventory: new Set([BOW, SWORD_4]),
      combat: { tables: null, bySpriteType: {} },
    });

    expect(threat.gating).toHaveLength(1);
    expect(threat.gating[0].killable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('gated-off');
    expect(threat.clearable).toBe(false);
  });

  it('treats a missing combat context the same way as an explicit null-tables gate', () => {
    const sprite = makeSprite({ row: 5, col: 5 });
    const threat = evaluateRoomThreat({
      sprites: [sprite],
      reached: grids.fullyReached(),
      grids: grids.bundle(grids.openAttr()),
      inventory: new Set([SWORD_4]),
      combat: undefined,
    });

    expect(threat.clearable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('gated-off');
  });
});

/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { GridPos } from '../../shared/game/navigation/types';
import type { SimSprite, ScreenGridBundle, CombatContext, CombatTables } from '../../shared/game/simulation/types';
import { evaluateRoomThreat } from '../../shared/game/simulation/engine/enemy-reach';
import type { ItemId } from '../../shared/game/data';

// Inventories are dataset ids: item-012 bow, item-074 tier-1 sword, item-004 tier-4,
// item-013 blue boomerang, item-008 fire rod.
const BOW: ItemId = 'item-012';
const SWORD_1: ItemId = 'item-074';
const SWORD_4: ItemId = 'item-004';
const BOOMERANG: ItemId = 'item-013';
const FIRE_ROD: ItemId = 'item-008';

const GRID_SIZE = 20;

const emptyGrid = (): boolean[][] => Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(false));
const openAttrGrid = (): number[][] => Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0));

const stamp2x2 = (reached: boolean[][], at: GridPos): void => {
  reached[at.row][at.col] = true;
  reached[at.row][at.col + 1] = true;
  reached[at.row + 1][at.col] = true;
  reached[at.row + 1][at.col + 1] = true;
};

const fullyReached = (): boolean[][] => Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(true));

const makeSprite = (tile: GridPos, spriteType = 1): SimSprite => ({
  roomId: 1,
  spriteType,
  tile,
  posKnown: true,
  kind: 'other',
});

const makeGrids = (rawAttrGrid: number[][]): ScreenGridBundle => ({
  screenIndex: 1,
  tileContext: 'overworld',
  rawAttrGrid,
});

const BLOCKING_ATTR = 0x20;

const makeTables = (overrides: Partial<CombatTables> = {}): CombatTables => ({
  ancillaDamageClass: new Array(57).fill(0),
  projectileTileCollision: (() => {
    const table = new Array<number>(256).fill(0);
    table[BLOCKING_ATTR] = 1;
    return table;
  })(),
  ...overrides,
});

describe('evaluateRoomThreat — line of fire', () => {
  it('is blocked by a wall between the only standable tile and the target', () => {
    const enemy = { row: 10, col: 10 };
    const reached = emptyGrid();
    stamp2x2(reached, { row: 10, col: 6 }); // the only standable tile, 4 west of the enemy
    const attrGrid = openAttrGrid();
    attrGrid[10][8] = BLOCKING_ATTR; // sits strictly between the tile and the enemy

    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached,
      grids: makeGrids(attrGrid),
      inventory: new Set([BOW]),
      combat: {
        tables: makeTables({ ancillaDamageClass: (() => { const c = new Array(57).fill(0); c[0x09] = 5; return c; })() }),
        bySpriteType: { 1: { health: 4, flags4: 0, damageByClass: (() => { const d = new Array(16).fill(0); d[5] = 2; return d; })() } },
      },
    });

    expect(threat.gating).toHaveLength(1);
    expect(threat.gating[0].killable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('no-line');
    expect(threat.clearable).toBe(false);
  });
});

describe('evaluateRoomThreat — zero damage class', () => {
  it('reads not killable when the only weapon on hand deals zero damage to this sprite', () => {
    const enemy = { row: 5, col: 5 };
    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached: fullyReached(),
      grids: makeGrids(openAttrGrid()),
      inventory: new Set([SWORD_1]), // tier 1 -> damage class 1
      combat: {
        tables: makeTables(),
        bySpriteType: { 1: { health: 4, flags4: 0, damageByClass: new Array(16).fill(0) } }, // class 1 reads 0
      },
    });

    expect(threat.gating[0].killable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('no-weapon');
    expect(threat.clearable).toBe(false);
  });

  it('does not treat the boomerang (damage class 0) as automatically harmless', () => {
    const enemy = { row: 5, col: 5 };
    const damageByClass = new Array(16).fill(0);
    damageByClass[0] = 3; // class 0 is a real, nonzero-here class
    const ancillaDamageClass = new Array(57).fill(0); // Blue Boomerang -> ancilla 0x05 -> class 0
    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached: fullyReached(),
      grids: makeGrids(openAttrGrid()),
      inventory: new Set([BOOMERANG]),
      combat: { tables: makeTables({ ancillaDamageClass }), bySpriteType: { 1: { health: 2, flags4: 0, damageByClass } } },
    });

    expect(threat.gating[0].killable).toBe(true);
    expect(threat.gating[0].by?.label).toBe('boomerang');
  });
});

describe('evaluateRoomThreat — unbounded beam reach', () => {
  it('kills an enemy only reachable from far away with an unbounded weapon', () => {
    const enemy = { row: 15, col: 15 };
    const reached = emptyGrid();
    stamp2x2(reached, { row: 15, col: 0 }); // 15 tiles west — out of sword/bomb contact range
    const ancillaDamageClass = new Array(57).fill(0);
    ancillaDamageClass[0x02] = 4; // Fire Rod
    const damageByClass = new Array(16).fill(0);
    damageByClass[4] = 1;

    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached,
      grids: makeGrids(openAttrGrid()),
      inventory: new Set([FIRE_ROD]),
      combat: { tables: makeTables({ ancillaDamageClass }), bySpriteType: { 1: { health: 1, flags4: 0, damageByClass } } },
    });

    expect(threat.gating[0].killable).toBe(true);
    expect(threat.gating[0].by?.kind).toBe('travelling');
    expect(threat.gating[0].by?.travel).toBe(Infinity);
    expect(threat.clearable).toBe(true);
  });
});

describe('evaluateRoomThreat — room-clear-exempt sprites', () => {
  it('excludes a sprite whose flags4 carries the room-clear-exempt bit from gating', () => {
    const sprite = makeSprite({ row: 5, col: 5 });
    const threat = evaluateRoomThreat({
      sprites: [sprite],
      reached: fullyReached(),
      grids: makeGrids(openAttrGrid()),
      inventory: new Set(),
      combat: { tables: makeTables(), bySpriteType: { 1: { health: 4, flags4: 0x40, damageByClass: new Array(16).fill(0) } } },
    });

    expect(threat.gating).toHaveLength(0);
    expect(threat.clearable).toBe(true);
  });
});

describe('evaluateRoomThreat — multi-section room', () => {
  const SECTION_GRID_SIZE = 64;
  const wideOpenAttrGrid = (): number[][] => Array.from({ length: SECTION_GRID_SIZE }, () => new Array<number>(SECTION_GRID_SIZE).fill(0));
  const wideReached = (): boolean[][] => Array.from({ length: SECTION_GRID_SIZE }, () => new Array<boolean>(SECTION_GRID_SIZE).fill(true));

  it('gates only the sprite sharing the player\'s scroll section, and the room reads clearable', () => {
    const westGuard = makeSprite({ row: 48, col: 12 }, 0x42); // same section as the player
    const eastGuard = makeSprite({ row: 48, col: 52 }, 0x41); // across the room's internal split
    const damageByClass = new Array(16).fill(0);
    damageByClass[1] = 3; // both sprite types share a row a sword kills

    const threat = evaluateRoomThreat({
      sprites: [westGuard, eastGuard],
      reached: wideReached(),
      grids: makeGrids(wideOpenAttrGrid()),
      inventory: new Set([SWORD_1]),
      combat: {
        tables: makeTables(),
        bySpriteType: {
          0x42: { health: 4, flags4: 0, damageByClass },
          0x41: { health: 4, flags4: 0, damageByClass },
        },
      },
      // West/east split, player standing in the west section (section 0).
      split: { splitX: true, splitY: false, playerSectionX: 0, playerSectionY: 0 },
    });

    expect(threat.gating).toHaveLength(1);
    expect(threat.gating[0].sprite.spriteType).toBe(0x42);
    expect(threat.gating[0].killable).toBe(true);
    expect(threat.clearable).toBe(true);
  });
});

describe('evaluateRoomThreat — combat reasoning unavailable', () => {
  it('reads every sprite as not killable when the developer-tools combat gate is off', () => {
    const sprite = makeSprite({ row: 5, col: 5 });
    const threat = evaluateRoomThreat({
      sprites: [sprite],
      reached: fullyReached(),
      grids: makeGrids(openAttrGrid()),
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
      reached: fullyReached(),
      grids: makeGrids(openAttrGrid()),
      inventory: new Set([SWORD_4]),
      combat: undefined,
    });

    expect(threat.clearable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('gated-off');
  });
});

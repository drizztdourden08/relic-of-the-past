/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { evaluateRoomThreat } from '../../../shared/game/simulation/engine/enemy-reach';
import { describeDataset } from '../../dataset-guard';
import {
  ANCILLA_COUNT, ARROW_ANCILLA, BLOCKING_ATTR, BOOMERANG, BOW, DAMAGE_CLASS_COUNT, FIRE_ROD, FIRE_ROD_ANCILLA, SWORD_1,
} from './enemy-reach.constants';
import { grids } from './grids';
import { makeSprite } from './make-sprite';
import { makeTables } from './make-tables';

describeDataset('evaluateRoomThreat and the line of fire', () => {
  it('is blocked by a wall between the only standable tile and the target', () => {
    const enemy = { row: 10, col: 10 };
    const reached = grids.emptyReached();
    const onlyStandableTile = { row: 10, col: 6 };
    grids.stamp2x2(reached, onlyStandableTile);
    const attrGrid = grids.openAttr();
    attrGrid[10][8] = BLOCKING_ATTR;

    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached,
      grids: grids.bundle(attrGrid),
      inventory: new Set([BOW]),
      combat: {
        tables: makeTables({ ancillaDamageClass: (() => { const c = new Array(ANCILLA_COUNT).fill(0); c[ARROW_ANCILLA] = 5; return c; })() }),
        bySpriteType: { 1: { health: 4, flags4: 0, damageByClass: (() => { const d = new Array(DAMAGE_CLASS_COUNT).fill(0); d[5] = 2; return d; })() } },
      },
    });

    expect(threat.gating).toHaveLength(1);
    expect(threat.gating[0].killable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('no-line');
    expect(threat.clearable).toBe(false);
  });
});

describeDataset('evaluateRoomThreat on a zero damage class', () => {
  it('reads not killable when the only weapon on hand deals zero damage to this sprite', () => {
    const enemy = { row: 5, col: 5 };
    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached: grids.fullyReached(),
      grids: grids.bundle(grids.openAttr()),
      inventory: new Set([SWORD_1]),
      combat: {
        tables: makeTables(),
        bySpriteType: { 1: { health: 4, flags4: 0, damageByClass: new Array(DAMAGE_CLASS_COUNT).fill(0) } },
      },
    });

    expect(threat.gating[0].killable).toBe(false);
    expect(threat.gating[0].blockedBy).toBe('no-weapon');
    expect(threat.clearable).toBe(false);
  });

  it('does not treat the boomerang (damage class 0) as automatically harmless', () => {
    const enemy = { row: 5, col: 5 };
    const damageByClass = new Array(DAMAGE_CLASS_COUNT).fill(0);
    damageByClass[0] = 3;
    const ancillaDamageClass = new Array(ANCILLA_COUNT).fill(0);
    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached: grids.fullyReached(),
      grids: grids.bundle(grids.openAttr()),
      inventory: new Set([BOOMERANG]),
      combat: { tables: makeTables({ ancillaDamageClass }), bySpriteType: { 1: { health: 2, flags4: 0, damageByClass } } },
    });

    expect(threat.gating[0].killable).toBe(true);
    expect(threat.gating[0].by?.label).toBe('boomerang');
  });
});

describeDataset('evaluateRoomThreat with unbounded beam reach', () => {
  it('kills an enemy only reachable from far away with an unbounded weapon', () => {
    const enemy = { row: 15, col: 15 };
    const reached = grids.emptyReached();
    const outOfContactRange = { row: 15, col: 0 };
    grids.stamp2x2(reached, outOfContactRange);
    const ancillaDamageClass = new Array(ANCILLA_COUNT).fill(0);
    ancillaDamageClass[FIRE_ROD_ANCILLA] = 4;
    const damageByClass = new Array(DAMAGE_CLASS_COUNT).fill(0);
    damageByClass[4] = 1;

    const threat = evaluateRoomThreat({
      sprites: [makeSprite(enemy)],
      reached,
      grids: grids.bundle(grids.openAttr()),
      inventory: new Set([FIRE_ROD]),
      combat: { tables: makeTables({ ancillaDamageClass }), bySpriteType: { 1: { health: 1, flags4: 0, damageByClass } } },
    });

    expect(threat.gating[0].killable).toBe(true);
    expect(threat.gating[0].by?.kind).toBe('travelling');
    expect(threat.gating[0].by?.travel).toBe(Infinity);
    expect(threat.clearable).toBe(true);
  });
});

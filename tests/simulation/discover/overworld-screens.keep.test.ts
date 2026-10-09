/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { SimSprite, SimObservation } from '../../../shared/game/simulation/types';
import { createEngineState } from '../../../shared/game/simulation/engine/state';
import { discoverTargets } from '../../../shared/game/simulation/engine/discover';
import { emptySnapshot } from '../../../shared/game/simulation/detect/flag-snapshot';
import { describeDataset } from '../../dataset-guard';
import { HEAD_SCREEN, SOUTH_SCREEN } from './discover.constants';
import { allReachable } from './all-reachable';
import { baseObs } from './base-obs';
import { freshState } from './fresh-state';

const owSprite = (roomId: number, tile: { row: number; col: number }): SimSprite => ({
  roomId,
  outdoor: true,
  spriteType: 0x00,
  tile,
  posKnown: true,
  kind: 'overworld',
  itemId: 0x01,
});

const owObs = (owScreenIndex: number, sprites: SimSprite[]): SimObservation => ({
  ...baseObs(emptySnapshot()),
  virtual: { screenId: `ow:${owScreenIndex}`, tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: false, roomId: 0, owScreenIndex },
  interactables: { chests: [], sprites, doors: [] },
});

const owState = (owScreenIndex: number) =>
  createEngineState({ screenId: `ow:${owScreenIndex}`, tile: { row: 0, col: 0 } }, new Set(), {});

describeDataset('discoverTargets resolves overworld sprites to their true screen', () => {
  it('discovers a sprite normally when it belongs to the observed screen', () => {
    const obs = owObs(HEAD_SCREEN, [owSprite(HEAD_SCREEN, { row: 20, col: 12 })]);
    expect(discoverTargets(owState(HEAD_SCREEN), obs, allReachable(64, 64))).toHaveLength(1);
  });

  it('does not offer a sprite resolved to a neighbouring screen as a target for the observed one', () => {
    const obs = owObs(HEAD_SCREEN, [owSprite(SOUTH_SCREEN, { row: 20, col: 12 })]);
    expect(discoverTargets(owState(HEAD_SCREEN), obs, allReachable(64, 64))).toHaveLength(0);
  });

  it('offers that same sprite once its own screen is the one being observed', () => {
    const obs = owObs(SOUTH_SCREEN, [owSprite(SOUTH_SCREEN, { row: 20, col: 12 })]);
    expect(discoverTargets(owState(SOUTH_SCREEN), obs, allReachable(64, 64))).toHaveLength(1);
  });
});

describeDataset('discoverTargets falls back when posKnown === false', () => {
  it('discovers an unknown-position interactable regardless of a real, unrelated flood grid', () => {
    const farOutsideAnyGrid = { row: 999, col: 999 };
    const sprite: SimSprite = {
      roomId: 0x181,
      spriteType: 0x00,
      tile: farOutsideAnyGrid,
      posKnown: false,
      kind: 'standing',
      itemId: 0x01,
    };
    const obs: SimObservation = { ...baseObs(emptySnapshot()), interactables: { chests: [], sprites: [sprite], doors: [] } };
    expect(discoverTargets(freshState(), obs, allReachable(4, 4))).toHaveLength(1);
  });
});

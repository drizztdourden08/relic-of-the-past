/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all, getConnection } from '@rotp/game-data';

const ALL_CONNECTIONS = all('connection');

describe('connection pairing invariants', () => {
  it('pairing is mutual: the partner points back', { tags: ['standard'] }, () => {
    const broken = ALL_CONNECTIONS.filter(c => getConnection(c.toConnectionId).toConnectionId !== c.id);
    expect(broken.map(c => c.id)).toEqual([]);
  });

  it('at least one end of every pair can exit', { tags: ['standard'] }, () => {
    const dead = ALL_CONNECTIONS.filter(c => !c.canExit && !getConnection(c.toConnectionId).canExit);
    expect(dead.map(c => c.id)).toEqual([]);
  });

  it('every screen holding a point is reachable as more than a `to`', { tags: ['standard'] }, () => {
    const screensAsTo = new Set(ALL_CONNECTIONS.map(c => getConnection(c.toConnectionId).screenId));
    const screensAsOwn = new Set(ALL_CONNECTIONS.map(c => c.screenId));
    const onlyEverATo = [...screensAsTo].filter(id => !screensAsOwn.has(id));
    expect(onlyEverATo).toEqual([]);
  });
});

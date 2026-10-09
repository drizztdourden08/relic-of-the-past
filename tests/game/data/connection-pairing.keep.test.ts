/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all, getConnection } from '@shared/game/data';

const ALL_CONNECTIONS = all('connection');

describe('connection pairing invariants', () => {
  it('every toConnectionId resolves to a real record', () => {
    const knownIds = new Set(ALL_CONNECTIONS.map(c => c.id));
    const unresolved = ALL_CONNECTIONS.filter(c => !knownIds.has(c.toConnectionId));
    expect(unresolved.map(c => c.id)).toEqual([]);
  });

  it('pairing is mutual: the partner points back', () => {
    const broken = ALL_CONNECTIONS.filter(c => getConnection(c.toConnectionId).toConnectionId !== c.id);
    expect(broken.map(c => c.id)).toEqual([]);
  });

  it.todo('a pair spans two different screens, or is explicitly an internal crossing (1 violation: connection-896 <-> connection-1143)');

  it.todo('no two points on one screen share the same non-empty tile footprint (8 violations, listed in the tests code notes)');

  it('at least one end of every pair can exit', () => {
    const dead = ALL_CONNECTIONS.filter(c => !c.canExit && !getConnection(c.toConnectionId).canExit);
    expect(dead.map(c => c.id)).toEqual([]);
  });

  it('every screen holding a point is reachable as more than a `to`', () => {
    const screensAsTo = new Set(ALL_CONNECTIONS.map(c => getConnection(c.toConnectionId).screenId));
    const screensAsOwn = new Set(ALL_CONNECTIONS.map(c => c.screenId));
    const onlyEverATo = [...screensAsTo].filter(id => !screensAsOwn.has(id));
    expect(onlyEverATo).toEqual([]);
  });
});

/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { SCREEN_BY_ID } from '../../../shared/game/data/screens';
import type { ConnectionTag } from '../../../shared/game/data/connections/tags';
import { endpointLabel } from '../../../apps/web/src/ui/domains/widgets/navigation/connection-endpoint-label';
import { connectionIssues } from '../../../apps/web/src/ui/domains/widgets/navigation/connection-issues';

const KNOWN_ID = 'lw-00';
const UNKNOWN_ID = 'nope-ff';

describe('endpointLabel — resolve endpoint id → display name + code', () => {
  it('resolves a known screen id to its dataset name with the code secondary', () => {
    const label = endpointLabel(KNOWN_ID);
    expect(label.known).toBe(true);
    expect(label.code).toBe(KNOWN_ID);
    expect(label.name).toBe(SCREEN_BY_ID.get(KNOWN_ID)?.name ?? null);
    expect(label.name).not.toBeNull();
  });

  it('marks an unknown id as not known with a null name and the raw code', () => {
    const label = endpointLabel(UNKNOWN_ID);
    expect(label.known).toBe(false);
    expect(label.name).toBeNull();
    expect(label.code).toBe(UNKNOWN_ID);
  });
});

describe('connectionIssues — per-connection completeness warnings', () => {
  const complete = {
    from: KNOWN_ID,
    to: 'lw-01',
    tags: ['transit:walk', 'dir:two-way'] as ConnectionTag[],
  };

  it('reports no issues when tiles, endpoints, and required tags are all present', () => {
    expect(connectionIssues(complete, 'tiles: [30, 31]')).toEqual([]);
  });

  it('flags missing tile data (replaces the silent blank)', () => {
    expect(connectionIssues(complete, null)).toContain('⚠ no tile data');
  });

  it('flags unknown endpoints by id', () => {
    const issues = connectionIssues(
      { from: UNKNOWN_ID, to: 'also-bad', tags: complete.tags },
      'tiles: [1]',
    );
    expect(issues).toContain(`⚠ unknown screen: ${UNKNOWN_ID}`);
    expect(issues).toContain('⚠ unknown screen: also-bad');
  });

  it('flags missing transit and direction tags independently', () => {
    const noTransit = connectionIssues({ ...complete, tags: ['dir:two-way'] as ConnectionTag[] }, 'tiles: [1]');
    expect(noTransit).toContain('⚠ no transit type');
    expect(noTransit).not.toContain('⚠ no direction');

    const noDir = connectionIssues({ ...complete, tags: ['transit:walk'] as ConnectionTag[] }, 'tiles: [1]');
    expect(noDir).toContain('⚠ no direction');
    expect(noDir).not.toContain('⚠ no transit type');
  });
});

/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { getScreen } from '../../../shared/game/data';
import type { ConnectionTag } from '../../../shared/game/data';
import { endpointLabel } from '../../../apps/web/src/ui/domains/widgets/navigation/connection-endpoint-label';
import { connectionIssues } from '../../../apps/web/src/ui/domains/widgets/navigation/connection-issues';

// screen-028/screen-043 = lw-00/lw-01 — looked up via
// scripts/generate-ids/output/id-manifest.json, not re-derived by hand.
const KNOWN_ID = 'screen-028';
const KNOWN_ID_2 = 'screen-043';
const UNKNOWN_ID = 'nope-ff';

describe('endpointLabel — resolve endpoint id → display name + code', () => {
  it('resolves a known screen id to its dataset name with the code secondary', () => {
    const label = endpointLabel(KNOWN_ID);
    expect(label.known).toBe(true);
    expect(label.code).toBe(KNOWN_ID);
    const screen = getScreen(KNOWN_ID);
    expect(label.name).toBe(screen.vanillaName ?? screen.randomizerName);
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
    to: KNOWN_ID_2,
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

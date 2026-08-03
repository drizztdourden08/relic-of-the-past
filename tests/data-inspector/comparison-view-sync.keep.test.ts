/* @layer tests @kind test */
/**
 * The two things that keep the comparison panes reading as ONE view: the same
 * open tab, and the same scroll offset.
 *
 * The tab needs no mechanism at all — `DetailTabs` is fully controlled, so
 * handing both panes the same `{tab, onTabChange}` pair is the whole
 * implementation, and the SSR pass below is what proves the pair actually
 * reaches both sides (there is no jsdom in this repo, so a render is static).
 *
 * The scroll does need one, and it is the shape `ScrollArea`'s guard was built
 * for (see tests/design-system/scroll-area-sync.test.ts): the side the user
 * scrolled leads and is driven by nothing, the other follows, and the
 * follower's programmatic scroll is swallowed rather than coming back as a
 * second user scroll. The pair of real controllers below is wired exactly as
 * the two `ScrollArea`s are, with `followerScrollTo` deciding which side gets
 * driven — so what is under test is the actual rule the hook applies.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createScrollSyncController } from '@ds/primitives/ScrollArea/behavior/create-scroll-sync-controller';
import { followerScrollTo } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/use-comparison-scroll';
import type { Lead, PaneSide } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/use-comparison-scroll';
import type * as DetailModule from '@app/ui/domains/app/views/DataInspector/sub-components/recommendations/RecommendationDetail';
import type { Recommendation } from '@shared/game/recommendations';

interface Position { top: number; left: number }

interface FakeNode {
  scrollTop: number;
  scrollLeft: number;
  scrollToCalls: number;
  scrollTo: (options: { top?: number; left?: number }) => void;
}

const createFakeNode = (): FakeNode => {
  const node: FakeNode = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollToCalls: 0,
    scrollTo: (options) => {
      node.scrollToCalls += 1;
      if (typeof options.top === 'number') node.scrollTop = options.top;
      if (typeof options.left === 'number') node.scrollLeft = options.left;
    },
  };
  return node;
};

describe('followerScrollTo — only the follower is driven', () => {
  const lead: Lead = { side: 'current', position: { top: 120, left: 0 } };

  it('gives the other side the leader\'s offset', () => {
    expect(followerScrollTo(lead, 'proposed')).toEqual({ top: 120, left: 0 });
  });

  it('gives the leader nothing at all — it is already there', () => {
    expect(followerScrollTo(lead, 'current')).toBeUndefined();
  });

  it('drives neither side before anybody has scrolled', () => {
    expect(followerScrollTo(null, 'current')).toBeUndefined();
    expect(followerScrollTo(null, 'proposed')).toBeUndefined();
  });
});

describe('the pane pair, wired as the component wires it', () => {
  /**
   * Two real controllers, one per pane, plus the leader/follower rule between
   * them. `fireNativeScroll` stands in for the browser's own event, firing only
   * when a `scrollTo()` actually moved the node — exactly as a real one would.
   */
  const buildPanes = () => {
    const nodes: Record<PaneSide, FakeNode> = { current: createFakeNode(), proposed: createFakeNode() };
    const controllers = {
      current: createScrollSyncController(() => nodes.current),
      proposed: createScrollSyncController(() => nodes.proposed),
    };
    const other = (side: PaneSide): PaneSide => (side === 'current' ? 'proposed' : 'current');

    const onScroll = (side: PaneSide) => (position: Position): void => {
      const lead: Lead = { side, position };
      for (const target of ['current', 'proposed'] as const) {
        const to = followerScrollTo(lead, target);
        if (!to) continue;
        const before = nodes[target].scrollToCalls;
        controllers[target].applyScrollTo(to);
        if (nodes[target].scrollToCalls > before) {
          controllers[target].handleScroll(
            { top: nodes[target].scrollTop, left: nodes[target].scrollLeft },
            onScroll(target),
          );
        }
      }
    };

    return { nodes, controllers, other, onScroll };
  };

  it('carries a scroll on one pane to the other, exactly once', () => {
    const { nodes, controllers, onScroll } = buildPanes();
    nodes.current.scrollTop = 240;
    controllers.current.handleScroll({ top: 240, left: 0 }, onScroll('current'));

    expect(nodes.proposed.scrollTop).toBe(240);
    expect(nodes.proposed.scrollToCalls).toBe(1);
    expect(nodes.current.scrollToCalls).toBe(0);
  });

  it('never bounces back, however many times the leader changes', () => {
    const { nodes, controllers, onScroll } = buildPanes();

    nodes.current.scrollTop = 40;
    controllers.current.handleScroll({ top: 40, left: 0 }, onScroll('current'));
    nodes.proposed.scrollTop = 90;
    controllers.proposed.handleScroll({ top: 90, left: 0 }, onScroll('proposed'));
    nodes.current.scrollTop = 300;
    controllers.current.handleScroll({ top: 300, left: 0 }, onScroll('current'));

    expect(nodes.current.scrollTop).toBe(300);
    expect(nodes.proposed.scrollTop).toBe(300);
    // One programmatic move per real scroll, on the follower only.
    expect(nodes.current.scrollToCalls + nodes.proposed.scrollToCalls).toBe(3);
  });

  it('does nothing when the panes are already level', () => {
    const { nodes, controllers, onScroll } = buildPanes();
    controllers.current.handleScroll({ top: 0, left: 0 }, onScroll('current'));
    expect(nodes.proposed.scrollToCalls).toBe(0);
  });
});

describe('the two panes share one tab', () => {
  let RecommendationDetail: typeof DetailModule.RecommendationDetail;

  const entry: Recommendation = {
    id: 'r-1',
    kind: 'tag',
    action: 'update',
    targetId: 'tag-001',
    current: { id: 'tag-001', name: 'area:cave' },
    proposed: { id: 'tag-001', name: 'area:cavern' },
    reason: 'the vocabulary spells it differently',
    detector: 'test',
    evidence: [{ source: 'test', detail: 'seen' }],
    confidence: 'certain',
    screenId: null,
    origin: 'live',
    state: 'open',
    firstSeenAt: 1,
    decidedAt: null,
  } as Recommendation;

  beforeEach(async () => {
    vi.resetModules();
    // The view-state binding reaches lib/storage -> log-bus, which touches
    // window at module load, so the stub has to precede the import.
    vi.stubGlobal('window', {
      api: {
        uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) },
        loadReview: vi.fn().mockResolvedValue({}),
        saveReview: vi.fn().mockResolvedValue(undefined),
        loadRecommendations: vi.fn().mockResolvedValue([]),
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    });
    ({ RecommendationDetail } = await import(
      '@app/ui/domains/app/views/DataInspector/sub-components/recommendations/RecommendationDetail'
    ));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const render = (tab: 'json' | 'ts' | 'editor'): string => renderToStaticMarkup(createElement(
    RecommendationDetail,
    { entries: [entry], selectedId: 'r-1', onSelect: () => {}, tab, onTabChange: () => {} },
  ));

  it('renders both sides, each with its own record', () => {
    const html = render('json');
    expect(html).toContain('Current');
    expect(html).toContain('Proposed');
    expect(html).toContain('area:cave');
    expect(html).toContain('area:cavern');
  });

  it('opens the same tab on both sides, on every tab', () => {
    for (const tab of ['json', 'ts', 'editor'] as const) {
      const html = render(tab);
      const active = html.split('tab-bar__tab--active').length - 1;
      expect(active, tab).toBe(2);
    }
  });

  it('marks the changed line in both code tabs', () => {
    for (const tab of ['json', 'ts'] as const) {
      expect(render(tab), tab).toContain('code-block__line--changed');
    }
  });

  it('marks the changed field in the editor tab too', () => {
    expect(render('editor')).toContain('record-editor__row--changed');
  });
});

/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { createScrollSyncController } from '@drizztdourden08/tessera/primitives';
import { followerScrollTo } from '@app/data-inspector/recommendations/use-comparison-scroll';
import type { Lead, PaneSide } from '@app/data-inspector/recommendations/use-comparison-scroll';
import { describeDataset } from '../dataset-guard';

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

describeDataset('followerScrollTo drives only the follower', { tags: ['critical'] }, () => {
  const lead: Lead = { side: 'current', position: { top: 120, left: 0 } };

  it('gives the other side the leader\'s offset', () => {
    expect(followerScrollTo(lead, 'proposed')).toEqual({ top: 120, left: 0 });
  });

  it('gives the leader nothing at all because it is already there', () => {
    expect(followerScrollTo(lead, 'current')).toBeUndefined();
  });

  it('drives neither side before anybody has scrolled', () => {
    expect(followerScrollTo(null, 'current')).toBeUndefined();
    expect(followerScrollTo(null, 'proposed')).toBeUndefined();
  });
});

describeDataset('the pane pair, wired as the component wires it', { tags: ['critical'] }, () => {
  const buildPanes = () => {
    const nodes: Record<PaneSide, FakeNode> = { current: createFakeNode(), proposed: createFakeNode() };
    const controllers = {
      current: createScrollSyncController(() => nodes.current),
      proposed: createScrollSyncController(() => nodes.proposed),
    };

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

    return { nodes, controllers, onScroll };
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
    expect(nodes.current.scrollToCalls + nodes.proposed.scrollToCalls).toBe(3);
  });
});

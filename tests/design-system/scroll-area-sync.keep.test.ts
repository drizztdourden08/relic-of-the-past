/* @layer tests @kind test */
/**
 * ScrollArea's sync lives in behavior/create-scroll-sync-controller.ts (and
 * create-scroll-guard.ts) so it can be driven without a DOM. A fake node
 * stands in for the element; `fireNativeScroll` fires only when `scrollTo()`
 * changed the offset, as a browser would.
 */
import { describe, it, expect } from 'vitest';
import { createScrollGuard } from '../../apps/web/src/ui/design-system/primitives/ScrollArea/behavior/create-scroll-guard';
import { createScrollSyncController } from '../../apps/web/src/ui/design-system/primitives/ScrollArea/behavior/create-scroll-sync-controller';
import { setNodeOnRef } from '../../apps/web/src/ui/design-system/primitives/ScrollArea/behavior/set-node-on-ref';

interface Position { top: number; left: number; }

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

describe('createScrollGuard swallows exactly the programmatic echo', () => {
  it('does not suppress when nothing is pending', () => {
    const guard = createScrollGuard();
    expect(guard.shouldSuppress({ top: 5, left: 0 })).toBe(false);
  });

  it('suppresses every event up to and including the one that reaches the target', () => {
    const guard = createScrollGuard();
    guard.markProgrammatic({ top: 100, left: 0 });
    // A smooth scroll can fire several intermediate events before arrival, so
    // the guard has to survive all of them, not just the first.
    expect(guard.shouldSuppress({ top: 40, left: 0 })).toBe(true);
    expect(guard.shouldSuppress({ top: 80, left: 0 })).toBe(true);
    expect(guard.shouldSuppress({ top: 100, left: 0 })).toBe(true); // arrival, and still the echo
    expect(guard.shouldSuppress({ top: 130, left: 0 })).toBe(false); // a real scroll, after
  });

  it('re-arms for a second programmatic scroll once the first has settled', () => {
    const guard = createScrollGuard();
    guard.markProgrammatic({ top: 50, left: 0 });
    expect(guard.shouldSuppress({ top: 50, left: 0 })).toBe(true);
    expect(guard.shouldSuppress({ top: 60, left: 0 })).toBe(false);
    guard.markProgrammatic({ top: 200, left: 0 });
    expect(guard.shouldSuppress({ top: 200, left: 0 })).toBe(true);
  });
});

describe('setNodeOnRef', () => {
  it('calls a callback ref with the node', () => {
    const calls: (string | null)[] = [];
    setNodeOnRef((node: string | null) => calls.push(node), 'div-node');
    expect(calls).toEqual(['div-node']);
  });

  it('writes onto an object ref', () => {
    const ref = { current: null as string | null };
    setNodeOnRef(ref, 'div-node');
    expect(ref.current).toBe('div-node');
  });

  it('is a no-op with no ref at all', () => {
    expect(() => setNodeOnRef(null, 'div-node')).not.toThrow();
    expect(() => setNodeOnRef(undefined, 'div-node')).not.toThrow();
  });
});

describe('createScrollSyncController wires two ScrollAreas to mirror each other', () => {
  // Each side is one ScrollArea: its own node and controller, wired as
  // ScrollArea.tsx wires them. Without the guard this recurses forever.
  const buildMirroredPair = () => {
    const nodeA = createFakeNode();
    const nodeB = createFakeNode();
    const controllerA = createScrollSyncController(() => nodeA);
    const controllerB = createScrollSyncController(() => nodeB);

    const fireNativeScroll = (
      node: FakeNode,
      controller: ReturnType<typeof createScrollSyncController>,
      onScroll: (position: Position) => void,
    ): void => controller.handleScroll({ top: node.scrollTop, left: node.scrollLeft }, onScroll);

    const onScrollA = (position: Position): void => {
      const before = nodeB.scrollToCalls;
      controllerB.applyScrollTo(position);
      if (nodeB.scrollToCalls > before) fireNativeScroll(nodeB, controllerB, onScrollB);
    };
    const onScrollB = (position: Position): void => {
      const before = nodeA.scrollToCalls;
      controllerA.applyScrollTo(position);
      if (nodeA.scrollToCalls > before) fireNativeScroll(nodeA, controllerA, onScrollA);
    };

    return { nodeA, nodeB, controllerA, onScrollA };
  };

  it('propagates a real scroll on one side to the other exactly once, with no bounce back', () => {
    const { nodeA, nodeB, controllerA, onScrollA } = buildMirroredPair();

    nodeA.scrollTop = 120; // the user scrolled A
    controllerA.handleScroll({ top: 120, left: 0 }, onScrollA);

    expect(nodeB.scrollTop).toBe(120);
    expect(nodeB.scrollToCalls).toBe(1);
    expect(nodeA.scrollToCalls).toBe(0);
  });

  it('does not ping-pong when both sides are already in sync', () => {
    const { nodeA, nodeB, controllerA, onScrollA } = buildMirroredPair();

    controllerA.handleScroll({ top: 0, left: 0 }, onScrollA);

    expect(nodeA.scrollToCalls).toBe(0);
    expect(nodeB.scrollToCalls).toBe(0);
  });

  it('settles after one hop per scroll, even across several successive user scrolls', () => {
    const { nodeA, nodeB, controllerA, onScrollA } = buildMirroredPair();

    for (const top of [10, 50, 200]) {
      nodeA.scrollTop = top;
      controllerA.handleScroll({ top, left: 0 }, onScrollA);
    }

    expect(nodeB.scrollTop).toBe(200);
    expect(nodeB.scrollToCalls).toBe(3);
    expect(nodeA.scrollToCalls).toBe(0); // never once bounced back to A
  });
});

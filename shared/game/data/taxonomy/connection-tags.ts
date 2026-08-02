/* @layer shared-game @kind data */
/** Connection tag taxonomy — ported from data/connections/tags.ts verbatim. */

type TransitTag =
  | 'transit:door' | 'transit:hole' | 'transit:ledge' | 'transit:stairs'
  | 'transit:warp' | 'transit:mirror' | 'transit:waterfall' | 'transit:walk'
  | 'transit:swim' | 'transit:grave' | 'transit:bomb' | 'transit:bonk'
  | 'transit:rock' | 'transit:push' | 'transit:hookshot';

type BarrierTag =
  | 'barrier:none' | 'barrier:small-key' | 'barrier:big-key' | 'barrier:bomb'
  | 'barrier:gloves' | 'barrier:hammer' | 'barrier:dark' | 'barrier:medallion'
  | 'barrier:crystals' | 'barrier:event' | 'barrier:dash' | 'barrier:hookshot'
  | 'barrier:swim' | 'barrier:fire' | 'barrier:book' | 'barrier:glitch';

type DirectionTag = 'dir:one-way' | 'dir:two-way';

type ContextTag =
  | 'ctx:entrance' | 'ctx:exit' | 'ctx:internal' | 'ctx:cross-world'
  | 'ctx:save-quit' | 'ctx:boss' | 'ctx:overworld' | 'ctx:dungeon-enter' | 'ctx:shortcut';

type ConnectionTag = TransitTag | BarrierTag | DirectionTag | ContextTag;

type ConnectionTagNamespace = 'transit' | 'barrier' | 'dir' | 'ctx';

interface ConnectionTagMetadata {
  id: ConnectionTag;
  label: string;
  namespace: ConnectionTagNamespace;
}

const CONNECTION_TAG_NAMESPACES: { id: ConnectionTagNamespace; label: string }[] = [
  { id: 'transit', label: 'Transit' },
  { id: 'barrier', label: 'Barrier' },
  { id: 'dir', label: 'Direction' },
  { id: 'ctx', label: 'Context' },
];

const CONNECTION_TAG_METADATA: ConnectionTagMetadata[] = [
  { id: 'transit:door', label: 'Door', namespace: 'transit' },
  { id: 'transit:hole', label: 'Hole / Drop-in', namespace: 'transit' },
  { id: 'transit:ledge', label: 'Ledge Drop', namespace: 'transit' },
  { id: 'transit:stairs', label: 'Stairs', namespace: 'transit' },
  { id: 'transit:warp', label: 'Warp / Teleporter', namespace: 'transit' },
  { id: 'transit:mirror', label: 'Magic Mirror', namespace: 'transit' },
  { id: 'transit:waterfall', label: 'Waterfall', namespace: 'transit' },
  { id: 'transit:walk', label: 'Walk', namespace: 'transit' },
  { id: 'transit:swim', label: 'Swim', namespace: 'transit' },
  { id: 'transit:grave', label: 'Grave Push', namespace: 'transit' },
  { id: 'transit:bomb', label: 'Bomb Wall', namespace: 'transit' },
  { id: 'transit:bonk', label: 'Bonk / Dash', namespace: 'transit' },
  { id: 'transit:rock', label: 'Rock Lift', namespace: 'transit' },
  { id: 'transit:push', label: 'Push Block', namespace: 'transit' },
  { id: 'transit:hookshot', label: 'Hookshot', namespace: 'transit' },
  { id: 'barrier:none', label: 'No Barrier', namespace: 'barrier' },
  { id: 'barrier:small-key', label: 'Small Key', namespace: 'barrier' },
  { id: 'barrier:big-key', label: 'Big Key', namespace: 'barrier' },
  { id: 'barrier:bomb', label: 'Bomb', namespace: 'barrier' },
  { id: 'barrier:gloves', label: 'Gloves', namespace: 'barrier' },
  { id: 'barrier:hammer', label: 'Hammer', namespace: 'barrier' },
  { id: 'barrier:dark', label: 'Dark Room', namespace: 'barrier' },
  { id: 'barrier:medallion', label: 'Medallion', namespace: 'barrier' },
  { id: 'barrier:crystals', label: 'Crystals', namespace: 'barrier' },
  { id: 'barrier:event', label: 'Event', namespace: 'barrier' },
  { id: 'barrier:dash', label: 'Dash / Boots', namespace: 'barrier' },
  { id: 'barrier:hookshot', label: 'Hookshot', namespace: 'barrier' },
  { id: 'barrier:swim', label: 'Swim / Flippers', namespace: 'barrier' },
  { id: 'barrier:fire', label: 'Fire Source', namespace: 'barrier' },
  { id: 'barrier:book', label: 'Book of Mudora', namespace: 'barrier' },
  { id: 'barrier:glitch', label: 'Glitch', namespace: 'barrier' },
  { id: 'dir:one-way', label: 'One-Way', namespace: 'dir' },
  { id: 'dir:two-way', label: 'Two-Way', namespace: 'dir' },
  { id: 'ctx:entrance', label: 'Entrance', namespace: 'ctx' },
  { id: 'ctx:exit', label: 'Exit', namespace: 'ctx' },
  { id: 'ctx:internal', label: 'Internal', namespace: 'ctx' },
  { id: 'ctx:cross-world', label: 'Cross-World', namespace: 'ctx' },
  { id: 'ctx:save-quit', label: 'Save & Quit', namespace: 'ctx' },
  { id: 'ctx:boss', label: 'Boss Door', namespace: 'ctx' },
  { id: 'ctx:overworld', label: 'Overworld', namespace: 'ctx' },
  { id: 'ctx:dungeon-enter', label: 'Dungeon Entrance', namespace: 'ctx' },
  { id: 'ctx:shortcut', label: 'Shortcut', namespace: 'ctx' },
];

export { CONNECTION_TAG_METADATA, CONNECTION_TAG_NAMESPACES };
export type {
  BarrierTag, ConnectionTag, ConnectionTagMetadata, ConnectionTagNamespace,
  ContextTag, DirectionTag, TransitTag,
};

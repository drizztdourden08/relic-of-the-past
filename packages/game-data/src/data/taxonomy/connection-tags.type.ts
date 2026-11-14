/* @layer shared-game @kind types */

type TransitTag =
  | 'transit:door' | 'transit:hole' | 'transit:ledge' | 'transit:stairs' | 'transit:warp'
  | 'transit:mirror' | 'transit:waterfall' | 'transit:walk' | 'transit:swim' | 'transit:grave'
  | 'transit:bomb' | 'transit:bonk' | 'transit:rock' | 'transit:push' | 'transit:hookshot';

type BarrierTag =
  | 'barrier:none' | 'barrier:small-key' | 'barrier:big-key' | 'barrier:bomb'
  | 'barrier:gloves' | 'barrier:hammer' | 'barrier:dark' | 'barrier:medallion'
  | 'barrier:crystals' | 'barrier:event' | 'barrier:dash' | 'barrier:hookshot'
  | 'barrier:swim' | 'barrier:fire' | 'barrier:book' | 'barrier:glitch';

type ContextTag =
  | 'ctx:entrance' | 'ctx:exit' | 'ctx:internal' | 'ctx:cross-world' | 'ctx:save-quit'
  | 'ctx:boss' | 'ctx:overworld' | 'ctx:dungeon-enter' | 'ctx:shortcut';

type ConnectionTag = TransitTag | BarrierTag | ContextTag;

type ConnectionTagNamespace = 'transit' | 'barrier' | 'ctx';

interface ConnectionTagMetadata {
  id: ConnectionTag;
  label: string;
  namespace: ConnectionTagNamespace;
}

export type {
  BarrierTag, ConnectionTag, ConnectionTagMetadata, ConnectionTagNamespace, ContextTag, TransitTag,
};

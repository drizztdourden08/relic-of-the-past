/* @layer renderer-components @kind types */
import type { InspectorContext } from '@app/hud-layout-editing/inspector-sections';
import type { HudLayout, HudNode } from '@rotp/hud';
import type { InspectorSectionKey, NodeInspectorProps } from './NodeInspector.type';

interface InspectorSectionsProps {
  node: HudNode;
  doc: HudLayout;
  context: InspectorContext;
  isOpen: (key: InspectorSectionKey) => boolean;
  onToggle: (key: InspectorSectionKey) => void;
  inspector: Pick<NodeInspectorProps, 'onPatch' | 'onDrop' | 'scope' | 'glyphPacks' | 'selectedId' | 'onSelectNode'>;
}

export type { InspectorSectionsProps };

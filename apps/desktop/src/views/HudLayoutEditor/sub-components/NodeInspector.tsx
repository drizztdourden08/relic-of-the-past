/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { inspectorContextOf } from '@app/hud-layout-editing/inspector-sections';
import { labelOf } from '@app/hud-layout-editing/new-node';
import { FormulaScopeContext } from '@app/hud-layout-editing/formula-scope';
import { InspectorEmpty } from './InspectorEmpty';
import { InspectorSections } from './InspectorSections';
import { useSectionOpen } from '@app/hud-layout-editing/useSectionOpen';
import type { NodeInspectorProps } from './NodeInspector.type';

const NodeInspector = (props: NodeInspectorProps) => {
  const {
    node, doc, onPatch, onDrop, scope, glyphPacks, selectedId, onSelectNode, reflowWarnings,
  } = props;
  const { isOpen, toggle } = useSectionOpen(node);

  if (!node || !doc) return <InspectorEmpty />;

  const context = inspectorContextOf(doc, node, scope, reflowWarnings);

  return (
    <FormulaScopeContext.Provider value={context.instances}>
      <Box className="hud-inspect">
        <Box className="hud-inspect__head">
          <Text className="hud-inspect__name">{labelOf(node)}</Text>
          <Text className="hud-inspect__id">{node.id}</Text>
        </Box>
        <InspectorSections
          node={node}
          doc={doc}
          context={context}
          isOpen={isOpen}
          onToggle={toggle}
          inspector={{ onPatch, onDrop, scope, glyphPacks, selectedId, onSelectNode }}
        />
      </Box>
    </FormulaScopeContext.Provider>
  );
};

export { NodeInspector };

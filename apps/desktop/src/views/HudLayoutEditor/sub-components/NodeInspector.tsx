/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { boundCountsBySection } from '@app/hud-layout-editing/bound-values';
import { labelOf } from '@app/hud-layout-editing/new-node';
import { breadcrumbOf, enclosingRepeatOf, isInsideRepeat, realParentOf } from '@app/hud-layout-editing/tree-context';
import { FormulaScopeContext, instanceScopes } from '@app/hud-layout-editing/formula-scope';
import { walkNodes } from '@app/hud-layout-editing/node-edits';
import { MotionSection } from './MotionSection';
import { AppearanceSection } from './AppearanceSection';
import { ContentSection } from './ContentSection';
import { DataSection } from './DataSection';
import { IdentitySection } from './IdentitySection';
import { LayoutSection } from './LayoutSection';
import { PlacementSection } from './PlacementSection';
import { SizeBoxSection } from './SizeBoxSection';
import { SectionAccordion } from './SectionAccordion';
import { MAX_OPEN } from './NodeInspector.constants';
import type { ReactNode } from 'react';
import type { HudElement, HudNode } from '@rotp/hud';
import type { InspectorSectionKey as SectionKey, NodeInspectorProps } from './NodeInspector.type';

const NodeInspector = (props: NodeInspectorProps) => {
  const {
    node, doc, onPatch, onDrop, scope, glyphPacks, selectedId, onSelectNode, reflowWarnings,
  } = props;
  const [open, setOpen] = useState<SectionKey[]>(['identity', 'content']);

  useEffect(() => {
    setOpen(node?.kind === 'container' ? ['identity', 'layout'] : ['identity', 'content']);
  }, [node?.id]);

  if (!node || !doc) {
    return (
      <Box className="hud-inspect">
        <Text className="hud-editor__label">Inspector</Text>
        <Text className="hud-editor__hint">
          Select a node in the outline or on the stage. An insert lands in the selected
          container, or beside the selected element.
        </Text>
      </Box>
    );
  }

  const toggle = (key: SectionKey): void => setOpen((prev) => {
    if (prev.includes(key)) return prev.filter((k) => k !== key);
    const next = [...prev, key];
    return next.length > MAX_OPEN ? next.slice(next.length - MAX_OPEN) : next;
  });

  const isScreen = doc.screen?.id === node.id;
  const otherIds = walkNodes(doc).map((site) => site.node.id).filter((id) => id !== node.id);
  const parent = realParentOf(doc, node.id);
  const insideRepeat = isInsideRepeat(doc, node.id);
  const instances = instanceScopes(enclosingRepeatOf(doc, node.id), scope);
  const counts = boundCountsBySection(node);
  const warnings = reflowWarnings.filter((w) => w.startsWith(`${node.id}:`));
  const isOpen = (key: SectionKey): boolean => open.includes(key);
  const section = (key: SectionKey, title: string, boundCount: number | undefined, body: ReactNode) => (
    <SectionAccordion title={title} open={isOpen(key)} onToggle={() => toggle(key)} boundCount={boundCount}>
      {body}
    </SectionAccordion>
  );

  return (
    <FormulaScopeContext.Provider value={instances}>
    <Box className="hud-inspect">
      <Text className="hud-editor__label">Inspector</Text>
      <Box className="hud-inspect__head">
        <Text className="hud-inspect__name">{labelOf(node)}</Text>
        <Text className="hud-inspect__id">{node.id}</Text>
      </Box>

      {section('identity', 'Identity', undefined, (
        <IdentitySection
          node={node}
          breadcrumb={breadcrumbOf(doc, node.id)}
          otherIds={otherIds}
          onPatch={onPatch}
        />
      ))}
      {!isScreen && section('placement', 'Position & placement', undefined, (
        <PlacementSection
          node={node}
          parent={parent}
          onSelectNode={onSelectNode}
          onPatch={onPatch}
        />
      ))}
      {node.kind === 'container' && section('layout', 'Layout', counts.layout, (
        <LayoutSection
          node={node}
          onPatch={(patch) => onPatch(patch)}
          onDrop={onDrop}
          scope={scope}
          insideRepeat={insideRepeat}
        />
      ))}
      {section('sizeBox', 'Size & Box', counts.sizeBox, <SizeBoxSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} isScreen={isScreen} />)}
      {section('appearance', 'Appearance', counts.appearance, <AppearanceSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />)}
      {node.kind === 'element' && section('content', 'Content', counts.content, (
        <ContentSection
          node={node}
          onPatch={(patch) => onPatch(patch)}
          scope={scope}
          insideRepeat={insideRepeat}
          glyphPacks={glyphPacks}
          selectedId={selectedId}
          onSelectNode={onSelectNode}
        />
      ))}
      {section('data', 'Data', undefined, <DataSection node={node} scope={scope} />)}
      {section('motion', 'Motion', (counts.animation ?? 0) + (counts.transitions ?? 0) || undefined, (
        <MotionSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} warnings={warnings} />
      ))}
    </Box>
    </FormulaScopeContext.Provider>
  );
};

export { NodeInspector };
export type { NodeInspectorProps } from './NodeInspector.type';

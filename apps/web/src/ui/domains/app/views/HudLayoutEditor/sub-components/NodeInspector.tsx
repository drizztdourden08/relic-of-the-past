/* @layer renderer-components @kind component */
/**
 * The selected node's properties, in EIGHT collapsible sections, in order:
 * Identity, Placement, Layout, Size & Box, Appearance, Content, Data,
 * Motion (`plans/hud-data-binding.html`, "The property panel"). Only what
 * applies to the selected node renders at all (Layout only for a container,
 * Content only for an element), and each collapsed header carries a `● n`
 * bound-count badge so the panel stays scannable without opening anything.
 *
 * NINE BECAME EIGHT IN PHASE 10: Animation and Transitions were "two sections
 * for one idea", and Motion is the one section, with three subsections of its
 * own. Its badge is the two old counts added together, so a node that was
 * showing `● 1` under each still reads `● 2` here instead of losing one.
 *
 * ONLY A FEW SECTIONS OPEN AT ONCE: opening a new one closes the oldest past
 * `MAX_OPEN`, which is the whole reason eight sections fit in 232px. Selecting
 * a different node resets to a sensible default pair instead of carrying
 * over whatever was open for the last one.
 */
import { useEffect, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { boundCountsBySection } from '../behavior/bound-values';
import { labelOf } from '../behavior/new-node';
import { breadcrumbOf, enclosingRepeatOf, isInsideRepeat, realParentOf } from '../behavior/tree-context';
import { FormulaScopeContext, instanceScopes } from '../behavior/formula-scope';
import { walkNodes } from '../behavior/node-edits';
import { MotionSection } from './sections/MotionSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { ContentSection } from './sections/ContentSection';
import { DataSection } from './sections/DataSection';
import { IdentitySection } from './sections/IdentitySection';
import { LayoutSection } from './sections/LayoutSection';
import type { DropIntent } from '../behavior/drop-intent';
import { PlacementSection } from './sections/PlacementSection';
import { SizeBoxSection } from './sections/SizeBoxSection';
import { SectionAccordion } from './SectionAccordion';
import type { ReactNode } from 'react';
import type { GlyphPack, HudElement, HudLayout, HudNode } from '@shared/types/hud';

interface NodeInspectorProps {
  node: HudNode | null;
  doc: HudLayout | null;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  /** THE EDITOR'S ONE REORDER DOOR (§58). Layout's flex manipulation strip moves
   *  a child among its siblings, and `applyDrop` is the only module in this
   *  editor allowed to call `moveNode`, so the intent travels up instead of
   *  the tree being written down here. */
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
  /** `validate-motion-warnings.ts`'s own reflow warnings for the WHOLE
   *  document, filtered here to the ones naming this node. */
  reflowWarnings: readonly string[];
  /** A region's anchor is not a property of any node, so it cannot travel
   *  through `onPatch`. Placement edits it through this instead (phase 5). */
}

type SectionKey = 'identity' | 'placement' | 'layout' | 'sizeBox' | 'appearance' | 'content' | 'data' | 'motion';

const MAX_OPEN = 3;

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

  // The screen answers a different set of questions to every other node: it has
  // no parent to be placed in and no size to argue about.
  const isScreen = doc.screen !== undefined && doc.screen.id === node.id;
  // Every id but this node's own: what the id field measures a duplicate against,
  // so the rule is enforced under the field instead of described beside it.
  const otherIds = walkNodes(doc).map((site) => site.node.id).filter((id) => id !== node.id);
  const parent = realParentOf(doc, node.id);
  const insideRepeat = isInsideRepeat(doc, node.id);
  // A formula in a repeat's subtree produces `count` values, not one. Answered
  // once here, where the document is in hand, instead of threaded through
  // every field as a prop none of them would use (`behavior/formula-scope.ts`).
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
          onPatch={(patch) => onPatch(patch as Partial<HudNode>)}
          onDrop={onDrop}
          scope={scope}
          insideRepeat={insideRepeat}
        />
      ))}
      {section('sizeBox', 'Size & Box', counts.sizeBox, <SizeBoxSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} isScreen={isScreen} />)}
      {section('appearance', 'Appearance', counts.appearance, <AppearanceSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />)}
      {node.kind === 'element' && section('content', 'Content', counts.content, (
        <ContentSection
          node={node as HudElement}
          onPatch={(patch) => onPatch(patch as Partial<HudNode>)}
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
export type { NodeInspectorProps };

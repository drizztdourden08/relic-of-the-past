/* @layer renderer-components @kind component */
import { breadcrumbOf } from '@app/hud-layout-editing/tree-context';
import { MotionSection } from './MotionSection';
import { AppearanceSection } from './AppearanceSection';
import { ContentSection } from './ContentSection';
import { DataSection } from './DataSection';
import { IdentitySection } from './IdentitySection';
import { LayoutSection } from './LayoutSection';
import { PlacementSection } from './PlacementSection';
import { SizeBoxSection } from './SizeBoxSection';
import { SectionAccordion } from './SectionAccordion';
import type { ReactNode } from 'react';
import type { InspectorSectionKey as SectionKey } from './NodeInspector.type';
import type { InspectorSectionsProps } from './InspectorSections.type';
import { useT } from '@drizztdourden08/brock-react';

const InspectorSections = (props: InspectorSectionsProps) => {
  const t = useT();
  const { node, doc, context, isOpen, onToggle, inspector } = props;
  const { onPatch, onDrop, scope, glyphPacks, selectedId, onSelectNode } = inspector;
  const { isScreen, otherIds, parent, insideRepeat, counts, warnings } = context;
  const section = (key: SectionKey, title: string, boundCount: number | undefined, body: ReactNode) => (
    <SectionAccordion title={title} open={isOpen(key)} onToggle={() => onToggle(key)} boundCount={boundCount}>
      {body}
    </SectionAccordion>
  );

  return (
    <>
      {section('identity', t('hud-editor:inspector.section.identity'), undefined, (
        <IdentitySection
          node={node}
          breadcrumb={breadcrumbOf(doc, node.id, t)}
          otherIds={otherIds}
          onPatch={onPatch}
        />
      ))}
      {!isScreen && section('placement', t('hud-editor:inspector.section.placement'), undefined, (
        <PlacementSection
          node={node}
          parent={parent}
          onSelectNode={onSelectNode}
          onPatch={onPatch}
        />
      ))}
      {node.kind === 'container' && section('layout', t('hud-editor:inspector.section.layout'), counts.layout, (
        <LayoutSection
          node={node}
          onPatch={(patch) => onPatch(patch)}
          onDrop={onDrop}
          scope={scope}
          insideRepeat={insideRepeat}
        />
      ))}
      {section('sizeBox', t('hud-editor:inspector.section.size-box'), counts.sizeBox, <SizeBoxSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} isScreen={isScreen} />)}
      {section('appearance', t('hud-editor:inspector.section.appearance'), counts.appearance, <AppearanceSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} />)}
      {node.kind === 'element' && section('content', t('hud-editor:inspector.section.content'), counts.content, (
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
      {section('data', t('hud-editor:inspector.section.data'), undefined, <DataSection node={node} scope={scope} />)}
      {section('motion', t('hud-editor:inspector.section.motion'), (counts.animation ?? 0) + (counts.transitions ?? 0) || undefined, (
        <MotionSection node={node} onPatch={onPatch} scope={scope} insideRepeat={insideRepeat} warnings={warnings} />
      ))}
    </>
  );
};

export { InspectorSections };

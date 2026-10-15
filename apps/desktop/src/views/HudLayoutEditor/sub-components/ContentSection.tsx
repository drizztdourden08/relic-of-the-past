/* @layer renderer-components @kind component */
import { GlyphContent } from './GlyphContent';
import { ShapeContent } from './ShapeContent';
import { SlotContent } from './SlotContent';
import { SpriteContent } from './SpriteContent';
import { StructuralContent } from './StructuralContent';
import { TextContent } from './TextContent';
import { STRUCTURAL_TYPES } from './ContentSection.constants';
import type { HudElementSpec } from '@rotp/hud';
import type { ContentSectionProps, SetElement, StructuralSpec } from './ContentSection.type';

const isStructural = (element: HudElementSpec): element is StructuralSpec => STRUCTURAL_TYPES.has(element.type);

const ContentSection = (props: ContentSectionProps) => {
  const { node, onPatch, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;
  const { element } = node;
  const setElement: SetElement = (patch) => onPatch({ element: { ...element, ...patch } });

  if (isStructural(element)) {
    return (
      <StructuralContent
        element={element}
        onChange={setElement}
        scope={scope}
        insideRepeat={insideRepeat}
        glyphPacks={glyphPacks}
        selectedId={selectedId}
        onSelectNode={onSelectNode}
      />
    );
  }

  switch (element.type) {
    case 'sprite':
      return <SpriteContent spec={element} onChange={setElement} />;
    case 'glyph':
      return <GlyphContent spec={element} onChange={setElement} glyphPacks={glyphPacks} />;
    case 'slot':
      return <SlotContent spec={element} onChange={setElement} glyphPacks={glyphPacks} />;
    case 'shape':
      return <ShapeContent spec={element} onChange={setElement} scope={scope} insideRepeat={insideRepeat} />;
    case 'text':
      return <TextContent spec={element} onChange={setElement} scope={scope} insideRepeat={insideRepeat} />;
  }
};

export { ContentSection };

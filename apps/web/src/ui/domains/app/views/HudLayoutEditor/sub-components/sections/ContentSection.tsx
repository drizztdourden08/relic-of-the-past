/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ButtonContent } from '../content/ButtonContent';
import { CountdownContent } from '../content/CountdownContent';
import { GlyphContent } from '../content/GlyphContent';
import { RepeatContent } from '../content/RepeatContent';
import { ShapeContent } from '../content/ShapeContent';
import { SlotContent } from '../content/SlotContent';
import { SpriteContent } from '../content/SpriteContent';
import { SwitchContent } from '../content/SwitchContent';
import { TextContent } from '../content/TextContent';
import type { HudElementSpec } from '@shared/types/hud';
import type { ContentSectionProps } from './ContentSection.type';

const ContentSection = (props: ContentSectionProps) => {
  const { node, onPatch, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;
  const { element } = node;
  const setElement = <T extends HudElementSpec>(patch: Partial<T>): void => onPatch({ element: { ...element, ...patch } as HudElementSpec });

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
    case 'button':
      return <ButtonContent spec={element} onChange={setElement} glyphPacks={glyphPacks} />;
    case 'countdown':
      return <CountdownContent spec={element} onChange={setElement} />;
    case 'repeat':
      return <RepeatContent spec={element} onChange={setElement} scope={scope} insideRepeat={insideRepeat} glyphPacks={glyphPacks} onSelectNode={onSelectNode} />;
    case 'switch':
      return <SwitchContent spec={element} onChange={setElement} scope={scope} insideRepeat={insideRepeat} glyphPacks={glyphPacks} selectedId={selectedId} onSelectNode={onSelectNode} />;
    case 'spacer':
    default:
      return <Text className="hud-editor__hint">A spacer draws nothing. It only has a box.</Text>;
  }
};

export { ContentSection };
export type { ContentSectionProps } from './ContentSection.type';

/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ButtonContent } from './ButtonContent';
import { CountdownContent } from './CountdownContent';
import { RepeatContent } from './RepeatContent';
import { SwitchContent } from './SwitchContent';
import type { StructuralContentProps } from './ContentSection.type';

const StructuralContent = (props: StructuralContentProps) => {
  const { element, onChange, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;

  switch (element.type) {
    case 'button':
      return <ButtonContent spec={element} onChange={onChange} glyphPacks={glyphPacks} />;
    case 'countdown':
      return <CountdownContent spec={element} onChange={onChange} />;
    case 'repeat':
      return <RepeatContent spec={element} onChange={onChange} scope={scope} insideRepeat={insideRepeat} glyphPacks={glyphPacks} onSelectNode={onSelectNode} />;
    case 'switch':
      return <SwitchContent spec={element} onChange={onChange} scope={scope} insideRepeat={insideRepeat} glyphPacks={glyphPacks} selectedId={selectedId} onSelectNode={onSelectNode} />;
    case 'spacer':
      return <Text className="hud-editor__hint">A spacer draws nothing.</Text>;
  }
};

export { StructuralContent };

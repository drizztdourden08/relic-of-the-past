/* @layer renderer-components @kind component */
import { Box, Field } from '@drizztdourden08/tessera/primitives';
import { ExpressionInput } from '../ExpressionInput';
import { ReferenceField } from '../ReferenceField';
import { ValueField } from '../ValueField';
import { nodeArtOf } from '@app/hud-layout-editing/node-art';
import { COUNT_STEP } from '../../HudLayoutEditor.constants';
import type { RepeatContentProps } from './RepeatContent.type';

const RepeatContent = (props: RepeatContentProps) => {
  const { spec, onChange, scope, insideRepeat, glyphPacks, onSelectNode } = props;
  const child = nodeArtOf(spec.child, glyphPacks);
  return (
    <Box className="hud-inspect__group">
      <ValueField label="count" value={spec.count} onChange={(count) => onChange({ count })} scope={scope} insideRepeat={insideRepeat} min={0} step={COUNT_STEP} />
      <Field size="sm" label="item">
        <ExpressionInput
          value={spec.item ?? 'index'}
          onChange={(item) => onChange({ item: item === 'index' ? undefined : item })}
          scope={scope}
          insideRepeat
          aria-label="Repeat item expression"
        />
      </Field>
      <ReferenceField
        label="child"
        action="go"
        src={child.src}
        placeholder={child.placeholder}
        name={child.name}
        kind={child.kind}
        onOpen={() => onSelectNode(spec.child.id)}
        aria-label={`Go to the repeated child: ${child.name}`}
      />
    </Box>
  );
};

export { RepeatContent };
export type { RepeatContentProps } from './RepeatContent.type';

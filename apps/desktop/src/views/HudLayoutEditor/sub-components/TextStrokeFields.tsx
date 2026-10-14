/* @layer renderer-components @kind component */
import { Flex, Toggle } from '@drizztdourden08/tessera/primitives';
import { PaintField } from './PaintField';
import { ValueField } from './ValueField';
import type { TextSpec } from './TextContent.type';
import type { TextStrokeFieldsProps } from './TextStrokeFields.type';

const TextStrokeFields = (props: TextStrokeFieldsProps) => {
  const { spec, onChange, scope, insideRepeat } = props;

  return (
    <>
      <Toggle size="sm" checked={spec.stroke !== undefined} label="Stroke" onChange={(on) => onChange({ stroke: on ? { width: 1, color: 'var(--game-stroke)' } : undefined })} />
      {spec.stroke && (
        <Flex direction="column" gap="2xs" className="hud-inspect__nested">
          <ValueField label="width" value={spec.stroke.width} onChange={(width) => onChange({ stroke: { ...spec.stroke, width } as TextSpec['stroke'] })} scope={scope} insideRepeat={insideRepeat} min={0} />
          <PaintField label="colour" value={spec.stroke.color} onChange={(color) => onChange({ stroke: { ...spec.stroke, color } as TextSpec['stroke'] })} scope={scope} insideRepeat={insideRepeat} />
        </Flex>
      )}
    </>
  );
};

export { TextStrokeFields };

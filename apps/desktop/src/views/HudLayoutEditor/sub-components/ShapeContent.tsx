/* @layer renderer-components @kind component */
import { Box, Field, Select } from '@drizztdourden08/tessera/primitives';
import { BoundedValueField } from './BoundedValueField';
import type { HudShapeKind } from '@rotp/hud';
import type { ShapeContentProps } from './ShapeContent.type';

const ShapeContent = (props: ShapeContentProps) => {
  const { spec, onChange, scope, insideRepeat } = props;
  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label="shape">
        <Select size="sm" value={spec.shape} options={[{ value: 'heart', label: 'heart' }, { value: 'magic-bar', label: 'magic-bar' }]} onChange={(shape) => onChange({ shape: shape as HudShapeKind })} />
      </Field>
      <BoundedValueField label="fill" value={spec.fill} onChange={(fill) => onChange({ fill })} scope={scope} insideRepeat={insideRepeat} min={0} max={1} step={0.05} />
      {spec.shape === 'heart' && (
        <BoundedValueField label="armor" value={spec.armor ?? 0} onChange={(armor) => onChange({ armor })} scope={scope} insideRepeat={insideRepeat} min={0} max={2} step={1} />
      )}
      {spec.shape === 'magic-bar' && (
        <BoundedValueField label="bands" value={spec.bands ?? 1} onChange={(bands) => onChange({ bands })} scope={scope} insideRepeat={insideRepeat} min={1} max={2} step={1} />
      )}
    </Box>
  );
};

export { ShapeContent };

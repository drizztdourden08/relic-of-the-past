/* @layer renderer-components @kind component */
import { Box, Field, Select } from '@drizztdourden08/tessera/primitives';
import { BoundedValueField } from './BoundedValueField';
import type { HudShapeKind } from '@rotp/hud';
import type { ShapeContentProps } from './ShapeContent.type';
import { useT } from '@drizztdourden08/brock-react';

const ShapeContent = (props: ShapeContentProps) => {
  const t = useT();
  const { spec, onChange, scope, insideRepeat } = props;
  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label={t('hud-editor:shape-content.label.shape')}>
        <Select size="sm" value={spec.shape} options={[{ value: 'heart', label: t('hud-editor:shape.heart') }, { value: 'magic-bar', label: t('hud-editor:shape.magic-bar') }]} onChange={(shape) => onChange({ shape: shape as HudShapeKind })} />
      </Field>
      <BoundedValueField label={t('hud-editor:shape-content.label.fill')} value={spec.fill} onChange={(fill) => onChange({ fill })} scope={scope} insideRepeat={insideRepeat} min={0} max={1} step={0.05} />
      {spec.shape === 'heart' && (
        <BoundedValueField label={t('hud-editor:shape-content.label.armor')} value={spec.armor ?? 0} onChange={(armor) => onChange({ armor })} scope={scope} insideRepeat={insideRepeat} min={0} max={2} step={1} />
      )}
      {spec.shape === 'magic-bar' && (
        <BoundedValueField label={t('hud-editor:shape-content.label.bands')} value={spec.bands ?? 1} onChange={(bands) => onChange({ bands })} scope={scope} insideRepeat={insideRepeat} min={1} max={2} step={1} />
      )}
    </Box>
  );
};

export { ShapeContent };

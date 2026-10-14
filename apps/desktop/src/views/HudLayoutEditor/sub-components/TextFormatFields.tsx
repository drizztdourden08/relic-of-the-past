/* @layer renderer-components @kind component */
import { Box, Field, NumberInput, Select } from '@drizztdourden08/tessera/primitives';
import { PADS } from './TextContent.constants';
import type { HudTextPad } from '@rotp/hud';
import type { TextFormatFieldsProps } from './TextFormatFields.type';

const TextFormatFields = (props: TextFormatFieldsProps) => {
  const { spec, onChange } = props;

  return (
    <Box className="hud-inspect__row">
      <Field size="sm" label="digits" className="hud-inspect__extent">
        <NumberInput size="sm" aria-label="Digits" min={1} step={1} value={spec.format?.digits ?? 1} onChange={(digits) => onChange({ format: { ...spec.format, digits } })} />
      </Field>
      <Field size="sm" label="pad" className="hud-inspect__extent">
        <Select size="sm" value={spec.format?.pad ?? 'none'} options={PADS.map((p) => ({ value: p, label: p }))} onChange={(pad) => onChange({ format: { ...spec.format, pad: pad as HudTextPad } })} />
      </Field>
    </Box>
  );
};

export { TextFormatFields };

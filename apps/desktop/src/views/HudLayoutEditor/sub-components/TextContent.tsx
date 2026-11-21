/* @layer renderer-components @kind component */
import { Box, NumberInput, Select } from '@drizztdourden08/tessera/primitives';
import { InspectField } from './InspectField';
import { PaintField } from './PaintField';
import { TextFaceFields } from './TextFaceFields';
import { TextFormatFields } from './TextFormatFields';
import { TextStrokeFields } from './TextStrokeFields';
import { TextValueField } from './TextValueField';
import { HUD_WHITE } from '../HudLayoutEditor.constants';
import { ALIGNS } from './TextContent.constants';
import type { HudTextAlign } from '@rotp/hud';
import type { TextContentProps } from './TextContent.type';
import { useT } from '@drizztdourden08/brock-react';

const TextContent = (props: TextContentProps) => {
  const t = useT();
  const { spec, onChange, scope, insideRepeat } = props;

  return (
    <Box className="hud-inspect__group">
      <TextValueField value={spec.value} onChange={(value) => onChange({ value })} scope={scope} insideRepeat={insideRepeat} />

      {typeof spec.value !== 'string' && <TextFormatFields spec={spec} onChange={onChange} />}

      <TextFaceFields spec={spec} onChange={onChange} />

      <PaintField label={t('hud-editor:text-content.label.colour')} value={spec.color ?? HUD_WHITE} onChange={(color) => onChange({ color })} scope={scope} insideRepeat={insideRepeat} />

      <TextStrokeFields spec={spec} onChange={onChange} scope={scope} insideRepeat={insideRepeat} />

      <Box className="hud-inspect__row">
        <InspectField label={t('hud-editor:text-content.label.align')}>
          <Select size="sm" value={spec.align ?? 'start'} options={ALIGNS.map((a) => ({ value: a, label: a }))} onChange={(align) => onChange({ align: align as HudTextAlign })} />
        </InspectField>
        <InspectField label={t('hud-editor:text-content.label.tracking')}>
          <NumberInput size="sm" aria-label={t('hud-editor:text-content.aria.tracking')} step={1} disabled={spec.face.from === 'sprite'} value={spec.tracking ?? 0} onChange={(tracking) => onChange({ tracking: tracking === 0 ? undefined : tracking })} />
        </InspectField>
      </Box>
    </Box>
  );
};

export { TextContent };

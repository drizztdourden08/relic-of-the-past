/* @layer renderer-components @kind component */
import { Box, Field, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { PIE_OPTIONS } from './CountdownContent.constants';
import type { HudCountdownVariantChoice } from '@rotp/hud';
import type { CountdownContentProps } from './CountdownContent.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const CountdownContent = (props: CountdownContentProps) => {
  const t = useT();
  const text = useText();
  const { spec, onChange } = props;
  const pick = (variant: HudCountdownVariantChoice): void =>
    onChange({ variant: variant === 'setting' ? undefined : variant });

  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label={t('hud-editor:countdown-content.label.pie')}>
        <SegmentedControl size="sm" value={spec.variant ?? 'setting'} options={PIE_OPTIONS.map((o) => ({ ...o, label: text(o.label), title: text(o.title) }))} onChange={pick} />
      </Field>
      <Text className="hud-editor__hint">{t('hud-editor:countdown-content.text.draws-only-while-a-countdown')}</Text>
    </Box>
  );
};

export { CountdownContent };

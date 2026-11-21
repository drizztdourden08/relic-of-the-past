/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useSlotScheme } from '@app/hud-layout-editing/slot-scheme';
import { SlotRefField } from './SlotRefField';
import type { SlotContentProps } from './SlotContent.type';
import { useT } from '@drizztdourden08/brock-react';

const SlotContent = (props: SlotContentProps) => {
  const t = useT();
  const { spec, onChange, glyphPacks } = props;
  const slots = useSlotScheme();

  return (
    <Box className="hud-inspect__group">
      <SlotRefField
        label={t('hud-editor:slot-content.label.slot')}
        value={spec.index}
        onChange={(index) => onChange({ index })}
        slots={slots}
        glyphPacks={glyphPacks}
      />
    </Box>
  );
};

export { SlotContent };

/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useSlotScheme } from '../../behavior/slot-scheme';
import { SlotRefField } from '../SlotRefField';
import type { SlotContentProps } from './SlotContent.type';

const SlotContent = (props: SlotContentProps) => {
  const { spec, onChange, glyphPacks } = props;
  const slots = useSlotScheme();

  return (
    <Box className="hud-inspect__group">
      <SlotRefField
        label="slot"
        value={spec.index}
        onChange={(index) => onChange({ index })}
        slots={slots}
        glyphPacks={glyphPacks}
      />
    </Box>
  );
};

export { SlotContent };
export type { SlotContentProps } from './SlotContent.type';

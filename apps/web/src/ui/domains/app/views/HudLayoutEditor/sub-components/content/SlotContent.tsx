/* @layer renderer-components @kind component */
/**
 * A `slot` element draws the item sprite a slot holds, placed wherever the
 * author likes. Any number, never validated against a device.
 *
 * The bare spinner and the paragraph saying any number goes unvalidated against
 * a device are both gone (phase 9): that sentence is the project's standing
 * policy, it was printed here and in two other fields, and none of the three
 * copies told the author anything about the number they had actually typed.
 * `SlotRefField` shows what the number currently draws and says something only
 * when there is something to say.
 */
import { Box } from '@ds/primitives/Box';
import { useSlotScheme } from '../../behavior/slot-scheme';
import { SlotRefField } from '../SlotRefField';
import type { GlyphPack, HudElementSpec } from '@shared/types/hud';

interface SlotContentProps {
  spec: Extract<HudElementSpec, { type: 'slot' }>;
  onChange: (patch: Partial<Extract<HudElementSpec, { type: 'slot' }>>) => void;
  glyphPacks: readonly GlyphPack[];
}

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
export type { SlotContentProps };

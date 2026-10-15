/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Field, Flex, IconButton, NumberInput, Text } from '@drizztdourden08/tessera/primitives';
import type { SlotChipsProps } from './SlotChips.type';

const SlotChips = (props: SlotChipsProps) => {
  const { label, value, onChange, hint, readOnly } = props;
  const slots = value ?? [];
  const [draft, setDraft] = useState<number | null>(null);

  const add = (): void => {
    if (draft === null || !Number.isInteger(draft) || draft <= 0 || slots.includes(draft)) return;
    onChange([...slots, draft].sort((a, b) => a - b));
    setDraft(null);
  };

  const remove = (slot: number): void => {
    const next = slots.filter((n) => n !== slot);
    onChange(next.length > 0 ? next : undefined);
  };

  return (
    <Field size="sm" label={label} hint={hint}>
      <Flex gap="2xs" align="center" wrap className="hud-slot-chips">
        {slots.map((slot) => (
          <Box key={slot} className="hud-slot-chips__chip">
            <Text className="hud-slot-chips__num">{slot}</Text>
            {!readOnly && (
              <IconButton variant="ghost" size="sm" label={`Remove slot ${slot}`} onClick={() => remove(slot)}>
                ✕
              </IconButton>
            )}
          </Box>
        ))}
        {slots.length === 0 && <Text className="hud-slot-chips__empty">none</Text>}
        {!readOnly && (
          <>
            <NumberInput
              size="sm" className="hud-slot-chips__entry" aria-label={`Add a slot to ${label}`}
              value={draft ?? ''} min={1} step={1} placeholder="slot"
              onChange={(n) => setDraft(Number.isFinite(n) ? n : null)}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } }}
            />
            <IconButton variant="ghost" size="sm" label={`Add slot to ${label}`} onClick={add}>+</IconButton>
          </>
        )}
      </Flex>
    </Field>
  );
};

export { SlotChips };

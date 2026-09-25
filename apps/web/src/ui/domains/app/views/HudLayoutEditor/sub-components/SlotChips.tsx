/* @layer renderer-components @kind component */
/**
 * `dimWhenEmpty` is a LIST OF SLOT NUMBERS, edited as a list.
 *
 * What it replaces: a `TextInput` holding `5, 6, 7, 8`, split on every comma on
 * every keystroke, with every unparseable fragment silently dropped. Typing a
 * comma mid-string re-parsed the whole field; deleting a digit deleted a slot.
 * The value was never a string. It is `number[]` in `hud-node.ts`, and the
 * comma was a serialisation format shown to an author.
 *
 * NOT `TagInput`. The design system's tag control is a string vocabulary with a
 * suggestion panel, a namespace convention and an advisory validator; a slot is
 * a small positive integer with none of those. What is borrowed is the SHAPE of
 * a wrapped row of removable chips with an entry beside them. It is not the
 * component, which would need three of its features disabled to be usable here.
 *
 * THE ENTRY IS ALWAYS VISIBLE, unlike the wireframe's bare `+`. A `+` that
 * reveals a field is one more click and one more state for a control whose
 * whole job is "add a number"; the number field IS the `+`.
 *
 * DUPLICATES AND ZERO ARE REFUSED AT THE DOOR, and the list is sorted, because
 * `dimWhenEmpty` is a SET of slots. Order carries no meaning downstream and an
 * author who adds 6 twice has not said anything different.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Text } from '@ds/primitives/Text';
import './HudLayoutEditor.appearance.css';
import type { ReactNode } from 'react';

interface SlotChipsProps {
  label: string;
  value: readonly number[] | undefined;
  onChange: (next: number[] | undefined) => void;
  hint?: ReactNode;
  /** Derived elsewhere. The chips render and nothing edits them. */
  readOnly?: boolean;
}

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
export type { SlotChipsProps };

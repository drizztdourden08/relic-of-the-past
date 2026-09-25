/* @layer renderer-components @kind component */
/**
 * A `button`'s whole Content: which control it binds to, then a face per
 * state, as in `plans/hud-data-binding.html`'s wireframe 4. Binding by VERB or by
 * SLOT NUMBER (uncapped and 1-based, since a keyboard alone reaches 107 glyphs), never
 * validated against a device.
 *
 * The slot half is `SlotRefField` now (phase 9). It retired the third and last
 * copy of the "any number, not capped or validated against a device" paragraph,
 * which is a policy that is true everywhere and therefore explains nothing
 * here. The field shows the glyph that number currently draws instead, which
 * is what a person was reading the paragraph hoping to learn.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Select } from '@ds/primitives/Select';
import { useSlotScheme } from '../behavior/slot-scheme';
import { ButtonStateRow } from './ButtonStateRow';
import { SlotRefField } from './SlotRefField';
import type { GlyphPack, HudButtonBind, HudButtonSpec, HudButtonVerb } from '@shared/types/hud';

const VERBS: readonly HudButtonVerb[] = ['up', 'down', 'left', 'right', 'pause', 'map'];
const STATES = ['pressed', 'held', 'unassigned'] as const;

interface ButtonStatesEditorProps {
  spec: HudButtonSpec;
  onChange: (patch: Partial<HudButtonSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

const ButtonStatesEditor = (props: ButtonStatesEditorProps) => {
  const { spec, onChange, glyphPacks } = props;
  const { bind, states } = spec;
  const slots = useSlotScheme();

  const setBindKind = (kind: string): void => {
    onChange({ bind: kind === 'verb' ? { kind: 'verb', verb: 'pause' } : { kind: 'slot', index: 1 } });
  };

  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label="binds to">
        <SegmentedControl size="sm" value={bind.kind} options={[{ value: 'verb', label: 'verb' }, { value: 'slot', label: 'slot' }]} onChange={setBindKind} />
      </Field>
      {bind.kind === 'verb' ? (
        <Field size="sm" label="verb">
          <Select size="sm" value={bind.verb} options={VERBS.map((v) => ({ value: v, label: v }))} onChange={(verb) => onChange({ bind: { kind: 'verb', verb: verb as HudButtonVerb } as HudButtonBind })} />
        </Field>
      ) : (
        <SlotRefField
          label="slot"
          value={bind.index}
          onChange={(index) => onChange({ bind: { kind: 'slot', index } as HudButtonBind })}
          slots={slots}
          glyphPacks={glyphPacks}
        />
      )}

      <Field size="sm" label="States">
        <Flex direction="column" gap="2xs">
          <ButtonStateRow state="idle" required face={states.idle} glyphPacks={glyphPacks} onChange={(face) => face && onChange({ states: { ...states, idle: face } })} />
          {STATES.map((state) => (
            <ButtonStateRow
              key={state}
              state={state}
              face={states[state]}
              glyphPacks={glyphPacks}
              onChange={(face) => onChange({ states: { ...states, [state]: face } })}
            />
          ))}
        </Flex>
      </Field>
    </Box>
  );
};

export { ButtonStatesEditor };
export type { ButtonStatesEditorProps };

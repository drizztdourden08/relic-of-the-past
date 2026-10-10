/* @layer renderer-components @kind component */
import { Box, Field, Flex, SegmentedControl, Select } from '@drizztdourden08/tessera/primitives';
import { useSlotScheme } from '@app/hud-layout-editing/slot-scheme';
import { ButtonStateRow } from './ButtonStateRow';
import { SlotRefField } from './SlotRefField';
import { STATES, VERBS } from './ButtonStatesEditor.constants';
import type { HudButtonBind, HudButtonVerb } from '@rotp/hud';
import type { ButtonStatesEditorProps } from './ButtonStatesEditor.type';

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
          <Select size="sm" value={bind.verb} options={VERBS.map((v) => ({ value: v, label: v }))} onChange={(verb) => onChange({ bind: { kind: 'verb', verb: verb as HudButtonVerb } })} />
        </Field>
      ) : (
        <SlotRefField
          label="slot"
          value={bind.index}
          onChange={(index) => onChange({ bind: { kind: 'slot', index } })}
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
export type { ButtonStatesEditorProps } from './ButtonStatesEditor.type';

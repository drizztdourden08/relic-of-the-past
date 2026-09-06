/* @layer renderer-components @kind component */
/**
 * The free sequence: one editable chip per jump, each capped at the largest
 * jump an item carries, a remove control on each, an add control, and a Σ
 * readout against the span that reads as invalid until the sum is exact.
 * Validation wording comes from the caller.
 */
import { Box, Button, IconButton, NumberInput, Text } from '@ds/primitives';
import type { JumpChipsEditorProps } from './JumpChipsEditor.type';
import './JumpChipsEditor.css';

const JumpChipsEditor = (props: JumpChipsEditorProps) => {
  const { jumps, span, maxJump = span, problem, disabled = false, onChange, className = '' } = props;
  const sum = jumps.reduce((total, jump) => total + jump, 0);
  const chipMax = Math.max(1, Math.min(span, maxJump));
  const canAdd = !disabled && jumps.length < span;

  const setJump = (index: number, next: number) =>
    onChange(jumps.map((jump, at) => (at === index ? (Number.isFinite(next) ? Math.min(chipMax, next) : 0) : jump)));
  const removeJump = (index: number) => onChange(jumps.filter((_, at) => at !== index));
  const addJump = () => onChange([...jumps, Math.min(chipMax, Math.max(1, span - sum))]);

  return (
    <Box className={`jump-chips${className ? ` ${className}` : ''}`}>
      <Box className="jump-chips__list">
        {jumps.map((jump, index) => (
          <Box key={index} className="jump-chips__chip">
            <NumberInput
              className="jump-chips__field"
              value={jump}
              min={1}
              max={chipMax}
              step={1}
              sizeToContent
              disabled={disabled}
              aria-label={`jump ${index + 1}`}
              onChange={(next) => setJump(index, next)}
            />
            <IconButton variant="ghost" size="sm" label="Remove jump" disabled={disabled} onClick={() => removeJump(index)}>
              ✕
            </IconButton>
          </Box>
        ))}
        <Button variant="ghost" size="sm" disabled={!canAdd} onClick={addJump}>+ jump</Button>
      </Box>
      <Text className={`jump-chips__sum${problem === undefined ? '' : ' jump-chips__sum--invalid'}`}>
        {`Σ ${sum} / ${span}${problem === undefined ? '' : ` · ${problem}`}`}
      </Text>
    </Box>
  );
};

export { JumpChipsEditor };

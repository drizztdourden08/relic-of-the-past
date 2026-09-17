/* @layer renderer-widgets @kind component */
/**
 * The box a right click opens on a number: the value, a field to type it, and buttons that move
 * it by a step. A counted value takes plus and minus steps; a value with a ladder (a capacity
 * tier) walks the ladder and shows every rung as a chip. Every press writes at once, so the
 * game answers while the box is open. Portalled, so the widget's edges never cut it.
 */
import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Box, Button, Portal, Text, TextInput } from '@ds/primitives';
import { useAnchoredPlacement } from '../behavior/useAnchoredPlacement';
import { useDismiss } from '../behavior/useDismiss';
import type { NumberSetterProps } from './NumberSetter.type';

const clampTo = (min: number, max: number, n: number): number => Math.min(max, Math.max(min, Math.round(n)));

const digits = (n: number): string => String(n);

/** The rung after `value` on the ladder, or the value itself at the end. */
const rungStep = (ladder: readonly number[], value: number, dir: 1 | -1): number => {
  const at = ladder.findIndex((rung) => rung >= value);
  const index = at < 0 ? ladder.length - 1 : at;
  const next = index + (dir === 1 ? (ladder[index] === value ? 1 : 0) : -1);
  return ladder[Math.min(ladder.length - 1, Math.max(0, next))];
};

const NumberSetter = (props: NumberSetterProps) => {
  const { title, value, min, max, steps, ladder, format = digits, anchor, onCommit, onClose } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { left, top, placed } = useAnchoredPlacement(ref, anchor, steps?.length ?? ladder?.length);
  useDismiss(ref, anchor, onClose);
  const [draft, setDraft] = useState(String(value));

  const commit = useCallback((next: number) => {
    const clamped = clampTo(min, max, next);
    setDraft(String(clamped));
    onCommit(clamped);
  }, [min, max, onCommit]);

  const commitDraft = () => {
    const n = Number(draft);
    if (draft.trim() !== '' && Number.isFinite(n)) commit(n);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitDraft(); }
  };

  const stepList = steps ?? [];
  const byStep = (amount: number) => commit(value + amount);
  const byRung = (dir: 1 | -1) => { if (ladder) commit(rungStep(ladder, value, dir)); };

  return (
    <Portal layer="popover">
      <Box ref={ref} className="cheats-popover cheats-setter" role="dialog" aria-label={title} style={{ left, top }} data-placed={placed ? '' : undefined}>
        <Text className="cheats-popover__title">{title}</Text>
        <Box className="cheats-setter__row">
          <Button variant="tertiary" size="sm" aria-label="Down" onClick={() => (ladder ? byRung(-1) : byStep(-stepList[0]))}>-</Button>
          <TextInput
            className="cheats-setter__input"
            value={draft}
            inputMode="numeric"
            aria-label={`${title}, ${min} to ${max}`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commitDraft}
          />
          <Button variant="tertiary" size="sm" aria-label="Up" onClick={() => (ladder ? byRung(1) : byStep(stepList[0]))}>+</Button>
        </Box>
        {stepList.length > 1 && (
          <Box className="cheats-setter__steps">
            {[...stepList].reverse().map((step) => (
              <Button key={`-${step}`} variant="tertiary" size="sm" onClick={() => byStep(-step)}>-{format(step)}</Button>
            ))}
            {stepList.map((step) => (
              <Button key={`+${step}`} variant="tertiary" size="sm" onClick={() => byStep(step)}>+{format(step)}</Button>
            ))}
          </Box>
        )}
        {ladder && (
          <Box className="cheats-setter__steps cheats-setter__rungs">
            {ladder.map((rung) => (
              <Button key={rung} variant="tertiary" size="sm" active={rung === value} onClick={() => commit(rung)}>{format(rung)}</Button>
            ))}
          </Box>
        )}
        <Box className="cheats-setter__ends">
          <Button variant="bare" className="cheats-setter__end" onClick={() => commit(min)}>Min {format(min)}</Button>
          <Button variant="bare" className="cheats-setter__end" onClick={() => commit(max)}>Max {format(max)}</Button>
        </Box>
      </Box>
    </Portal>
  );
};

export { NumberSetter };

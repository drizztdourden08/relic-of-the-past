/* @layer renderer-widgets @kind component */
import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Anchored, Box, Button, Pressable, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { useAnchorRef } from '../behavior/useAnchorRef';
import { useDismiss } from '../behavior/useDismiss';
import { nudgeTarget } from '../behavior/nudge-target';
import { NO_STEPS } from './NumberSetter.constants';
import type { NumberSetterProps } from './NumberSetter.type';

const clampTo = (min: number, max: number, n: number): number => Math.min(max, Math.max(min, Math.round(n)));

const digits = (n: number): string => String(n);

const NumberSetter = (props: NumberSetterProps) => {
  const { title, value, min, max, steps: stepList = NO_STEPS, ladder, format = digits, anchor, onCommit, onClose } = props;
  const ref = useRef<HTMLDivElement>(null);
  const anchorRef = useAnchorRef(anchor);
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
  const byStep = (amount: number) => commit(value + amount);
  const nudge = (dir: 1 | -1) => { const next = nudgeTarget({ ladder, steps: stepList, value, dir }); if (next !== null) commit(next); };
  return (
    <Anchored ref={ref} anchorRef={anchorRef} placement="bottom-start" layer="popover" className="cheats-popover cheats-setter" role="dialog" aria-label={title}>
      <Text className="cheats-popover__title">{title}</Text>
      <Box className="cheats-setter__row">
        <Button variant="tertiary" size="sm" aria-label="Down" onClick={() => nudge(-1)}>-</Button>
        <TextInput
          className="cheats-setter__input"
          value={draft}
          inputMode="numeric"
          aria-label={`${title}, ${min} to ${max}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commitDraft}
        />
        <Button variant="tertiary" size="sm" aria-label="Up" onClick={() => nudge(1)}>+</Button>
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
        <Pressable className="cheats-setter__end" onClick={() => commit(min)}>Min {format(min)}</Pressable>
        <Pressable className="cheats-setter__end" onClick={() => commit(max)}>Max {format(max)}</Pressable>
      </Box>
    </Anchored>
  );
};

export { NumberSetter };

/* @layer renderer-components @kind component */
/**
 * One animation's keyframes, as a track with a selected key. This is the component
 * phase 10 exists to build, and the one that finally releases the `value`
 * field pinned at 0 px through phases 1, 3 and 4.
 *
 * WHY THE OLD ROW COULD NEVER WORK, and what changed. `.hud-keyframes__row`
 * put `at`, the value, an easing `Select` and a delete button on ONE flex line
 * per keyframe. `at` and the `Select` each declare `width: 100%`, which on a
 * flex item is a 100% BASIS, so the row had no positive free space for the
 * value's `flex: 1 1 0` to grow into. That held at any rail width, with any control
 * tier, with or without phase 4's deleted mode switch (§35.7, §36's
 * re-measurement). The fix is not a rule; it is that ONE key is edited at a
 * time and its three fields are three full-width rows. That is the drawing's
 * own "redrawn" note: "the plan wanted the selected key's `at`, value and
 * easing on one row under the track. At 232 px that is three controls in
 * ~150 px, and the value may be an expression."
 *
 * `at` IS A `Slider`, the design-system control the inspector had never once
 * imported. It is a bounded 0-1 with no meaningful units, dragged far more
 * often than typed, and it is the same number the diamond above it moves.
 * Two views of one value is exactly what a slider paired with a direct
 * manipulation is for.
 */
import { useState } from 'react';
import '../HudLayoutEditor.motion.css';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Slider } from '@ds/primitives/Slider';
import { addKeyAt, canRemoveKey, moveKey, removeKey } from '../../behavior/keyframe-track';
import { EasingPicker } from '../EasingPicker';
import { ValueInput } from '../ValueInput';
import { KeyRail } from './sub-components/KeyRail';
import type { HudAnimationKeyframe, HudEasing } from '@shared/types/hud';

interface KeyframeTrackProps {
  keyframes: readonly HudAnimationKeyframe[];
  onChange: (next: HudAnimationKeyframe[]) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  /** The animation's own default easing, which a new key's sampled value and
   *  an un-overridden span both read. */
  easing?: HudEasing;
  /** The ruler's right-hand end: the resolved duration, or the formula. */
  endLabel: string;
  /** The transport's head, 0-1 of this animation's own cycle, or `null`. */
  head: number | null;
}

const KeyframeTrack = (props: KeyframeTrackProps) => {
  const { keyframes, onChange, scope, insideRepeat, easing, endLabel, head } = props;
  const [rawSelected, setSelected] = useState(0);
  // A key can be deleted from under the selection (or the whole animation
  // replaced by a preset), so the index is clamped on read instead of being
  // trusted and repaired in an effect that would run a render too late.
  const selected = Math.min(rawSelected, keyframes.length - 1);
  const key = keyframes[selected];

  const move = (index: number, at: number): void => onChange(moveKey(keyframes, index, at));

  const add = (at: number): void => {
    const next = addKeyAt(keyframes, at, scope, easing);
    if (!next) return;
    onChange(next.keyframes);
    setSelected(next.index);
  };

  if (!key) return null;

  return (
    <Box className="hud-kftrack__group">
      <KeyRail
        keyframes={keyframes}
        selected={selected}
        onSelect={setSelected}
        onMove={move}
        onAdd={add}
        head={head}
        endLabel={endLabel}
      />

      {/* The label is the `Field`'s, not the `Slider`'s own: `Slider` lays its
          label BESIDE the track on a 16 px gap, and an `input[type=range]`
          will not shrink below its ~129 px intrinsic width, so the pair
          overflowed the rail by 14 px at 232 and 36 px at 188 when measured.
          Above-the-control is also the row grammar every other property in
          this panel uses (§35). */}
      <Field size="sm" label={`at · key ${selected + 1} of ${keyframes.length}`}>
        <Slider
          value={key.at}
          min={0}
          max={1}
          step={0.01}
          formatValue={(n) => n.toFixed(2)}
          onChange={(at) => move(selected, at)}
        />
      </Field>

      <ValueInput
        label="value"
        aria-label="Value"
        role="number"
        value={key.value}
        onChange={(value) => onChange(keyframes.map((k, i) => (i === selected ? { ...k, value } : k)))}
        scope={scope}
        insideRepeat={insideRepeat}
      />

      <EasingPicker
        label="ease out"
        allowDefault
        unsetHint="inherits this animation's own easing"
        value={key.easing}
        onChange={(next) => onChange(keyframes.map((k, i) => {
          if (i !== selected) return k;
          const { easing: _dropped, ...rest } = k;
          return next === undefined ? rest : { ...rest, easing: next };
        }))}
      />

      <Flex gap="2xs" align="center">
        <Button variant="ghost" size="sm" onClick={() => add(key.at < 0.5 ? key.at + 0.25 : key.at - 0.25)}>
          + key
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canRemoveKey(keyframes)}
          onClick={() => { onChange(removeKey(keyframes, selected)); setSelected(0); }}
        >
          remove key
        </Button>
      </Flex>
    </Box>
  );
};

export { KeyframeTrack };
export type { KeyframeTrackProps };

/* @layer renderer-components @kind component */
/**
 * Switching mode replaces the parameters wholesale; edits within a mode spread the current mode so
 * changing the order does not reset the crossfade. Crossfade and wait switch get their own framed
 * blocks because both were missed among look-alike controls. Repeatable controls take an id from
 * the layer: the switch otherwise derives its id from its label, and two random layers collide.
 */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { NumberInput } from '@ds/primitives/NumberInput';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Toggle } from '@ds/primitives/Toggle';
import { DEFAULT_MODES } from '../../behavior/layer-ops';
import type { PlayModeKind } from '../../behavior/layer-ops';
import { CrossfadeField } from '../CrossfadeField';
import { IntervalTimes } from '../IntervalTimes';
import {
  MODE_HINTS, MODE_OPTIONS, ORDER_HINTS, ORDER_OPTIONS, WAIT_HINTS, WAIT_LABEL,
} from './PlayModeFields.constants';
import type { PlayModeFieldsProps } from './PlayModeFields.type';

const PlayModeFields = (props: PlayModeFieldsProps) => {
  const { mode, layerId, disabled = false, onChange } = props;

  return (
    <Box className="layer-card__modes">
      <SegmentedControl
        label="Play mode"
        description={MODE_HINTS[mode.kind]}
        value={mode.kind}
        options={MODE_OPTIONS}
        disabled={disabled}
        onChange={(kind) => onChange(DEFAULT_MODES[kind as PlayModeKind])}
      />

      {mode.kind === 'loop' && (
        <>
          <SegmentedControl
            label="Order"
            description={ORDER_HINTS[mode.order]}
            value={mode.order}
            options={ORDER_OPTIONS}
            disabled={disabled}
            onChange={(order) => onChange({ ...mode, order })}
          />
          {/* Nothing to cross into when one track repeats on itself, so the control is not offered. */}
          {mode.order !== 'single' && (
            <CrossfadeField
              seconds={mode.crossfadeSeconds ?? 0}
              layerId={layerId}
              disabled={disabled}
              onChange={(crossfadeSeconds) => onChange({ ...mode, crossfadeSeconds })}
            />
          )}
        </>
      )}

      {mode.kind === 'random' && (
        <>
          <Flex gap="md" align="end" wrap>
            <Field label="Shortest gap (s)">
              <NumberInput
                min={0} step={0.25} max={3600} sizeToContent value={mode.minDelaySeconds} disabled={disabled}
                onChange={(value) => onChange({ ...mode, minDelaySeconds: Number.isFinite(value) ? value : 0 })}
              />
            </Field>
            <Field label="Longest gap (s)">
              <NumberInput
                min={0} step={0.25} max={3600} sizeToContent value={mode.maxDelaySeconds} disabled={disabled}
                onChange={(value) => onChange({ ...mode, maxDelaySeconds: Number.isFinite(value) ? value : 0 })}
              />
            </Field>
            {mode.minDelaySeconds > mode.maxDelaySeconds && (
              <Badge variant="danger">Shortest is longer than longest</Badge>
            )}
          </Flex>
          <Box className="layer-card__switch">
            <Toggle
              id={`wait-for-completion-${layerId}`}
              label={WAIT_LABEL}
              description={mode.waitForCompletion === true ? WAIT_HINTS.on : WAIT_HINTS.off}
              checked={mode.waitForCompletion === true}
              disabled={disabled}
              onChange={(waitForCompletion) => onChange({ ...mode, waitForCompletion })}
            />
          </Box>
        </>
      )}

      {mode.kind === 'interval' && (
        <IntervalTimes
          atSeconds={mode.atSeconds}
          disabled={disabled}
          onChange={(atSeconds) => onChange({ kind: 'interval', atSeconds })}
        />
      )}
    </Box>
  );
};

export { PlayModeFields };

/* @layer renderer-components @kind component */
/**
 * The scheduling half of a layer: which play mode, plus only the parameters that mode actually
 * has. Switching mode replaces the parameters wholesale rather than carrying stale ones over,
 * so what is on screen is always exactly what will be written to the manifest.
 *
 * Every edit within a mode spreads the current mode instead of rebuilding it, so changing the
 * order does not quietly reset the crossfade sitting beside it.
 *
 * The two optional settings — the crossfade and the wait switch — are each framed as a block of
 * their own rather than stacked in with the rest, because both were being missed entirely among
 * controls that look identical to them. Every control that can appear more than once on a page is
 * given an id from the layer it belongs to: without one the switch derives its id from its own
 * label, so two random layers produce duplicate ids and the second layer's switch operates the
 * first layer's.
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
  MODE_HINTS, MODE_OPTIONS, ORDER_OPTIONS, WAIT_HINTS, WAIT_LABEL,
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
            value={mode.order}
            options={ORDER_OPTIONS}
            disabled={disabled}
            onChange={(order) => onChange({ ...mode, order })}
          />
          <CrossfadeField
            seconds={mode.crossfadeSeconds ?? 0}
            layerId={layerId}
            disabled={disabled}
            onChange={(crossfadeSeconds) => onChange({ ...mode, crossfadeSeconds })}
          />
        </>
      )}

      {mode.kind === 'random' && (
        <>
          <Flex gap="md" align="end" wrap>
            <Field label="Shortest gap (s)">
              <NumberInput
                min={0} step={0.5} max={3600} sizeToContent value={mode.minDelaySeconds} disabled={disabled}
                onChange={(value) => onChange({ ...mode, minDelaySeconds: Number.isFinite(value) ? value : 0 })}
              />
            </Field>
            <Field label="Longest gap (s)">
              <NumberInput
                min={0} step={0.5} max={3600} sizeToContent value={mode.maxDelaySeconds} disabled={disabled}
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

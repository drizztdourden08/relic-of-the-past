/* @layer renderer-components @kind component */
import { Box, Field, Text } from '@drizztdourden08/tessera/primitives';
import { useEditorStep } from '@app/hud-layout-editing/editor-step';
import { ValueInput } from './ValueInput';
import { AXES } from './MinMaxField.constants';
import type { Value } from '@rotp/hud';
import type { Limits, MinMaxFieldProps } from './MinMaxField.type';

const compact = (next: { w?: Value; h?: Value }): Limits => {
  const out: { w?: Value; h?: Value } = {};
  if (next.w !== undefined) out.w = next.w;
  if (next.h !== undefined) out.h = next.h;
  return out.w === undefined && out.h === undefined ? undefined : out;
};

const MinMaxField = (props: MinMaxFieldProps) => {
  const { min, max, onMin, onMax, scope, insideRepeat } = props;
  const step = useEditorStep();

  const bounds = [
    { key: 'min' as const, value: min, set: onMin },
    { key: 'max' as const, value: max, set: onMax },
  ];

  return (
    <Field size="sm" label="limits" hint="Leave a field blank for no limit." className="hud-minmax">
      {AXES.map((axis) => (
        <Box key={axis} className="hud-minmax__row">
          <Text className="hud-minmax__cap">{axis}</Text>
          {bounds.map((bound) => (
            <ValueInput
              key={bound.key}
              className="hud-minmax__value"
              aria-label={`${bound.key} ${axis}`}
              placeholder={bound.key}
              value={bound.value?.[axis]}
              onChange={(next) => bound.set(compact({ ...bound.value, [axis]: next }))}
              onClear={() => bound.set(compact({ ...bound.value, [axis]: undefined }))}
              scope={scope}
              insideRepeat={insideRepeat}
              role="number"
              step={step}
            />
          ))}
        </Box>
      ))}
    </Field>
  );
};

export { MinMaxField };
export type { MinMaxFieldProps } from './MinMaxField.type';

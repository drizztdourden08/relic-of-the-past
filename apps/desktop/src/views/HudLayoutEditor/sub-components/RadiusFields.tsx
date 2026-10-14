/* @layer renderer-components @kind component */
import { Field, Grid, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { CORNERS } from './AppearanceSection.constants';
import { ValueField } from './ValueField';
import type { HudRadius, Value } from '@rotp/hud';
import type { Corners, RadiusFieldsProps } from './RadiusFields.type';

const radiusIsSplit = (r: HudRadius | undefined): r is Corners => Array.isArray(r);

const cornerValue = (radius: readonly Value[], i: number): Value => {
  const value = radius[i];
  if (value === undefined) throw new Error(`corner radius ${i} is out of range`);
  return value;
};

const RadiusFields = (props: RadiusFieldsProps) => {
  const { boxStyle, setStyle, scope, insideRepeat } = props;
  const { radius } = boxStyle;

  return (
    <>
      <Field size="sm" label="radius">
        <SegmentedControl size="sm" value={radiusIsSplit(radius) ? 'split' : 'uniform'} options={[{ value: 'uniform', label: 'uniform' }, { value: 'split', label: 'per corner' }]}
          onChange={(v) => setStyle({ radius: v === 'split' ? [0, 0, 0, 0] : 0 })} />
      </Field>
      {radiusIsSplit(radius) ? (
        <Grid columns={2} gap="2xs">
          {CORNERS.map((corner, i) => (
            <ValueField key={corner} label={corner} value={cornerValue(radius, i)}
              onChange={(v) => { const next: Corners = [...radius]; next[i] = v; setStyle({ radius: next }); }}
              scope={scope} insideRepeat={insideRepeat} min={0} />
          ))}
        </Grid>
      ) : (
        <ValueField value={radius ?? 0} onChange={(next) => setStyle({ radius: next })} scope={scope} insideRepeat={insideRepeat} min={0} />
      )}
    </>
  );
};

export { RadiusFields };

/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { validateCustomRatio, detectScreenRatio, screenReadout, viewportReadout, niceRatio, effectiveCustomRatio } from '@rotp/game-core';
import type { RatioReadout } from '@rotp/game-core';
import { useSafeAreaInsets } from '@drizztdourden08/brock-react';
import { SegmentedControl, NumberInput, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { AspectRatioControlProps } from './AspectRatioControl.type';
import './AspectRatioControl.css';

const renderReadout = (r: RatioReadout) => {
  const detected = niceRatio(r.detected);
  const used = niceRatio(r.used);
  return (
    <Box className="aspect-ratio-control__custom">
      <Text className="aspect-ratio-control__detected">Detected: {detected.w}:{detected.h}</Text>
      <Text className={r.capped ? 'aspect-ratio-control__capped' : 'aspect-ratio-control__detected'}>
        Calculated: {used.w}:{used.h}{r.capped ? ' (capped by the engine limit)' : ''}
      </Text>
    </Box>
  );
};

const AspectRatioControl = (props: AspectRatioControlProps) => {
  const {
    label, description, value, options, presetOptions, widePresets, tallPresets,
    descriptions, recommendedValue, recommendedNote,
    customW, customH, ratioKey, wKey, hKey, renderIntoNotch = true, onChange,
  } = props;

  useSafeAreaInsets();
  const eff = effectiveCustomRatio(customW, customH, renderIntoNotch);
  const [w, setW] = useState(eff.w);
  const [h, setH] = useState(eff.h);
  useEffect(() => { setW(eff.w); setH(eff.h); }, [eff.w, eff.h]);

  const wideValues = useMemo(() => new Set((widePresets ?? []).map((o) => o.value)), [widePresets]);
  const tallValues = useMemo(() => new Set((tallPresets ?? []).map((o) => o.value)), [tallPresets]);
  const presetValues = useMemo(() => new Set((presetOptions ?? []).map((o) => o.value)), [presetOptions]);
  let mainValue = value;
  if (widePresets && wideValues.has(value)) mainValue = 'wide';
  else if (tallPresets && tallValues.has(value)) mainValue = 'tall';
  else if (presetOptions && presetValues.has(value)) mainValue = 'preset';

  const handleMain = useCallback((next: string) => {
    if (next === 'wide') {
      const fallback = widePresets?.[0]?.value ?? '16:9';
      onChange({ [ratioKey]: wideValues.has(value) ? value : fallback });
    } else if (next === 'tall') {
      const fallback = tallPresets?.[0]?.value ?? '3:4';
      onChange({ [ratioKey]: tallValues.has(value) ? value : fallback });
    } else if (next === 'preset') {
      const fallback = presetOptions?.[0]?.value ?? '16:9';
      onChange({ [ratioKey]: presetValues.has(value) ? value : fallback });
    } else if (next === 'custom' && !(customW > 0 && customH > 0)) {
      const d = detectScreenRatio(renderIntoNotch);
      onChange({ [ratioKey]: 'custom', [wKey]: d.w, [hKey]: d.h });
    } else {
      onChange({ [ratioKey]: next });
    }
  }, [
    value, widePresets, tallPresets, presetOptions, wideValues, tallValues, presetValues,
    customW, customH, renderIntoNotch, ratioKey, wKey, hKey, onChange,
  ]);

  const commit = useCallback((nw: number, nh: number) => {
    setW(nw); setH(nh);
    if (validateCustomRatio(nw, nh).valid) onChange({ [wKey]: nw, [hKey]: nh });
  }, [onChange, wKey, hKey]);

  const handlePreset = useCallback(
    (v: string) => onChange({ [ratioKey]: v }),
    [onChange, ratioKey],
  );
  const handleWidth = useCallback((n: number) => commit(n, h), [commit, h]);
  const handleHeight = useCallback((n: number) => commit(w, n), [commit, w]);

  const check = validateCustomRatio(w, h);
  const isRecommended = Boolean(recommendedValue) && mainValue === recommendedValue;

  return (
    <Box className="aspect-ratio-control">
      <SegmentedControl
        label={label}
        description={descriptions?.[mainValue] ?? description}
        value={mainValue}
        options={options}
        onChange={handleMain}
      />
      {isRecommended && recommendedNote && (
        <Text className="aspect-ratio-control__recommended">{recommendedNote}</Text>
      )}
      {mainValue === 'wide' && widePresets && (
        <Box className="aspect-ratio-control__custom">
          <SegmentedControl value={value} options={widePresets} onChange={handlePreset} />
        </Box>
      )}
      {mainValue === 'tall' && tallPresets && (
        <Box className="aspect-ratio-control__custom">
          <SegmentedControl value={value} options={tallPresets} onChange={handlePreset} />
        </Box>
      )}
      {mainValue === 'preset' && presetOptions && (
        <Box className="aspect-ratio-control__custom">
          <SegmentedControl value={value} options={presetOptions} onChange={handlePreset} />
        </Box>
      )}
      {mainValue === 'auto' && renderReadout(viewportReadout(renderIntoNotch))}
      {mainValue === 'screen' && renderReadout(screenReadout(true))}
      {value === 'custom' && (
        <Box className="aspect-ratio-control__custom">
          <Box className="aspect-ratio-control__fields">
            <NumberInput buttons="sides" aria-label="Ratio width" min={1} step={1} value={w} onChange={handleWidth} />
            <Text className="aspect-ratio-control__sep">:</Text>
            <NumberInput buttons="sides" aria-label="Ratio height" min={1} step={1} value={h} onChange={handleHeight} />
          </Box>
          {!check.valid && <Text className="aspect-ratio-control__error">{check.error}</Text>}
        </Box>
      )}
    </Box>
  );
};

export { AspectRatioControl };
export type { AspectRatioControlProps };

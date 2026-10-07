/* @layer renderer-components @kind component */
/**
 * Aspect-ratio picker. Two modes:
 *  - Legacy (HUD): pass presetOptions → shows a single "Preset" tab.
 *  - Split (game): pass widePresets and/or tallPresets → shows "Wide" / "Tall" tabs.
 * Other tabs (Auto, Screen, Custom) are always rendered based on the options prop.
 * A recommendedNote appears in gold when the selected mode matches recommendedValue.
 */
import { useEffect, useState } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { validateCustomRatio, detectScreenRatio, screenReadout, viewportReadout, niceRatio, effectiveCustomRatio } from '@app/lib/game/aspect-ratio';
import type { RatioReadout } from '@app/lib/game/aspect-ratio';
import { useSafeAreaInsets } from '@app/hooks/useSafeAreaInsets';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import type { SegmentOption } from '../../../../../design-system/primitives/SegmentedControl';
import { Stepper } from '../../../../../design-system/primitives/Stepper';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import './AspectRatioControl.css';

interface AspectRatioControlProps {
  label: string;
  description?: string;
  value: string;
  options: SegmentOption[];
  /** Legacy HUD usage, a single flat preset row. */
  presetOptions?: SegmentOption[];
  /** Game usage, the wide preset row (shown when mode = 'wide'). */
  widePresets?: SegmentOption[];
  /** Game usage, the tall preset row (shown when mode = 'tall'). Omit when tall rendering is off. */
  tallPresets?: SegmentOption[];
  /** Per-mode description text. */
  descriptions?: Record<string, string>;
  /** Mode value that gets a gold "Recommended" note. */
  recommendedValue?: string;
  /** Note shown in gold when the selected mode equals recommendedValue. */
  recommendedNote?: string;
  customW: number;
  customH: number;
  ratioKey: 'aspectRatio' | 'hudRatio';
  wKey: 'customAspectW' | 'customHudAspectW';
  hKey: 'customAspectH' | 'customHudAspectH';
  renderIntoNotch?: boolean;
  onChange: (patch: Partial<GameSettings>) => void;
}

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

  // Resolve which top-level tab the current value belongs to
  const wideValues = new Set((widePresets ?? []).map((o) => o.value));
  const tallValues = new Set((tallPresets ?? []).map((o) => o.value));
  const presetValues = new Set((presetOptions ?? []).map((o) => o.value));
  let mainValue = value;
  if (widePresets && wideValues.has(value)) mainValue = 'wide';
  else if (tallPresets && tallValues.has(value)) mainValue = 'tall';
  else if (presetOptions && presetValues.has(value)) mainValue = 'preset';

  const handleMain = (next: string) => {
    if (next === 'wide') {
      const fallback = widePresets?.[0]?.value ?? '16:9';
      onChange({ [ratioKey]: wideValues.has(value) ? value : fallback } as Partial<GameSettings>);
    } else if (next === 'tall') {
      const fallback = tallPresets?.[0]?.value ?? '3:4';
      onChange({ [ratioKey]: tallValues.has(value) ? value : fallback } as Partial<GameSettings>);
    } else if (next === 'preset') {
      const fallback = presetOptions?.[0]?.value ?? '16:9';
      onChange({ [ratioKey]: presetValues.has(value) ? value : fallback } as Partial<GameSettings>);
    } else if (next === 'custom' && !(customW > 0 && customH > 0)) {
      const d = detectScreenRatio(renderIntoNotch);
      onChange({ [ratioKey]: 'custom', [wKey]: d.w, [hKey]: d.h } as Partial<GameSettings>);
    } else {
      onChange({ [ratioKey]: next } as Partial<GameSettings>);
    }
  };

  const commit = (nw: number, nh: number) => {
    setW(nw); setH(nh);
    if (validateCustomRatio(nw, nh).valid) onChange({ [wKey]: nw, [hKey]: nh } as Partial<GameSettings>);
  };

  const check = validateCustomRatio(w, h);
  const isRecommended = !!recommendedValue && mainValue === recommendedValue;

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
          <SegmentedControl value={value} options={widePresets} onChange={(v) => onChange({ [ratioKey]: v } as Partial<GameSettings>)} />
        </Box>
      )}
      {mainValue === 'tall' && tallPresets && (
        <Box className="aspect-ratio-control__custom">
          <SegmentedControl value={value} options={tallPresets} onChange={(v) => onChange({ [ratioKey]: v } as Partial<GameSettings>)} />
        </Box>
      )}
      {mainValue === 'preset' && presetOptions && (
        <Box className="aspect-ratio-control__custom">
          <SegmentedControl value={value} options={presetOptions} onChange={(v) => onChange({ [ratioKey]: v } as Partial<GameSettings>)} />
        </Box>
      )}
      {mainValue === 'auto' && renderReadout(viewportReadout(renderIntoNotch))}
      {mainValue === 'screen' && renderReadout(screenReadout(true))}
      {value === 'custom' && (
        <Box className="aspect-ratio-control__custom">
          <Box className="aspect-ratio-control__fields">
            <Stepper ariaLabel="Ratio width" min={1} step={1} value={w} onChange={(n) => commit(n, h)} />
            <Text className="aspect-ratio-control__sep">:</Text>
            <Stepper ariaLabel="Ratio height" min={1} step={1} value={h} onChange={(n) => commit(w, n)} />
          </Box>
          {!check.valid && <Text className="aspect-ratio-control__error">{check.error}</Text>}
        </Box>
      )}
    </Box>
  );
};

export { AspectRatioControl };
export type { AspectRatioControlProps };

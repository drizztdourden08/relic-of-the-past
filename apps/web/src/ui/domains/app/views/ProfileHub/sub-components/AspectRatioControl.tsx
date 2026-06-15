/* @layer renderer-components @kind component */
/**
 * Aspect-ratio picker shared by the Screen and HUD settings. A top-level segmented selector; when
 * `presetOptions` is given, the concrete preset strings ('4:3'…) are grouped under a single "Preset"
 * entry that reveals a second selector. Other entries reveal their own sub-UI when chosen:
 *   custom → W:H steppers · auto → live viewport readout · screen → device-screen readout.
 * A per-option description (from `descriptions`) shows under the selector. HUD passes no presetOptions,
 * so it keeps its original flat behavior.
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
  /** Preset strings shown in the second selector when the "preset" entry is chosen (enables grouping). */
  presetOptions?: SegmentOption[];
  /** Per-(main-)option help text shown under the selector. */
  descriptions?: Record<string, string>;
  customW: number;
  customH: number;
  ratioKey: 'aspectRatio' | 'hudRatio';
  wKey: 'customAspectW' | 'customHudAspectW';
  hKey: 'customAspectH' | 'customHudAspectH';
  /** When false, auto / custom-auto detection trims the camera-cutout insets. */
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
        Calculated: {used.w}:{used.h}{r.capped ? ' — capped (engine limit)' : ''}
      </Text>
    </Box>
  );
};

const AspectRatioControl = (props: AspectRatioControlProps) => {
  const { label, description, value, options, presetOptions, descriptions, customW, customH, ratioKey, wKey, hKey, renderIntoNotch = true, onChange } = props;

  // Re-render when the viewport / cutout insets change so the auto + screen readouts stay live.
  useSafeAreaInsets();
  const eff = effectiveCustomRatio(customW, customH, renderIntoNotch);
  const [w, setW] = useState(eff.w);
  const [h, setH] = useState(eff.h);

  useEffect(() => {
    setW(eff.w);
    setH(eff.h);
  }, [eff.w, eff.h]);

  const presetValues = new Set((presetOptions ?? []).map((o) => o.value));
  const grouped = presetOptions != null && options.some((o) => o.value === 'preset');
  const mainValue = grouped && presetValues.has(value) ? 'preset' : value;
  const check = validateCustomRatio(w, h);

  const handleMain = (next: string) => {
    if (next === 'preset') {
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
    setW(nw);
    setH(nh);
    if (validateCustomRatio(nw, nh).valid) {
      onChange({ [wKey]: nw, [hKey]: nh } as Partial<GameSettings>);
    }
  };

  return (
    <Box className="aspect-ratio-control">
      <SegmentedControl
        label={label}
        description={descriptions?.[mainValue] ?? description}
        value={mainValue}
        options={options}
        onChange={handleMain}
      />

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

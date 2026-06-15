/* @layer renderer-components @kind component */
/**
 * Aspect-ratio picker shared by the Screen and HUD settings: a segmented preset selector plus, when
 * "Custom" is chosen, two W:H number inputs validated against the render bounds (wider than 4:3 is
 * allowed, taller is not). Selecting Custom while no custom value is set pre-fills the device screen
 * ratio. The setting keys are passed in so the same control drives both aspectRatio and hudRatio.
 */
import { useEffect, useState } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { validateCustomRatio, detectScreenRatio, effectiveCustomRatio } from '@app/lib/game/aspect-ratio';
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
  customW: number;
  customH: number;
  ratioKey: 'aspectRatio' | 'hudRatio';
  wKey: 'customAspectW' | 'customHudAspectW';
  hKey: 'customAspectH' | 'customHudAspectH';
  onChange: (patch: Partial<GameSettings>) => void;
}

const AspectRatioControl = (props: AspectRatioControlProps) => {
  const { label, description, value, options, customW, customH, ratioKey, wKey, hKey, onChange } = props;

  const eff = effectiveCustomRatio(customW, customH);
  const [w, setW] = useState(eff.w);
  const [h, setH] = useState(eff.h);

  // Resync the draft when the stored ratio changes externally (e.g. the prefill-on-select below).
  useEffect(() => {
    setW(eff.w);
    setH(eff.h);
  }, [eff.w, eff.h]);

  const check = validateCustomRatio(w, h);

  const handleRatio = (next: string) => {
    if (next === 'custom' && !(customW > 0 && customH > 0)) {
      const d = detectScreenRatio();
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
      <SegmentedControl label={label} description={description} value={value} options={options} onChange={handleRatio} />
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

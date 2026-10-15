/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { viewportReadout, screenReadout, niceRatio } from '@rotp/game-core';
import type { RatioReadout } from '@rotp/game-core';
import { useSafeAreaInsets } from '@drizztdourden08/brock-react';
import { SegmentedControl, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { AspectRatioControlProps } from './AspectRatioControl.type';
import { PRESET_GROUP_IDS } from './AspectRatioControl.constants';
import { mainValueOf } from './behavior/main-value-of';
import { ratioChangeFor } from './behavior/ratio-change-for';
import { useRatioPair } from './behavior/useRatioPair';
import { RatioPairFields } from './sub-components/RatioPairFields';
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
  const pair = useRatioPair({ customW, customH, renderIntoNotch, wKey, hKey, onChange });
  const groups = useMemo(
    () => ({ wide: widePresets, tall: tallPresets, preset: presetOptions }),
    [widePresets, tallPresets, presetOptions],
  );
  const mainValue = mainValueOf(value, groups);

  const handleMain = useCallback((next: string) => {
    onChange(ratioChangeFor(next, { value, groups, customW, customH, renderIntoNotch, ratioKey, wKey, hKey }));
  }, [value, groups, customW, customH, renderIntoNotch, ratioKey, wKey, hKey, onChange]);

  const handlePreset = useCallback(
    (v: string) => onChange({ [ratioKey]: v }),
    [onChange, ratioKey],
  );

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
      {PRESET_GROUP_IDS.map((id) => {
        const groupOptions = groups[id];
        return mainValue === id && groupOptions && (
          <Box key={id} className="aspect-ratio-control__custom">
            <SegmentedControl value={value} options={groupOptions} onChange={handlePreset} />
          </Box>
        );
      })}
      {mainValue === 'auto' && renderReadout(viewportReadout(renderIntoNotch))}
      {mainValue === 'screen' && renderReadout(screenReadout(true))}
      {value === 'custom' && (
        <RatioPairFields w={pair.w} h={pair.h} check={pair.check} onWidth={pair.handleWidth} onHeight={pair.handleHeight} />
      )}
    </Box>
  );
};

export { AspectRatioControl };

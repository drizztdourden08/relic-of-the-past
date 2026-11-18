/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import { resolveAudioConfig } from '@rotp/features';
import type { GameSettings } from '@rotp/features';
import { KeyedControlRow } from '../KeyedControlRow';
import { textOptions } from '../text-options';
import { MsuDetectedSummary } from './MsuDetectedSummary';
import { MSU_OPTIONS } from './audio-controls.constants';
import { useActiveMsuPack } from './useActiveMsuPack';
import type { ControlContext } from '../settings-controls.type';

const MsuFormatRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const text = useText();
  const pack = useActiveMsuPack();
  const handleChange = useCallback((value: string) => onChange({ enableMSU: value as GameSettings['enableMSU'] }), [onChange]);
  if (settings.msuConfigMode === 'auto') return <MsuDetectedSummary pack={pack} resolved={resolveAudioConfig(settings, pack)} />;
  return <KeyedControlRow settingKey="enableMSU" input={{ kind: 'select', value: settings.enableMSU, options: textOptions(MSU_OPTIONS, text), onChange: handleChange }} disabled={disabled} />;
};

export { MsuFormatRow };

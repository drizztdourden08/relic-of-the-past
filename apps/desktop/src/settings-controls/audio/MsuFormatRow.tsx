/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { resolveAudioConfig } from '@rotp/features';
import type { GameSettings } from '@rotp/features';
import { KeyedControlRow } from '../KeyedControlRow';
import { MsuDetectedSummary } from './MsuDetectedSummary';
import { MSU_OPTIONS } from './audio-controls.constants';
import { useActiveMsuPack } from './useActiveMsuPack';
import type { ControlContext } from '../settings-controls.type';

const MsuFormatRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const pack = useActiveMsuPack();
  const handleChange = useCallback((value: string) => onChange({ enableMSU: value as GameSettings['enableMSU'] }), [onChange]);
  if (settings.msuConfigMode === 'auto') return <MsuDetectedSummary pack={pack} resolved={resolveAudioConfig(settings, pack)} />;
  return <KeyedControlRow settingKey="enableMSU" input={{ kind: 'select', value: settings.enableMSU, options: MSU_OPTIONS, onChange: handleChange }} disabled={disabled} />;
};

export { MsuFormatRow };

/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { resolveAudioConfig } from '@shared/features/msu-auto-config';
import type { GameSettings } from '@shared/types/settings';
import { KeyedControlRow } from '../ControlRow';
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

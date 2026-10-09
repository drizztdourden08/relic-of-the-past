/* @layer renderer-components @kind component */
import { useCallback, useMemo, type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { buildDisplaySection } from './SettingsView.display';
import { buildCameraSection } from './build-camera-section';
import { buildWindowSection } from './build-window-section';
import { buildPerformanceSection } from './build-performance-section';
import { CAMERA_OFF_MESSAGE, TALL_PRESETS } from './SettingsView.constants';
import { renderDisplayControl } from './SettingsView.controls';
import { withAspectCascade } from './with-aspect-cascade';
import { useRefreshRate } from '../../../../../../hooks/useRefreshRate';
import { useSyncedRate } from '../../../../../../hooks/useSyncedRate';
import { effectiveHz } from '@shared/display/refresh-rate';
import type { ChoiceOption, SettingsViewProps } from './SettingsView.type';

const getWidePresets = (s: GameSettings): ChoiceOption[] => {
  const presets = [
    { value: '4:3', label: '4:3' },
    { value: '16:9', label: '16:9' },
    { value: '16:10', label: '16:10' },
  ];
  if (s.linearWorldTilemap) presets.push({ value: '21:9', label: '21:9' });
  if (s.linearWorldTilemap && s.ultrawideRendering) presets.push({ value: '32:9', label: '32:9' });
  return presets;
};

const getAspectOptions = (s: GameSettings): ChoiceOption[] => {
  const opts = [
    { value: 'auto', label: 'Auto' },
    { value: 'screen', label: 'Screen' },
    { value: 'wide', label: 'Wide' },
  ];
  if (s.tallRendering) opts.push({ value: 'tall', label: 'Tall' });
  opts.push({ value: 'custom', label: 'Custom' });
  return opts;
};

const SettingsView = (props: SettingsViewProps) => {
  const { settings, onChange, part = 'display' } = props;
  const handleChange = useCallback(
    (patch: Partial<GameSettings>) => onChange(withAspectCascade(patch, settings)),
    [onChange, settings],
  );

  const detectedHz = effectiveHz(useRefreshRate());
  const { status: syncedRate } = useSyncedRate(settings.syncedRefreshRate, settings.syncedRefreshRateHz);

  const sections = useMemo<Section[]>(() => {
    if (part === 'camera') {
      const camera = buildCameraSection(settings);
      return camera ? [camera] : [];
    }
    if (part === 'window') return [buildWindowSection(settings)];
    return [buildDisplaySection(settings), buildPerformanceSection(detectedHz, syncedRate)];
  }, [part, settings, detectedHz, syncedRate]);

  const renderControl = useCallback(
    (key: string, s: GameSettings, change: (patch: Partial<GameSettings>) => void): ReactNode | null =>
      renderDisplayControl({
        key,
        settings: s,
        onChange: change,
        aspectOptions: getAspectOptions(s),
        widePresets: getWidePresets(s),
        tallPresets: s.tallRendering ? TALL_PRESETS : undefined,
        syncedRate,
        detectedHz,
      }),
    [syncedRate, detectedHz],
  );

  return (
    <SettingsLayout
      sections={sections}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={handleChange}
      renderControl={renderControl}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
      emptyMessage={part === 'camera' ? CAMERA_OFF_MESSAGE : undefined}
    />
  );
};

export { SettingsView };
export type { SettingsViewProps };

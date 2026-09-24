/* @layer renderer-components @kind component */
/**
 * How the game reaches the screen, drawn as three tabs that share one set of controls and
 * cascades: Display (rendering geometry and frame pacing), Camera, and Window.
 */
import { useMemo, type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { buildDisplaySection, buildCameraSection } from './SettingsView.display';
import { buildWindowSection, buildPerformanceSection } from './SettingsView.constants';
import { renderDisplayControl } from './SettingsView.controls';
import { useRefreshRate } from '../../../../../../hooks/useRefreshRate';
import { useSyncedRate } from '../../../../../../hooks/useSyncedRate';
import { effectiveHz } from '@shared/display/refresh-rate';

interface SettingsViewProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  /** Which of the three tabs this subject is split across. */
  part?: 'display' | 'camera' | 'window';
}

const CAMERA_OFF_MESSAGE = 'Camera options appear once Extended Rendering is on, in Display.';

// Wide preset values that require linearWorldTilemap to be valid
const REQUIRES_LINEAR = new Set(['21:9']);
// Wide preset values that additionally require ultrawideRendering
const REQUIRES_ULTRAWIDE = new Set(['32:9']);
// Tall preset values, only shown when tallRendering is on
const TALL_PRESET_VALUES = new Set(['4:5', '3:4']);

const getWidePresets = (s: GameSettings) => {
  const presets = [
    { value: '4:3', label: '4:3' },
    { value: '16:9', label: '16:9' },
    { value: '16:10', label: '16:10' },
  ];
  if (s.linearWorldTilemap) presets.push({ value: '21:9', label: '21:9' });
  if (s.linearWorldTilemap && s.ultrawideRendering) presets.push({ value: '32:9', label: '32:9' });
  return presets;
};

const TALL_PRESETS = [
  { value: '4:5', label: '4:5' },
  { value: '3:4', label: '3:4' },
];

const getAspectOptions = (s: GameSettings) => {
  const opts = [
    { value: 'auto', label: 'Auto' },
    { value: 'screen', label: 'Screen' },
    { value: 'wide', label: 'Wide' },
  ];
  if (s.tallRendering) opts.push({ value: 'tall', label: 'Tall' });
  opts.push({ value: 'custom', label: 'Custom' });
  return opts;
};

// Cascade resets when a capability is disabled, so the active ratio stays valid.
const withCascade = (patch: Partial<GameSettings>, current: GameSettings): Partial<GameSettings> => {
  const cascade = { ...patch };
  if ('linearWorldTilemap' in patch && !patch.linearWorldTilemap) {
    if (REQUIRES_LINEAR.has(current.aspectRatio) || REQUIRES_ULTRAWIDE.has(current.aspectRatio)) {
      cascade.aspectRatio = '16:9';
    }
    cascade.ultrawideRendering = false;
    cascade.tallRendering = false;
  }
  if ('ultrawideRendering' in patch && !patch.ultrawideRendering) {
    if (REQUIRES_ULTRAWIDE.has(current.aspectRatio)) cascade.aspectRatio = '21:9';
  }
  if ('tallRendering' in patch && !patch.tallRendering) {
    if (TALL_PRESET_VALUES.has(current.aspectRatio)) cascade.aspectRatio = '4:3';
  }
  return cascade;
};

const SettingsView = (props: SettingsViewProps) => {
  const { settings, onChange, part = 'display' } = props;
  const handleChange = (patch: Partial<GameSettings>) => onChange(withCascade(patch, settings));

  const detectedHz = effectiveHz(useRefreshRate());
  // Pushing the preference here also arms it for the session; the host applies it on the next
  // fullscreen transition, not on this call.
  const { status: syncedRate } = useSyncedRate(settings.syncedRefreshRate, settings.syncedRefreshRateHz);

  const sections = useMemo<Section[]>(() => {
    if (part === 'camera') {
      const camera = buildCameraSection(settings);
      return camera ? [camera] : [];
    }
    if (part === 'window') return [buildWindowSection(settings)];
    return [buildDisplaySection(settings), buildPerformanceSection(detectedHz, syncedRate)];
  }, [part, settings, detectedHz, syncedRate]);

  const renderControl = (key: string, s: GameSettings, change: (patch: Partial<GameSettings>) => void): ReactNode | null =>
    renderDisplayControl({
      key,
      settings: s,
      onChange: change,
      aspectOptions: getAspectOptions(s),
      widePresets: getWidePresets(s),
      tallPresets: s.tallRendering ? TALL_PRESETS : undefined,
      syncedRate,
      detectedHz,
    });

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

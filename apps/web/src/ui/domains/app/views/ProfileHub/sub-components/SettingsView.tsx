/* @layer renderer-components @kind component */
import { useMemo, type ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../compounds/SettingsLayout';
import { AspectRatioControl } from './AspectRatioControl';
import { buildDisplaySection, buildCameraSection } from './SettingsView.display';

interface SettingsViewProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

// Wide preset values that require linearWorldTilemap to be valid
const REQUIRES_LINEAR = new Set(['21:9']);
// Wide preset values that additionally require ultrawideRendering
const REQUIRES_ULTRAWIDE = new Set(['32:9']);
// Tall preset values — only shown when tallRendering is on
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

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  auto: "Matches the window size — adapts to notch, resize, and rotation automatically.",
  screen: "Matches the full physical screen ratio.",
  wide: 'Choose a standard widescreen preset.',
  tall: 'Choose a tall (portrait-style) preset.',
  custom: 'Set an exact width : height ratio.',
};

// Cascade resets when a capability is disabled: ensure the active ratio is still valid.
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

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  if (key !== 'aspectRatio') return null;
  return (
    <AspectRatioControl
      label="Aspect Ratio"
      description="Screen aspect ratio for the game content."
      value={settings.aspectRatio}
      options={getAspectOptions(settings)}
      widePresets={getWidePresets(settings)}
      tallPresets={settings.tallRendering ? TALL_PRESETS : undefined}
      descriptions={ASPECT_DESCRIPTIONS}
      recommendedValue="auto"
      recommendedNote="Best for most setups — follows your window and adapts to notch or resize."
      customW={settings.customAspectW}
      customH={settings.customAspectH}
      ratioKey="aspectRatio"
      wKey="customAspectW"
      hKey="customAspectH"
      renderIntoNotch={settings.renderIntoNotch}
      onChange={onChange}
    />
  );
};

const SettingsView = (props: SettingsViewProps) => {
  const { settings, onChange } = props;
  const handleChange = (patch: Partial<GameSettings>) => onChange(withCascade(patch, settings));

  const sections = useMemo<Section[]>(() => {
    const camera = buildCameraSection(settings);
    return [buildDisplaySection(settings), ...(camera ? [camera] : [])];
  }, [settings]);

  return (
    <SettingsLayout
      sections={sections}
      settings={settings}
      onChange={handleChange}
      renderControl={renderControl}
    />
  );
};

export { SettingsView };
export type { SettingsViewProps };

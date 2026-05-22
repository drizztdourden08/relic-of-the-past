import type { GameSettings } from '@shared/types/settings';
import { Toggle } from '../../../primitives/Toggle';
import { RadioGroup } from '../../../primitives/RadioGroup';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { Slider } from '../../../primitives/Slider';
import { SettingsSection } from '../../../composites/SettingsSection';

interface GraphicsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const ASPECT_OPTIONS = [
  { value: '4:3' as const, label: '4:3', description: 'Original' },
  { value: '16:9' as const, label: '16:9', description: 'Widescreen' },
  { value: '16:10' as const, label: '16:10', description: 'Steam Deck' },
  { value: '18:9' as const, label: '18:9', description: 'Ultrawide' },
];

const FULLSCREEN_OPTIONS = [
  { value: '0', label: 'Windowed' },
  { value: '1', label: 'Borderless' },
  { value: '2', label: 'Fullscreen' },
];

const OUTPUT_OPTIONS = [
  { value: 'SDL', label: 'SDL' },
  { value: 'SDL-Software', label: 'SDL Software' },
  { value: 'OpenGL', label: 'OpenGL' },
  { value: 'OpenGL ES', label: 'OpenGL ES' },
];

const GraphicsSettings = (props: GraphicsSettingsProps) => {
  const { settings, onChange } = props;
  return (
    <div className="settings-tab">
      <SettingsSection title="Display">
        <RadioGroup
          label="Aspect Ratio"
          value={settings.aspectRatio}
          options={ASPECT_OPTIONS}
          onChange={(v) => onChange({ aspectRatio: v })}
        />
        <Toggle
          label="Extend Y"
          description="Show 240 lines instead of 224"
          checked={settings.extendY}
          onChange={(v) => onChange({ extendY: v })}
        />
        <Toggle
          label="Unchanged Sprites"
          description="Don't change sprite spawn/despawn for widescreen"
          checked={settings.unchangedSprites}
          onChange={(v) => onChange({ unchangedSprites: v })}
        />
        <Toggle
          label="No Visual Fixes"
          description="Skip widescreen graphics corrections"
          checked={settings.noVisualFixes}
          onChange={(v) => onChange({ noVisualFixes: v })}
        />
      </SettingsSection>

      <SettingsSection title="Window" description="Not available — Electron controls the window">
        <SegmentedControl
          label="Fullscreen Mode"
          value={String(settings.fullscreen)}
          options={FULLSCREEN_OPTIONS}
          onChange={(v) => onChange({ fullscreen: Number(v) as 0 | 1 | 2 })}
          disabled
        />
        <Slider
          label="Window Scale"
          value={settings.windowScale}
          min={1}
          max={5}
          step={1}
          formatValue={(v) => `${v}x`}
          onChange={(v) => onChange({ windowScale: v })}
          disabled
        />
      </SettingsSection>

      <SettingsSection title="Rendering">
        <SegmentedControl
          label="Render Method"
          value={settings.outputMethod}
          options={OUTPUT_OPTIONS}
          onChange={(v) => onChange({ outputMethod: v as GameSettings['outputMethod'] })}
          disabled
        />
        <Toggle
          label="Optimized SNES PPU"
          description="Use the optimized PPU implementation"
          checked={settings.newRenderer}
          onChange={(v) => onChange({ newRenderer: v })}
        />
        <Toggle
          label="Enhanced Mode7"
          description="High-resolution world map display"
          checked={settings.enhancedMode7}
          onChange={(v) => onChange({ enhancedMode7: v })}
        />
        <Toggle
          label="No Sprite Limit"
          description="Remove the SNES 8 sprites per scanline limit"
          checked={settings.noSpriteLimits}
          onChange={(v) => onChange({ noSpriteLimits: v })}
        />
        <Toggle
          label="Linear Filtering"
          description="Smoother pixels (less crisp)"
          checked={settings.linearFiltering}
          onChange={(v) => onChange({ linearFiltering: v })}
        />
        <Toggle
          label="Dim Flashes"
          description="Reduce screen flashing effects (Virtual Console style)"
          checked={settings.dimFlashes}
          onChange={(v) => onChange({ dimFlashes: v })}
        />
      </SettingsSection>

      <SettingsSection title="Post-Processing">
        <Toggle
          label="Edge Glow"
          description="Ambient glow effect around screen edges during widescreen"
          checked={settings.overworldEdgeEffect}
          onChange={(v) => onChange({ overworldEdgeEffect: v })}
        />
        <Toggle
          label="Shadow Casting"
          description="Heightmap-based dynamic shadows and lighting overlay"
          checked={settings.postProcessingShadows}
          onChange={(v) => onChange({ postProcessingShadows: v })}
        />
      </SettingsSection>
    </div>
  );
}

export { GraphicsSettings };

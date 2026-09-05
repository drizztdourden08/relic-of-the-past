/* @layer renderer-components @kind data */
/**
 * Builds the Display and Camera sections dynamically from current settings.
 *
 * Display order when Extended Rendering is on:
 *   1. Capability toggles first. You enable a capability, then the picker below reflects it
 *   2. Aspect ratio picker, showing only the presets the enabled capabilities have unlocked
 *   3. Sprite / AI behaviour
 *
 * Camera is a separate section (same Extended Rendering gate, all off by default).
 */
import type { GameSettings } from '@shared/types/settings';
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';

const EXTENDED_TOGGLE: SettingItem = {
  key: 'extendedRendering',
  label: 'Extended Rendering',
  description: 'Enables widescreen, tall, and camera enhancements. Off = fixed 4:3 vanilla.',
  keywords: 'widescreen wide tall ultrawide extended aspect ratio ppu resolution vanilla',
};

const buildDisplaySection = (s: GameSettings): Section => {
  const items: SettingItem[] = [EXTENDED_TOGGLE];

  if (!s.extendedRendering) {
    return { id: 'display', title: 'Display', subsections: [{ id: 'display-main', title: 'Rendering', items }] };
  }

  // 1. Capability toggles, which unlock options in the picker below
  items.push({
    key: 'linearWorldTilemap',
    label: 'Linear World Tilemap',
    description: 'Enables clean rendering above 19:9 by replacing the wrapping SNES BG with a clamped linear read. Unlocks the 21:9 wide preset.',
    keywords: 'linear tilemap world bg wrap 21:9 ultrawide memory overworld',
  });

  if (s.linearWorldTilemap) {
    items.push({
      key: 'ultrawideRendering',
      label: 'Ultrawide',
      description: 'Unlocks ratios above 19:9 up to 32:9. Requires Linear World Tilemap.',
      keywords: 'ultrawide 32:9 super ultrawide',
    });
  }

  items.push({
    key: 'tallRendering',
    label: 'Tall Rendering',
    description: 'Adds extra rows above and below, which enables tall presets in the picker. Separate from widescreen.',
    keywords: 'tall portrait vertical aspect ratio height rows',
  });

  // 2. Aspect ratio picker, which reflects the capabilities above
  items.push(
    {
      key: 'aspectRatio',
      label: 'Aspect Ratio',
      description: 'Screen aspect ratio. Presets unlock as you enable capabilities above.',
      keywords: 'widescreen 4:3 16:9 16:10 21:9 32:9 tall 3:4 custom auto detect',
    },
    {
      key: 'extendY',
      label: 'Extend Y',
      description: 'Show 240 lines instead of 224.',
      keywords: 'height resolution vertical 240',
    },
  );

  // ── 3. Sprite / AI behaviour (only relevant for non-4:3) ─────────────────────
  const isWide = s.aspectRatio !== '4:3';
  if (isWide) {
    items.push(
      {
        key: 'widescreenSprites',
        label: 'Widescreen Sprites',
        description: 'Extend sprite spawn ranges so enemies and objects behave correctly in the wider view.',
        keywords: 'sprites widescreen spawn despawn ranges',
      },
      {
        key: 'widescreenVisualFixes',
        label: 'Widescreen Visual Fixes',
        description: 'Apply graphics corrections for the wider view (edges and sprites that assume a 4:3 screen).',
        keywords: 'visual fixes widescreen tiles edges',
      },
      {
        key: 'widescreenPlayArea',
        label: 'Extend Play Area',
        description: 'Extends game activity to the whole widescreen picture: where hazards and enemies spawn, how long enemy spawners stay active, and how much of the view a "room cleared" check looks at. Off, only the original 4:3 area counts, so the extra width you can see stays inactive. Changes gameplay.',
        keywords: 'play area hazards spawns room clear widescreen gameplay',
      },
    );
  }

  items.push({
    key: 'offscreenAI',
    label: 'Off-Screen AI',
    description: 'How enemies in the wide/tall extra band behave before reaching the original screen.',
    keywords: 'sprite AI pause idle freeze off screen wide guard enemy alarm',
  });

  return { id: 'display', title: 'Display', subsections: [{ id: 'display-main', title: 'Rendering', items }] };
};

const buildCameraSection = (s: GameSettings): Section | null => {
  if (!s.extendedRendering) return null;

  const items: SettingItem[] = [
    {
      key: 'cameraLockToViewport',
      label: 'Lock Camera to View',
      description: 'Pins the rendered view to the area boundary, so there is no out-of-area black space. Off = original camera (speedrun/glitch parity).',
      keywords: 'camera lock viewport edge black border bound speedrun glitch wide tall',
    },
  ];

  if (s.cameraLockToViewport) {
    items.push({
      key: 'smoothTransitions',
      label: 'Smooth Transitions',
      description: 'Pans through area seams via a 2-area tilemap, which removes the wrapped-edge slice at screen boundaries. Requires camera lock.',
      keywords: 'smooth transition scroll area seam tilemap',
    });
  }

  return { id: 'camera', title: 'Camera', subsections: [{ id: 'camera-main', title: 'Behaviour', items }] };
};

export { buildDisplaySection, buildCameraSection };

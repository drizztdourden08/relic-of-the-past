/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';
import { EXTENDED_TOGGLE } from './SettingsView.constants';

const buildDisplaySection = (s: GameSettings): Section => {
  const items: SettingItem[] = [EXTENDED_TOGGLE];

  if (!s.extendedRendering) {
    return { id: 'display', title: 'Display', items };
  }

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

  const isWide = s.aspectRatio !== '4:3';
  if (s.extendedRendering) {
    items.push({
      key: 'widescreenVisualFixes',
      label: 'Widescreen Fixes',
      description: 'Corrections for a view wider or taller than the original: transitions, effects and sprites drawn for the 4:3 screen. One switch; on by default.',
      keywords: 'visual fixes widescreen tall tiles edges transitions iris link hide',
    });
  }
  if (isWide) {
    items.push(
      {
        key: 'widescreenSprites',
        label: 'Widescreen Sprites',
        description: 'Extend sprite spawn ranges so enemies and objects behave correctly in the wider view.',
        keywords: 'sprites widescreen spawn despawn ranges',
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

  return { id: 'display', title: 'Display', items };
};

export { buildDisplaySection };

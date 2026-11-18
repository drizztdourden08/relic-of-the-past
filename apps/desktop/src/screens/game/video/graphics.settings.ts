/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Graphics', icon: 'palette', order: 2, keywords: ['graphics', 'renderer', 'filter', 'sprite', 'mode 7', 'rupees'] };

const sections: SectionDef[] = [
  {
    id: 'rendering',
    title: msg('settings-graphics:section.rendering.title'),
    subsections: [
      {
        id: 'rendering-engine',
        title: msg('settings-graphics:section.rendering-engine.title'),
        items: [
          { key: 'newRenderer', label: msg('settings-graphics:new-renderer.label'), description: msg('settings-graphics:new-renderer.description'), keywords: 'ppu renderer engine optimized fast' },
          { key: 'enhancedMode7', label: msg('settings-graphics:enhanced-mode7.label'), description: msg('settings-graphics:enhanced-mode7.description'), keywords: 'mode7 map resolution hd smooth' },
          { key: 'noSpriteLimits', label: msg('settings-graphics:no-sprite-limits.label'), description: msg('settings-graphics:no-sprite-limits.description'), keywords: 'sprite limit scanline flicker' },
        ],
      },
      {
        id: 'rendering-quality',
        title: msg('settings-graphics:section.rendering-quality.title'),
        items: [
          { key: 'linearFiltering', label: msg('settings-graphics:linear-filtering.label'), description: msg('settings-graphics:linear-filtering.description'), hint: msg('settings-graphics:linear-filtering.hint'), keywords: 'filter smooth pixel crisp bilinear' },
          { key: 'dimFlashes', label: msg('settings-graphics:dim-flashes.label'), description: msg('settings-graphics:dim-flashes.description'), keywords: 'flash dim reduce epilepsy accessibility' },
        ],
      },
    ],
  },
  {
    id: 'enhancements',
    title: msg('settings-graphics:section.enhancements.title'),
    subsections: [
      {
        id: 'enhancements-overworld',
        title: msg('settings-graphics:section.enhancements-overworld.title'),
        items: [
          { key: 'overworldEdgeEffect', label: msg('settings-graphics:overworld-edge-effect.label'), description: msg('settings-graphics:overworld-edge-effect.description'), keywords: 'edge glow mirror blur voronoi overworld widescreen border' },
        ],
      },
      {
        id: 'enhancements-items',
        title: msg('settings-graphics:section.enhancements-items.title'),
        items: [
          { key: 'coloredRupees', label: msg('settings-graphics:colored-rupees.label'), description: msg('settings-graphics:colored-rupees.description'), keywords: 'rupee rupees colour color gem gold silver purple money drop' },
          { key: 'itemSheen', label: msg('settings-graphics:item-sheen.label'), description: msg('settings-graphics:item-sheen.description'), keywords: 'sheen shine glint sparkle shimmer highlight item drop' },
        ],
      },
      {
        id: 'enhancements-indoor',
        title: msg('settings-graphics:section.enhancements-indoor.title'),
        items: [
          { key: 'hideSpaceBeyondWalls', label: msg('settings-graphics:hide-space-beyond-walls.label'), description: msg('settings-graphics:hide-space-beyond-walls.description'), keywords: 'hide space beyond walls backdrop background black indoor house cave sanctuary surround' },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    title: msg('settings-graphics:section.appearance.title'),
    items: [
      { key: 'linkSprite', label: msg('settings-graphics:link-sprite.label'), description: msg('settings-graphics:link-sprite.description'), keywords: 'player sprite character appearance custom zspr' },
    ],
  },
];

export default sections;
export { meta };

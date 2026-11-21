/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: msg('settings-picture:section.picture.title'), icon: 'image', order: 1, keywords: ['picture', 'widescreen', 'aspect ratio', 'fps', 'vsync'] };

const offscreenOptions = [
  { value: 'idle', label: msg('settings-picture:option.offscreen-options.idle.label'), hint: msg('settings-picture:option.offscreen-options.idle.hint') },
  { value: 'vanilla', label: msg('settings-picture:option.offscreen-options.vanilla.label'), hint: msg('settings-picture:option.offscreen-options.vanilla.hint') },
  { value: 'paused', label: msg('settings-picture:option.offscreen-options.paused.label'), hint: msg('settings-picture:option.offscreen-options.paused.hint') },
];

const alignOptions = [
  { value: 'center', label: msg('settings-picture:option.align-options.center.label'), hint: msg('settings-picture:option.align-options.center.hint') },
  { value: 'top', label: msg('settings-picture:option.align-options.top.label'), hint: msg('settings-picture:option.align-options.top.hint') },
  { value: 'bottom', label: msg('settings-picture:option.align-options.bottom.label'), hint: msg('settings-picture:option.align-options.bottom.hint') },
  { value: 'left', label: msg('settings-picture:option.align-options.left.label'), hint: msg('settings-picture:option.align-options.left.hint') },
  { value: 'right', label: msg('settings-picture:option.align-options.right.label'), hint: msg('settings-picture:option.align-options.right.hint') },
];

const sections: SectionDef[] = [
  {
    id: 'picture',
    title: msg('settings-picture:section.picture.title'),
    items: [
      { key: 'extendedRendering', label: msg('settings-picture:extended-rendering.label'), description: msg('settings-picture:extended-rendering.description'), keywords: 'widescreen wide tall ultrawide extended aspect ratio ppu resolution vanilla' },
      { key: 'linearWorldTilemap', label: msg('settings-picture:linear-world-tilemap.label'), description: msg('settings-picture:linear-world-tilemap.description'), hint: msg('settings-picture:linear-world-tilemap.hint'), keywords: 'linear tilemap world bg wrap 21:9 ultrawide memory overworld' },
      { key: 'ultrawideRendering', label: msg('settings-picture:ultrawide-rendering.label'), description: msg('settings-picture:ultrawide-rendering.description'), hint: msg('settings-picture:ultrawide-rendering.hint'), keywords: 'ultrawide 32:9 super ultrawide' },
      { key: 'tallRendering', label: msg('settings-picture:tall-rendering.label'), description: msg('settings-picture:tall-rendering.description'), hint: msg('settings-picture:tall-rendering.hint'), keywords: 'tall portrait vertical aspect ratio height rows' },
      { key: 'aspectRatio', label: msg('settings-picture:aspect-ratio.label'), description: msg('settings-picture:aspect-ratio.description'), keywords: 'original widescreen 4:3 16:9 16:10 21:9 32:9 tall 3:4 custom auto detect' },
      { key: 'pictureAlign', label: msg('settings-picture:picture-align.label'), description: msg('settings-picture:picture-align.description'), keywords: 'align alignment position top bottom left right center portrait vertical touch controls', control: { kind: 'choice', options: alignOptions, look: 'select' } },
      { key: 'extendY', label: msg('settings-picture:extend-y.label'), description: msg('settings-picture:extend-y.description'), keywords: 'height resolution vertical 240' },
      { key: 'widescreenVisualFixes', label: msg('settings-picture:widescreen-visual-fixes.label'), description: msg('settings-picture:widescreen-visual-fixes.description'), keywords: 'visual fixes widescreen tall tiles edges transitions iris link hide' },
      { key: 'widescreenSprites', label: msg('settings-picture:widescreen-sprites.label'), description: msg('settings-picture:widescreen-sprites.description'), hint: msg('settings-picture:widescreen-sprites.hint'), keywords: 'sprites widescreen spawn despawn ranges' },
      { key: 'widescreenPlayArea', label: msg('settings-picture:widescreen-play-area.label'), description: msg('settings-picture:widescreen-play-area.description'), keywords: 'play area hazards spawns room clear widescreen gameplay' },
      { key: 'offscreenAI', label: msg('settings-picture:offscreen-behavior.label'), description: msg('settings-picture:offscreen-behavior.description'), keywords: 'sprite behavior pause idle freeze off screen wide guard enemy alarm', control: { kind: 'choice', options: offscreenOptions } },
    ],
  },
  {
    id: 'performance',
    title: msg('settings-picture:section.performance.title'),
    items: [
      { key: 'displayPerfInTitle', label: msg('settings-picture:display-perf-in-title.label'), description: msg('settings-picture:display-perf-in-title.description'), keywords: 'fps performance frame rate counter refresh rate hz' },
      { key: 'vsync', label: msg('settings-picture:vsync.label'), description: msg('settings-picture:vsync.description'), hint: msg('settings-picture:vsync.hint'), keywords: 'vsync v-sync tearing judder stutter frame pacing refresh rate smooth scrolling 60hz' },
    ],
  },
];

export default sections;
export { meta };

/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Picture', icon: 'image', order: 1, keywords: ['picture', 'widescreen', 'aspect ratio', 'fps', 'vsync'] };

const offscreenOptions = [
  { value: 'idle', label: 'Idle', hint: 'Enemies in the extra width walk and animate normally, but will not chase, shoot or hurt you until they reach the original 4:3 screen. You can still hit them.' },
  { value: 'vanilla', label: 'Act normally', hint: 'Enemies behave fully everywhere, including chasing, shooting and hurting you from the extra width you can see but the original game could not. Matches the original game.' },
  { value: 'paused', label: 'Freeze', hint: 'Enemies in the extra width stop completely, mid-step, until they reach the original 4:3 screen. No movement, no animation, and no shadow.' },
];

const sections: Section[] = [
  {
    id: 'picture',
    title: 'Picture',
    items: [
      { key: 'extendedRendering', label: 'Extended Rendering', description: 'Enables widescreen, tall and camera enhancements. Off is fixed 4:3.', hint: '', keywords: 'widescreen wide tall ultrawide extended aspect ratio ppu resolution vanilla' },
      { key: 'linearWorldTilemap', label: 'Linear World Tilemap', description: 'Clean rendering above 19:9. Unlocks the 21:9 wide preset.', hint: 'Turning it off drops any ratio wider than 16:9 and switches Ultrawide and Tall off. Needs Extended Rendering.', keywords: 'linear tilemap world bg wrap 21:9 ultrawide memory overworld' },
      { key: 'ultrawideRendering', label: 'Ultrawide', description: 'Unlocks ratios above 19:9 up to 32:9. Requires Linear World Tilemap.', hint: 'Turning it off moves a 32:9 picture back to 21:9.', keywords: 'ultrawide 32:9 super ultrawide' },
      { key: 'tallRendering', label: 'Tall Rendering', description: 'Adds extra rows above and below, which enables tall presets in the picker. Separate from widescreen.', hint: 'Turning it off puts a tall picture back to 4:3.', keywords: 'tall portrait vertical aspect ratio height rows' },
      { key: 'aspectRatio', label: 'Aspect Ratio', description: 'Original uses the game width. Wide, Tall, Auto, Screen and Custom use 240 lines.', hint: '', keywords: 'original widescreen 4:3 16:9 16:10 21:9 32:9 tall 3:4 custom auto detect' },
      { key: 'extendY', label: 'Extend Y', description: 'In Original mode, show 240 lines instead of 224.', hint: '', keywords: 'height resolution vertical 240' },
      { key: 'widescreenVisualFixes', label: 'Widescreen Fixes', description: 'Corrections for a view wider or taller than the original: transitions, effects and sprites drawn for the 4:3 screen. One switch; on by default.', hint: '', keywords: 'visual fixes widescreen tall tiles edges transitions iris link hide' },
      { key: 'widescreenSprites', label: 'Widescreen Sprites', description: 'Extend sprite spawn ranges so enemies and objects behave as intended in the wider view.', hint: 'Needs a ratio wider than 4:3.', keywords: 'sprites widescreen spawn despawn ranges' },
      { key: 'widescreenPlayArea', label: 'Extend Play Area', description: 'Extends game activity to the whole widescreen picture: where hazards and enemies spawn and stay active. Off, the extra width you can see stays inactive. Changes gameplay.', hint: '', keywords: 'play area hazards spawns room clear widescreen gameplay' },
      { key: 'offscreenAI', label: 'Off-Screen AI', description: 'How enemies in the wide/tall extra band behave before reaching the original screen.', hint: '', keywords: 'sprite AI pause idle freeze off screen wide guard enemy alarm', control: { kind: 'choice', options: offscreenOptions } },
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    items: [
      { key: 'displayPerfInTitle', label: 'Show FPS', description: 'Display the current frames per second, and the refresh rate of your display, in the title bar while the game is running', hint: '', keywords: 'fps performance frame rate counter refresh rate hz' },
      { key: 'vsync', label: 'V-Sync', description: 'Paces the game against the display refresh rate instead of an internal timer, which smooths scrolling.', hint: 'Game speed stays the same either way.', keywords: 'vsync v-sync tearing judder stutter frame pacing refresh rate smooth scrolling 60hz' },
    ],
  },
];

export default sections;
export { meta };

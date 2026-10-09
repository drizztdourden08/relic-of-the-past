/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Display', icon: 'monitor', order: 1, keywords: ['display', 'widescreen', 'aspect ratio', 'refresh rate', 'fps', 'vsync'] };

const offscreenOptions = [
  { value: 'idle', label: 'Idle', hint: 'Enemies in the extra width walk and animate normally, but will not chase, shoot or hurt you until they reach the original 4:3 screen. You can still hit them.' },
  { value: 'vanilla', label: 'Act normally', hint: 'Enemies behave fully everywhere, including chasing, shooting and hurting you from the extra width you can see but the original game could not. Matches the original game.' },
  { value: 'paused', label: 'Freeze', hint: 'Enemies in the extra width stop completely, mid-step, until they reach the original 4:3 screen. No movement, no animation, and no shadow.' },
];

const syncedRateKeywords = 'refresh rate hz synced sync fullscreen full screen display mode monitor 60 120 144 multiple judder stutter';

const sections: Section[] = [
  {
    id: 'display',
    title: 'Display',
    items: [
      { key: 'extendedRendering', label: 'Extended Rendering', description: 'Enables widescreen, tall, and camera enhancements. Off = fixed 4:3 vanilla.', hint: 'On, the wide, tall and camera options below come alive. Off, the game draws the original 4:3 picture.', keywords: 'widescreen wide tall ultrawide extended aspect ratio ppu resolution vanilla' },
      { key: 'linearWorldTilemap', label: 'Linear World Tilemap', description: 'Enables clean rendering above 19:9 by replacing the wrapping SNES BG with a clamped linear read. Unlocks the 21:9 wide preset.', hint: 'On, the 21:9 preset unlocks. Turning it off drops any ratio wider than 16:9 and switches Ultrawide and Tall off. Needs Extended Rendering.', keywords: 'linear tilemap world bg wrap 21:9 ultrawide memory overworld' },
      { key: 'ultrawideRendering', label: 'Ultrawide', description: 'Unlocks ratios above 19:9 up to 32:9. Requires Linear World Tilemap.', hint: 'On, the 32:9 preset unlocks. Turning it off moves a 32:9 picture back to 21:9. Needs Linear World Tilemap.', keywords: 'ultrawide 32:9 super ultrawide' },
      { key: 'tallRendering', label: 'Tall Rendering', description: 'Adds extra rows above and below, which enables tall presets in the picker. Separate from widescreen.', hint: 'On, the Tall presets appear in Aspect Ratio. Turning it off puts a tall picture back to 4:3.', keywords: 'tall portrait vertical aspect ratio height rows' },
      { key: 'aspectRatio', label: 'Aspect Ratio', description: 'Screen aspect ratio. Presets unlock as you enable capabilities above.', hint: 'Pick the shape of the game picture. The view resizes at once.', keywords: 'widescreen 4:3 16:9 16:10 21:9 32:9 tall 3:4 custom auto detect' },
      { key: 'extendY', label: 'Extend Y', description: 'Show 240 lines instead of 224.', hint: 'On, the picture shows 16 more lines of the world at the bottom.', keywords: 'height resolution vertical 240' },
      { key: 'widescreenVisualFixes', label: 'Widescreen Fixes', description: 'Corrections for a view wider or taller than the original: transitions, effects and sprites drawn for the 4:3 screen. One switch; on by default.', hint: 'On, transitions and effects drawn for 4:3 cover the whole wider view. Off shows them as the original drew them.', keywords: 'visual fixes widescreen tall tiles edges transitions iris link hide' },
      { key: 'widescreenSprites', label: 'Widescreen Sprites', description: 'Extend sprite spawn ranges so enemies and objects behave as intended in the wider view.', hint: 'On, enemies and objects appear and vanish at the edges of the wide view. Needs a ratio wider than 4:3.', keywords: 'sprites widescreen spawn despawn ranges' },
      { key: 'widescreenPlayArea', label: 'Extend Play Area', description: 'Extends game activity to the whole widescreen picture: where hazards and enemies spawn, how long enemy spawners stay active, and how much of the view a "room cleared" check looks at. Off, only the original 4:3 area counts, so the extra width you can see stays inactive. Changes gameplay.', hint: 'On, the extra width counts as part of the room for spawns and room clears. This changes gameplay.', keywords: 'play area hazards spawns room clear widescreen gameplay' },
      { key: 'offscreenAI', label: 'Off-Screen AI', description: 'How enemies in the wide/tall extra band behave before reaching the original screen.', hint: 'Pick what enemies outside the original 4:3 screen do. Each choice explains itself.', keywords: 'sprite AI pause idle freeze off screen wide guard enemy alarm', control: { kind: 'choice', options: offscreenOptions } },
    ],
  },
  {
    id: 'performance',
    title: 'Performance',
    items: [
      { key: 'displayPerfInTitle', label: 'Show FPS', description: 'Display the current frames per second, and the refresh rate of your display, in the title bar while the game is running', hint: 'On, the title bar shows the frame rate and the display refresh rate while you play.', keywords: 'fps performance frame rate counter refresh rate hz' },
      { key: 'vsync', label: 'V-Sync', description: 'Pace the game against the refresh rate of your display instead of an internal timer. Smooths scrolling on 60 Hz displays where the two clocks would otherwise drift apart. Game speed stays correct on any refresh rate.', hint: 'On, frames follow the display refresh, which smooths scrolling. Game speed stays the same either way.', keywords: 'vsync v-sync tearing judder stutter frame pacing refresh rate smooth scrolling 60hz' },
      { key: 'syncedRefreshRate', label: 'Set Synced Refresh Rate in full screen', description: 'While in fullscreen, switch the display to a refresh rate that divides evenly into the 60 frames a second the game runs at.', hint: 'On, fullscreen switches the display to a multiple of 60 Hz and puts your own rate back when you leave.', keywords: syncedRateKeywords },
      { key: 'syncedRefreshRateHz', label: 'Target Refresh Rate', description: 'Which rate to switch to. Always a multiple of 60, so every game frame is shown for the same length of time. Higher is smoother for everything else on screen; 60 is the safest if a higher rate ever misbehaves.', hint: 'Pick the rate fullscreen switches to. 60 Hz is the safest choice.', keywords: syncedRateKeywords },
    ],
  },
];

export default sections;
export { meta };

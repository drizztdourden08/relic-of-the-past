/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Window', icon: 'app-window', order: 4, keywords: ['window', 'fullscreen', 'borderless', 'viewport', 'pixel perfect'] };

const windowModes = [
  { value: 'windowed', label: 'Windowed', hint: 'A normal window you can move and resize.' },
  { value: 'borderless', label: 'Borderless', hint: 'A window with no frame or title bar.' },
];

const viewportModes = [
  { value: 'none', label: 'Letterbox', hint: 'Keeps the game ratio and fills the rest of the window with black bars.' },
  { value: 'fit', label: 'Fit Window', hint: 'Locks the window shape to the game ratio while you resize it, so no bars show.' },
  { value: 'fill', label: 'Stretch', hint: 'Stretches the picture to fill the whole window.' },
];

const sections: Section[] = [
  {
    id: 'window',
    title: 'Window',
    items: [
      { key: 'windowMode', label: 'Window Mode', description: 'Window display mode', hint: 'Pick how the window sits on the screen. It changes right away.', keywords: 'borderless windowed default', control: { kind: 'choice', options: windowModes } },
      { key: 'startFullscreen', label: 'Start in Fullscreen', description: 'Automatically enter fullscreen when the game starts', hint: 'On, starting the game puts the window in fullscreen.', keywords: 'fullscreen launch start' },
      { key: 'viewportConstraint', label: 'Viewport', description: 'Controls how the game canvas relates to the window', hint: 'Pick how the game picture fills the window.', keywords: 'ratio lock constrain aspect black bars stretch fill fit viewport', control: { kind: 'choice', options: viewportModes } },
      { key: 'pixelPerfect', label: 'Pixel Perfect', description: 'Scale the picture by whole source pixels only, so every pixel is exactly the same size. Removes the shimmer on fences, walls and other straight edges while scrolling, at the cost of slightly wider black borders. Turns Linear Filtering off while active.', hint: 'On, every game pixel is drawn at the same size, with wider black borders. Needs the Letterbox viewport.', keywords: 'pixel perfect integer scale scaling sharp crisp shimmer wobble ripple tearing nearest' },
    ],
  },
];

export default sections;
export { meta };

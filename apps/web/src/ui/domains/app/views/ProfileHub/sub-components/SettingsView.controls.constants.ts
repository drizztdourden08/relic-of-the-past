/* @layer renderer-components @kind constants */
const VIEWPORT_OPTIONS = [
  { value: 'none', label: 'Letterbox' },
  { value: 'fit', label: 'Fit Window' },
  { value: 'fill', label: 'Stretch' },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'borderless', label: 'Borderless' },
];

const OFFSCREEN_BEHAVIOUR_OPTIONS = [
  { value: 'idle', label: 'Idle' },
  { value: 'vanilla', label: 'Act normally' },
  { value: 'paused', label: 'Freeze' },
];

const OFFSCREEN_BEHAVIOUR_DESCRIPTIONS: Record<string, string> = {
  idle: 'Enemies in the extra width walk and animate normally, but will not chase, shoot or hurt you until they reach the original 4:3 screen. You can still hit them.',
  vanilla: 'Enemies behave fully everywhere, including chasing, shooting and hurting you from the extra width you can see but the original game could not. Matches the original game.',
  paused: 'Enemies in the extra width stop completely, mid-step, until they reach the original 4:3 screen. No movement, no animation, and no shadow.',
};

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  auto: 'Matches the window size, adapting to notch, resize and rotation automatically.',
  screen: 'Matches the full physical screen ratio.',
  wide: 'Choose a standard widescreen preset.',
  tall: 'Choose a tall (portrait-style) preset.',
  custom: 'Set an exact width : height ratio.',
};

export {
  ASPECT_DESCRIPTIONS, OFFSCREEN_BEHAVIOUR_DESCRIPTIONS, OFFSCREEN_BEHAVIOUR_OPTIONS,
  VIEWPORT_OPTIONS, WINDOW_MODE_OPTIONS,
};

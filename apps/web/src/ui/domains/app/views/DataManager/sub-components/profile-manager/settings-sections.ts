/* @layer renderer-components @kind logic */

const SETTINGS_SECTIONS: Array<{ title: string; keys: Array<{ key: string; label: string; format?: (v: unknown) => string }> }> = [
  {
    title: 'General',
    keys: [
      { key: 'autosave', label: 'Autosave' },
      { key: 'displayPerfInTitle', label: 'FPS Counter' },
      { key: 'vsync', label: 'V-Sync' },
      { key: 'syncedRefreshRate', label: 'Synced Refresh Rate (fullscreen)' },
      { key: 'syncedRefreshRateHz', label: 'Target Refresh Rate', format: (v) => (Number(v) > 0 ? `${v} Hz` : 'Highest') },
    ],
  },
  {
    title: 'Display',
    keys: [
      { key: 'aspectRatio', label: 'Aspect Ratio' },
      { key: 'extendY', label: 'Extend Y' },
      { key: 'cameraLockToViewport', label: 'Lock Camera to View' },
      { key: 'widescreenSprites', label: 'Widescreen Sprites' },
      { key: 'widescreenVisualFixes', label: 'Widescreen Visual Fixes' },
      { key: 'windowMode', label: 'Window Mode', format: (v) => String(v ?? 'default') },
      { key: 'startFullscreen', label: 'Start Fullscreen' },
      { key: 'viewportConstraint', label: 'Viewport Constraint', format: (v) => String(v ?? 'none') },
      { key: 'pixelPerfect', label: 'Pixel Perfect' },
    ],
  },
  {
    title: 'Graphics',
    keys: [
      { key: 'newRenderer', label: 'New Renderer' },
      { key: 'enhancedMode7', label: 'HD Mode 7' },
      { key: 'noSpriteLimits', label: 'No Sprite Limits' },
      { key: 'linearFiltering', label: 'Linear Filtering' },
      { key: 'dimFlashes', label: 'Dim Flashes' },
    ],
  },
  {
    title: 'Audio',
    keys: [
      { key: 'masterVolume', label: 'Master Volume', format: (v) => `${v ?? 100}%` },
      { key: 'musicVolume', label: 'Music Volume', format: (v) => `${v ?? 100}%` },
      { key: 'msuConfigMode', label: 'MSU Configuration', format: (v) => v === 'manual' ? 'Manual' : 'Auto' },
      { key: 'enableMSU', label: 'MSU Audio', format: (v) => v === 'false' || !v ? 'Off' : String(v) },
      { key: 'resumeMSU', label: 'Resume MSU' },
      { key: 'resetMSUAtTitle', label: 'Reset MSU at Title' },
      { key: 'audioFreq', label: 'Audio Frequency', format: (v) => `${v ?? 44100} Hz` },
      { key: 'audioChannels', label: 'Audio Channels', format: (v) => v === 1 ? 'Mono' : 'Stereo' },
      { key: 'audioSamples', label: 'Audio Samples', format: (v) => String(v ?? 2048) },
    ],
  },
  {
    title: 'Gameplay',
    keys: [
      { key: 'itemSwitchLR', label: 'Item Switch L/R' },
      { key: 'itemSwitchLRLimit', label: 'Item Switch L/R Limit' },
      { key: 'turnWhileDashing', label: 'Turn While Dashing' },
      { key: 'mirrorToDarkworld', label: 'Mirror to Dark World' },
      { key: 'collectItemsWithSword', label: 'Collect Items with Sword' },
      { key: 'breakPotsWithSword', label: 'Break Pots with Sword' },
      { key: 'disableLowHealthBeep', label: 'Disable Low Health Beep' },
      { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress' },
      { key: 'disableTelepathy', label: 'Disable Telepathic Messages' },
      { key: 'showMaxItemsInYellow', label: 'Show Max Items in Yellow' },
      { key: 'moreActiveBombs', label: 'More Active Bombs' },
      { key: 'carryMoreRupees', label: 'Carry More Rupees' },
      { key: 'miscBugFixes', label: 'Misc Bug Fixes' },
      { key: 'gameChangingBugFixes', label: 'Gameplay-altering bug fixes' },
      { key: 'cancelBirdTravel', label: 'Cancel Bird Travel' },
    ],
  },
];

const formatSettingValue = (value: unknown, format?: (v: unknown) => string): string => {
  if (format) return format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value == null) return '-';
  return String(value);
};

export { formatSettingValue, SETTINGS_SECTIONS };

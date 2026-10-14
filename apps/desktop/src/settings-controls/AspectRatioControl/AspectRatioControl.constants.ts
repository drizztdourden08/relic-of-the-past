/* @layer renderer-components @kind constants */
const PRESET_GROUP_IDS = ['wide', 'tall', 'preset'] as const;

const PRESET_FALLBACK: Readonly<Record<(typeof PRESET_GROUP_IDS)[number], string>> = {
  wide: '16:9',
  tall: '3:4',
  preset: '16:9',
};

export { PRESET_FALLBACK, PRESET_GROUP_IDS };

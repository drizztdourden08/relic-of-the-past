/* @layer website-site @kind constants */
const COLLAGE_TEXT = {
  expand: (label: string): string => `Expand: ${label}`,
  promote: (label: string): string => `Show in the main picture: ${label}`,
} as const;

export { COLLAGE_TEXT };

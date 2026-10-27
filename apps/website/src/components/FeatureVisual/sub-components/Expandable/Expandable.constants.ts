/* @layer website-site @kind constants */
const EXPANDABLE_TEXT = {
  expand: (label: string): string => `Expand: ${label}`,
} as const;

export { EXPANDABLE_TEXT };

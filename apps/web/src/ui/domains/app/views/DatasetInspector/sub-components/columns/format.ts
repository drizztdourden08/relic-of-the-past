/* @layer renderer-app @kind logic */

/** The primary display name and, when it differs, the alternate wording underneath it. */
const nameParts = (
  vanillaName: string | undefined,
  randomizerName: string | undefined,
  fallbackId: string,
): { primary: string; secondary?: string } => {
  const primary = randomizerName ?? vanillaName ?? fallbackId;
  const secondary = vanillaName && vanillaName !== primary ? vanillaName : undefined;
  return { primary, secondary };
};

/** A taxonomy value ('keyDrop', 'two-way') to a scannable label ('Key Drop', 'Two Way'). */
const humanize = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, first => first.toUpperCase());

export { humanize, nameParts };

/* @layer renderer-components @kind logic */
/**
 * The one rule every reference's display text goes through, whichever kit
 * renders it: `id-ref-kit`'s own single-value cell, and `array-kit`'s per-entry
 * chip for a list of references. Centralised here instead of duplicated at
 * each call site, so a screen/table/record view never disagrees with another
 * about what a reference is supposed to read like.
 */

/**
 * `"Name (id)"` once a name resolves to something other than the id itself;
 * the bare id otherwise. Never dangling, empty parens.
 */
const formatIdRefDisplay = (id: string, resolved?: string): string => {
  const name = resolved?.trim();
  return name && name !== id ? `${name} (${id})` : id;
};

export { formatIdRefDisplay };

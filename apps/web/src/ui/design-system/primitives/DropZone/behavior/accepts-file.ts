/* @layer renderer-components @kind logic */
/**
 * Whether a file matches one entry of a drop zone's `accept` list, the way a file input
 * reads it: an extension (".msul") matches the end of the name, a type ("image/png") the
 * file's type, and a family ("image/*") any type in it.
 */
const acceptsFile = (file: File, pattern: string): boolean => {
  const want = pattern.toLowerCase();
  if (!want.includes('/')) return file.name.toLowerCase().endsWith(want);
  const type = file.type.toLowerCase();
  return want.endsWith('/*') ? type.startsWith(want.slice(0, -1)) : type === want;
};

export { acceptsFile };

/* @layer renderer-components @kind logic */
/**
 * Whether a file matches one entry of a drop zone's `accept` list, the way a file input
 * reads it: an extension (".msul") matches the end of the name, a type ("image/png") the
 * file's type, and a family ("image/*") any type in it.
 */
/** A media type against one pattern; an extension pattern never matches a bare type. */
const acceptsType = (type: string, pattern: string): boolean => {
  const want = pattern.toLowerCase();
  if (!want.includes('/')) return false;
  const have = type.toLowerCase();
  return want.endsWith('/*') ? have.startsWith(want.slice(0, -1)) : have === want;
};

const acceptsFile = (file: File, pattern: string): boolean =>
  (pattern.includes('/') ? acceptsType(file.type, pattern) : file.name.toLowerCase().endsWith(pattern.toLowerCase()));

export { acceptsFile, acceptsType };

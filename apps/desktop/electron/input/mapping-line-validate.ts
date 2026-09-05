/* @layer electron-main @kind logic */
/**
 * Validates a single gamecontrollerdb.txt line before it is registered live or
 * appended to the user's db: at least a GUID, a name, and one button/axis binding.
 */

// SDL's GUID is historically 32 hex chars and can run longer on newer revisions,
// so any long enough hex run is accepted. SDL also uses the literal "xinput" as a
// pseudo-GUID for its built-in generic XInput mapping.
const GUID_PATTERN = /^[0-9a-fA-F]{24,}$/;
const XINPUT_PSEUDO_GUID = 'xinput';

const isRealBinding = (field: string): boolean =>
  field.length > 0 && field.includes(':') && !field.startsWith('platform:');

/** A blank line, a comment (starting with '#'), or anything short of
 *  GUID + name + one real binding is rejected. */
const isMappingLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return false;

  const fields = trimmed.split(',').map((field) => field.trim());
  if (fields.length < 3) return false;

  const [guid, name, ...bindings] = fields;
  if (guid !== XINPUT_PSEUDO_GUID && !GUID_PATTERN.test(guid)) return false;
  if (!name) return false;

  return bindings.some(isRealBinding);
};

export { isMappingLine };

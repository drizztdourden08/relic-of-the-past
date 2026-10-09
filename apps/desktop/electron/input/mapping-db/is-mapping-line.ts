/* @layer electron-main @kind logic */
import { GUID_PATTERN, XINPUT_PSEUDO_GUID } from './mapping-db.constants';

const isRealBinding = (field: string): boolean =>
  field.length > 0 && field.includes(':') && !field.startsWith('platform:');

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

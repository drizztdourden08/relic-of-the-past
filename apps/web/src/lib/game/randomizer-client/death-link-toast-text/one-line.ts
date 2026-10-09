/* @layer bridge-wasm @kind logic */
import { ELLIPSIS, MAX_CAUSE_LENGTH } from './death-link-toast-text.constants';

const oneLine = (cause: string): string => {
  const flat = cause.replace(/\s+/g, ' ').trim();
  return flat.length > MAX_CAUSE_LENGTH
    ? `${flat.slice(0, MAX_CAUSE_LENGTH - ELLIPSIS.length).trimEnd()}${ELLIPSIS}`
    : flat;
};

export { oneLine };

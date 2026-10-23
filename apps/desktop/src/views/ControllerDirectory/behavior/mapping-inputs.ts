/* @layer renderer-components @kind logic */
import { MAPPING_HEADER_FIELDS, NON_CONTROL_KEYS } from '../ControllerDirectory.constants';

const mappingInputs = (mapping: string): number =>
  mapping
    .split(',')
    .slice(MAPPING_HEADER_FIELDS)
    .filter((field) => {
      const colon = field.indexOf(':');
      return colon > 0 && !NON_CONTROL_KEYS.has(field.slice(0, colon));
    })
    .length;

export { mappingInputs };

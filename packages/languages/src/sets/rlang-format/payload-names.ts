/* @layer shared-storage @kind logic */
import { SET_FORMAT } from '../format-2';
import { SET_FILES } from '@rotp/hub-contracts';

const payloadNames = (format: number): string[] => [
  SET_FILES.dialogue,
  SET_FILES.text,
  ...(format >= SET_FORMAT ? [SET_FILES.variables] : [SET_FILES.glossary, SET_FILES.names]),
  SET_FILES.font,
  SET_FILES.fontWidth,
];

export { payloadNames };

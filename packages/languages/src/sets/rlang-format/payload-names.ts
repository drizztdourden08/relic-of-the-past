/* @layer shared-storage @kind logic */
import { SET_FILES } from '@rotp/hub-contracts';

const payloadNames = (): string[] => [
  SET_FILES.dialogue,
  SET_FILES.text,
  SET_FILES.variables,
  SET_FILES.font,
  SET_FILES.fontWidth,
];

export { payloadNames };

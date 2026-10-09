/* @layer shared-hud @kind data */
import bottomRightJson from '../built-in/bottom-right.json';
import compactJson from '../built-in/compact.json';
import defaultJson from '../built-in/default.json';

const BUILT_IN_SOURCES = [
  { json: defaultJson, source: 'built-in/default.json' },
  { json: compactJson, source: 'built-in/compact.json' },
  { json: bottomRightJson, source: 'built-in/bottom-right.json' },
] as const;

export { BUILT_IN_SOURCES };

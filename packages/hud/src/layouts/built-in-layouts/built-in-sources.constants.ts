/* @layer shared-hud @kind data */
import bottomRightJson from '../../../data/layouts/bottom-right.json';
import compactJson from '../../../data/layouts/compact.json';
import defaultJson from '../../../data/layouts/default.json';

const BUILT_IN_SOURCES = [
  { json: defaultJson, source: 'built-in/default.json' },
  { json: compactJson, source: 'built-in/compact.json' },
  { json: bottomRightJson, source: 'built-in/bottom-right.json' },
] as const;

export { BUILT_IN_SOURCES };

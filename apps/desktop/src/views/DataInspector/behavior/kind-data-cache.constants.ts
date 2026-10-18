/* @layer renderer-app @kind constants */
import type { InspectorSource, KindData } from '../DataInspector.type';

const builtKindData = new WeakMap<InspectorSource, KindData>();

export { builtKindData };

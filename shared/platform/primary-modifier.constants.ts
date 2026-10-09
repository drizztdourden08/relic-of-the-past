/* @layer shared-platform @kind constants */
import type { OsKind } from '@drizztdourden08/brock-core';

const USES_META: ReadonlySet<OsKind> = new Set<OsKind>(['macos', 'ios']);

export { USES_META };

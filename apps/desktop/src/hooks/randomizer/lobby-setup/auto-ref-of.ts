/* @layer renderer-lib @kind logic */
import type { RefStrategy } from './lobby-ref-of.type';

const autoRefOf: RefStrategy = (draft) => (draft.joinToken === null ? null : { joinToken: draft.joinToken });

export { autoRefOf };

/* @layer renderer-lib @kind logic */
import type { ServerStrategy } from './lobby-server-of.type';
import { remoteAddressOf } from './remote-address-of';

const typedServerOf: ServerStrategy = (draft) => remoteAddressOf(draft.address);

export { typedServerOf };

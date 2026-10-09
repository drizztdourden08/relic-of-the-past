/* @layer bridge-wasm @kind logic */
import type { ApNetworkItem } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';

const senderNameOf = (ctx: OnlineContext, item: ApNetworkItem): string => ctx.names.playerName(item.player);

export { senderNameOf };

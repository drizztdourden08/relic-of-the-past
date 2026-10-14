/* @layer bridge-wasm @kind types */
import type { ApServerPacket, BouncedHandler, OnlineContext } from '@rotp/randomizer';

type PacketOf<C extends ApServerPacket['cmd']> = Extract<ApServerPacket, { cmd: C }>;

type PacketHandler = (ctx: OnlineContext, packet: ApServerPacket, onBounced: BouncedHandler) => void;

type PacketHandlers = Readonly<Partial<Record<ApServerPacket['cmd'], PacketHandler>>>;

export type { PacketHandler, PacketHandlers, PacketOf };

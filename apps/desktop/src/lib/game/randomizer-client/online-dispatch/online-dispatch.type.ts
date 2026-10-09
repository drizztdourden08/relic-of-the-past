/* @layer bridge-wasm @kind types */
import type { ApBouncedPacket } from '../ap-protocol.type';

type BouncedHandler = (packet: ApBouncedPacket) => void;

export type { BouncedHandler };

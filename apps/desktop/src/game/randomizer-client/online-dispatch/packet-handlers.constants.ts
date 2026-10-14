/* @layer bridge-wasm @kind constants */
import { handleDataPackage, handleRoomInfo } from '../online-data-package';
import { handleConnected } from '../online-connected';
import { handleReceivedItems } from '../online-received';
import { handleLocationInfo } from '../online-scouted';
import { handlePrintJson, handleRoomUpdate } from '../online-messages';
import { asPacketHandler } from './as-packet-handler';
import { handleInvalid } from './handle-invalid';
import { handleRefused } from './handle-refused';
import type { PacketHandlers, PacketOf } from './online-dispatch.type';

const PACKET_HANDLERS: PacketHandlers = {
  RoomInfo: asPacketHandler(handleRoomInfo),
  DataPackage: asPacketHandler(handleDataPackage),
  Connected: asPacketHandler(handleConnected),
  ConnectionRefused: asPacketHandler(handleRefused),
  ReceivedItems: asPacketHandler(handleReceivedItems),
  LocationInfo: asPacketHandler((ctx, packet: PacketOf<'LocationInfo'>) => {
    void handleLocationInfo(ctx, packet);
  }),
  RoomUpdate: asPacketHandler(handleRoomUpdate),
  PrintJSON: asPacketHandler(handlePrintJson),
  Bounced: asPacketHandler((_ctx, packet: PacketOf<'Bounced'>, onBounced) => {
    onBounced(packet);
  }),
  InvalidPacket: asPacketHandler(handleInvalid),
};

export { PACKET_HANDLERS };

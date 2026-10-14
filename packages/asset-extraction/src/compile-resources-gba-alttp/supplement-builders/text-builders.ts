/* @layer shared-asset-extraction @kind logic */
import { uint32Buffer } from '../uint32-buffer';
import type { SupplementBuilders, SupplementContext } from './supplement-builders.type';

const textBuilders = (context: SupplementContext): SupplementBuilders => {
  const { assets, text, portText, handlers, roomTagHandlers } = context;
  return {
    kGbaAlttpTextIds: () => assets.addUint16('kGbaAlttpTextIds', text.map(message => message.id)),
    kGbaAlttpTextNative: () => assets.addPacked('kGbaAlttpTextNative', text.map(message => message.bytes)),
    kGbaAlttpTextPortUs: () => assets.addPacked('kGbaAlttpTextPortUs', portText.map(message => Buffer.from(message))),
    kGbaAlttpEntityHandlerTypes: () => assets.addUint8('kGbaAlttpEntityHandlerTypes', handlers.map(handler => handler.type)),
    kGbaAlttpEntityHandlers: () => assets.addUint8('kGbaAlttpEntityHandlers', [...uint32Buffer(handlers.map(handler => handler.thumbAddress))]),
    kGbaAlttpRoomTagHandlerTags: () => assets.addUint8('kGbaAlttpRoomTagHandlerTags', roomTagHandlers.map(handler => handler.tag)),
    kGbaAlttpRoomTagHandlers: () => assets.addUint8('kGbaAlttpRoomTagHandlers', [...uint32Buffer(roomTagHandlers.map(handler => handler.thumbAddress))]),
  };
};

export { textBuilders };

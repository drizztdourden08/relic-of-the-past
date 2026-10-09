/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import type { ApInvalidPacket, OnlineContext } from '@rotp/randomizer';

const handleInvalid = (ctx: OnlineContext, packet: ApInvalidPacket): void => {
  log.randomizer(`[Online] Server refused a ${packet.original_cmd ?? 'packet'}: ${packet.text}`, 'warn');
  const scoutRefusedBeforeArming = packet.original_cmd === 'LocationScouts' && !ctx.room.scouted;
  if (scoutRefusedBeforeArming) {
    ctx.fail('[Online] Session refused: the server would not say what the locations hold');
  }
};

export { handleInvalid };

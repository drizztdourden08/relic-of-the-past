/* @layer bridge-wasm @kind types */
/** What every per-packet handler of the online client shares. */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ApClientPacket } from './ap-protocol.type';
import type { ForeignOwners } from './foreign-item-line';
import type { NameTables } from './ap-names';
import type { MessageLog } from './message-log';
import type { CheckReporter, OnlineCore } from './online-core.type';
import type { GoalReporter } from './online-goal';
import type { ScoutMaps } from './online-overrides';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';

interface OnlineContext {
  readonly config: OnlineSessionConfig;
  readonly game: string;
  readonly core: OnlineCore;
  readonly room: OnlineRoom;
  readonly maps: ScoutMaps;
  readonly names: NameTables;
  readonly messages: MessageLog;
  readonly goal: GoalReporter;
  readonly reporter: CheckReporter;
  send(packet: ApClientPacket): void;
  /** Ends the session with an error: no reconnect follows. |logLine| replaces |message| in the log. */
  fail(message: string, logLine?: string): void;
  /** The server accepted the slot: status goes active and the backoff ladder resets. */
  markConnected(): void;
  /** False once the session was stopped: an arm still in flight must undo itself. */
  isLive(): boolean;
  /** The scouts became this placement, shown with who owns each foreign item (the Spoiler tab). */
  setPlacement(placement: Placement, foreignOwners?: ForeignOwners): void;
  /** DeathLink on or off for the rest of the session: the gate bit and the room link. */
  setDeathLink(enabled: boolean): void;
}

export type { OnlineContext };

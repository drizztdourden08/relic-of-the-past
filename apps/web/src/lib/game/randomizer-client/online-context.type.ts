/* @layer bridge-wasm @kind types */
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
  fail(message: string, logLine?: string): void;
  markConnected(): void;
  isLive(): boolean;
  setPlacement(placement: Placement, foreignOwners?: ForeignOwners): void;
  setDeathLink(enabled: boolean): void;
}

export type { OnlineContext };

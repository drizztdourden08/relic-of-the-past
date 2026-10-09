/* @layer bridge-wasm @kind types */
import type { ApClientPacket } from './ap-protocol.type';
import type { GoalReporter } from './online-goal';
import type { OnlineRoom } from './online-room';
import type { ScoutMaps } from './online-overrides';

interface CheckReporterDeps {
  room: OnlineRoom;
  maps: ScoutMaps;
  goal: GoalReporter;
  send(packet: ApClientPacket): void;
}

export type { CheckReporterDeps };

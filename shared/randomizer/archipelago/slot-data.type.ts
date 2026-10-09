/* @layer shared-game @kind types */

interface RotpPreRolled {
  pondDemands?: unknown;
  shopPrices?: unknown;
  capacity?: unknown;
  deliverable?: unknown;
}

interface RotpSlotData {
  worldVersion: string;
  seed?: string;
  options: Record<string, string | number | boolean>;
  medallions: { mire: string; turtleRock: string };
  preRolled?: RotpPreRolled;
  deathLink: boolean;
}

type ParsedSlotData =
  | { kind: 'ok'; slotData: RotpSlotData }
  | { kind: 'malformed' }
  | { kind: 'version'; message: string };

export type { ParsedSlotData, RotpPreRolled, RotpSlotData };

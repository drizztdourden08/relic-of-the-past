/* @layer renderer-widgets @kind types */
import type { MouseEvent } from 'react';
import type { CapacityRung, CheatCategory } from '@app/lib/game';
import type { ControlHint } from './sub-components/ControlHint.type';

type CheatTab = 'player' | 'items' | 'rules' | 'checks';

type PointerHintState = {
  title: string;
  items: readonly ControlHint[];
  x: number;
  y: number;
};

type PointerHintApi = {
  show: (title: string, items: readonly ControlHint[], e: MouseEvent) => void;
  move: (e: MouseEvent) => void;
  hide: () => void;
};

type CapacityLadder = {
  ladder: CapacityRung[];
  rung: number;
  cap: number;
  settable: boolean;
  seeded: boolean;
  set: (rung: number) => void;
};

type CheatGates = {
  enabled: boolean;
  allowed: Record<CheatCategory, boolean>;
  reason: (category: CheatCategory) => string;
};

type CheatTabProps = {
  gates: CheatGates;
};

export type { CapacityLadder, CheatGates, CheatTab, CheatTabProps, PointerHintApi, PointerHintState };

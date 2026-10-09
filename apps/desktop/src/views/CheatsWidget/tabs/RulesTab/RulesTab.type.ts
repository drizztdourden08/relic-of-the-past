/* @layer renderer-widgets @kind types */
import type { CheatCategory } from '@app/game';

type TileSpec = {
  id: string;
  label: string;
  name: string;
  sprite: string;
  category: CheatCategory;
};

type RuleTileSpec = TileSpec & {
  read: () => boolean;
  write: (on: boolean) => void;
};

type Rung = {
  value: number;
  label: string;
};

type RungTileSpec = TileSpec & {
  rungs: Rung[];
  read: () => number;
  write: (value: number) => void;
};

type ActionTileSpec = TileSpec & {
  run: () => void;
};

type TileState = 'on' | 'off' | 'disabled';

type ActionTileProps = {
  spec: ActionTileSpec;
  reason?: string;
};

type RuleTileProps = {
  spec: RuleTileSpec;
  checked: boolean;
  reason?: string;
  onChange: (on: boolean) => void;
};

type RungTileProps = {
  spec: RungTileSpec;
  value: number;
  reason?: string;
  onChange: (value: number) => void;
};

export type { ActionTileProps, ActionTileSpec, Rung, RuleTileProps, RuleTileSpec, RungTileProps, RungTileSpec, TileSpec, TileState };

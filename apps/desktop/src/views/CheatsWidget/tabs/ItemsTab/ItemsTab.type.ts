/* @layer renderer-widgets @kind types */
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { DungeonItemKind } from '@app/game';

type SlotKind = 'flag' | 'ladder' | 'byValue' | 'bottle';

type SlotPlace = 'grid' | 'equipment' | 'ability';

type TierOption = {
  value: number;
  label: string;
  sprite: string | null;
  receiveItemId?: number;
};

type SlotSpec = {
  slot: number;
  kind: SlotKind;
  nameKey: string;
  place: SlotPlace;
  tiers: TierOption[];
};

type SlotWrite =
  | { op: 'give'; receiveItemId: number; label: string }
  | { op: 'set'; slot: number; value: number };

type OpenSlot = {
  spec: SlotSpec;
  anchor: HTMLElement;
};

type SlotName = {
  lines: string[];
  sprite: string | null;
  owned: boolean;
};

type SpriteOf = (value: number) => string | null;

type EquipmentBytes = {
  sword: number; shield: number; armor: number;
  gloves: number; boots: number; flippers: number; moonPearl: number;
};

type SlotClickParams = {
  onOpen: (open: OpenSlot) => void;
  write: (write: SlotWrite) => void;
};

type Flash = { slot: number; n: number } | null;

type PanelProps = {
  scale: number;
  spritesBase: string;
};

type SlotPanelProps = PanelProps & {
  specs: Map<number, SlotSpec>;
  onHover: (slot: number | null) => void;
  onOpen: (open: OpenSlot) => void;
};

type AbilitiesEditorProps = SlotPanelProps & {
  write: (write: SlotWrite) => void;
};

type ItemGridEditorProps = AbilitiesEditorProps & {
  hovered: number | null;
};

type DungeonItem = { kind: DungeonItemKind; type: string; col: number; label: string };

type GearSlot = { slot: number; type: string; col: number };

type ItemNamePanelProps = PanelProps & {
  name: SlotName;
  hovering: boolean;
};

type ProgressView = 'pendants' | 'crystals';

type SlotCellProps = {
  size: number;
  height?: number;
  owned: boolean;
  menu: boolean;
  ghost: string | null;
  title: string;
  flash?: boolean;
  style?: CSSProperties;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onOpenList?: (e: MouseEvent<HTMLButtonElement>) => void;
  onHover: (active: boolean) => void;
  children?: ReactNode;
};

type TierListProps = {
  open: OpenSlot;
  spritesBase: string;
  write: (write: SlotWrite) => void;
  onClose: () => void;
};

export type {
  AbilitiesEditorProps, DungeonItem, EquipmentBytes, Flash, GearSlot, ItemGridEditorProps, ItemNamePanelProps, OpenSlot, PanelProps, ProgressView,
  SlotCellProps, SlotClickParams, SlotKind, SlotName, SlotPanelProps, SlotPlace, SlotSpec, SlotWrite, SpriteOf, TierListProps, TierOption,
};

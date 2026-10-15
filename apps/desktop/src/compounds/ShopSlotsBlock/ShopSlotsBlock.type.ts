/* @layer renderer-components @kind types */
import type { RetroBowSetting, ShopScope, ShopWorld } from '@rotp/randomizer';

interface ShopSlotsBlockProps {
  scope: ShopScope;
  retroBow?: RetroBowSetting;
  onChange?: (next: ShopScope) => void;
}

interface ShopScopeSummary {
  ticked: number;
  opened: number;
  depth: number;
  locations: number;
  counts: boolean;
  active: boolean;
}

interface ShopSlotToggleModel {
  key: string;
  label: string;
  canonicalIndex: number;
  checked: boolean;
}

interface ShopCardModel {
  id: string;
  name: string;
  world: ShopWorld;
  stock: string;
  offByDefault: boolean;
  slots: readonly ShopSlotToggleModel[];
  noneOn: boolean;
}

interface ShopSectionModel {
  world: ShopWorld;
  title: string;
  cards: readonly ShopCardModel[];
}

interface ShopCountSlider {
  kind: 'slider';
  value: number;
  max: number;
  description: string;
}

interface ShopCountReadout {
  kind: 'readout';
  value: string;
  description: string;
}

type ShopCountControl = ShopCountSlider | ShopCountReadout;

interface RetroShelfNote {
  quiverShelf: string;
  quiverPrice: number;
  refill: string;
  refillPrice: number;
  otherShelves: readonly string[];
}

interface ShopSlotCardProps {
  card: ShopCardModel;
  disabled: boolean;
  readout?: boolean;
  onSlotChange?: (canonicalIndex: number, checked: boolean) => void;
}

interface ShopSlotCountProps {
  summary: ShopScopeSummary;
  disabled: boolean;
  readout?: boolean;
  onChange?: (slotCount: number) => void;
}

interface ShopSlotSectionProps {
  section: ShopSectionModel;
  disabled: boolean;
  readout?: boolean;
  onSlotChange?: (canonicalIndex: number, checked: boolean) => void;
}

export type {
  RetroShelfNote, ShopCardModel, ShopCountControl, ShopScopeSummary,
  ShopSectionModel, ShopSlotCardProps, ShopSlotCountProps, ShopSlotSectionProps, ShopSlotToggleModel,
  ShopSlotsBlockProps,
};

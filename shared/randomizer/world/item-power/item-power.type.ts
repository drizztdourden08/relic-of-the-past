/* @layer shared-game @kind types */
import type { OptionDef } from '../options.type';

interface ItemPowerSetting {
  catchFairies: boolean;
  byrnaInvulnerable: boolean;
  capeDoubleMagic: boolean;
  silverArrowsAnywhere: boolean;
  powderFairy: boolean;
  hammerTablets: boolean;
  swordlessMedallions: boolean;
  pullableCurtains: boolean;
  hammerLastFight: boolean;
  hammerTowerSeal: boolean;
}

type ItemPowerOptionSeed = Omit<OptionDef, 'description'>;

export type { ItemPowerOptionSeed, ItemPowerSetting };

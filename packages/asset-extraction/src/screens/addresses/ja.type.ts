/* @layer shared-asset-extraction @kind types */
import type { ScreenAddressTable, SelectFileTable, TableRegion } from '../screen-payload.type';

interface JaSpriteLayoutSource {
  readonly table: TableRegion;
  readonly startX: number;
  readonly startY: number;
}

interface JaScreenAddressTable extends Omit<ScreenAddressTable, 'id' | 'nameGrid' | 'selectFile'> {
  readonly id: 'ja-v1.0' | 'ja-rev1';
  readonly selectFile: Readonly<Partial<Record<SelectFileTable, TableRegion>>>;
  readonly nameGridAddress: number;
  readonly creditsScrollY: TableRegion;
  readonly copyrightOam: JaSpriteLayoutSource;
  readonly plateOam: JaSpriteLayoutSource;
  readonly titleYLimit: number;
  readonly titlePalettes: readonly TableRegion[];
}

export type { JaScreenAddressTable, JaSpriteLayoutSource };

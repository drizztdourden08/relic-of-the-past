/* @layer shared-asset-extraction @kind types */
import type { CreditsSource, EndingCaptionSource, PauseTable, SelectFileTable, TableRegion } from '../screen-payload.type';

interface JaScreenAddressTable {
  readonly id: 'ja-v1.0' | 'ja-rev1';
  readonly menuTilemaps: readonly number[];
  readonly selectFile: Readonly<Partial<Record<SelectFileTable, TableRegion>>>;
  readonly nameGridAddress: number;
  readonly pauseText: Readonly<Record<PauseTable, TableRegion>>;
  readonly dungeonMapLabels: TableRegion;
  readonly creditsDigits: TableRegion;
  readonly creditsScrollY: TableRegion;
  readonly endingCaptions: EndingCaptionSource;
  readonly credits: CreditsSource;
  readonly sheetPointers: { readonly spr: number; readonly bg: number };
  readonly sheets: { readonly spr: readonly number[]; readonly bg: readonly number[] };
}

export type { JaScreenAddressTable };
